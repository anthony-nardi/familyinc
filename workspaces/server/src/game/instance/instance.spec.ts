import { Instance } from '@app/game/instance/instance';
import { ChipValues } from '@familyinc/shared/common/GameState';

type FakeClient = {
  id: string;
  data: {
    lobby: any;
    color: string;
    userName: string;
    isHost: boolean;
    isBot: boolean;
  };
  shouldPassTurn?: () => boolean;
};

function makeClient(
  id: string,
  isBot = false,
  shouldPassTurn?: () => boolean,
): FakeClient {
  return {
    id,
    data: { lobby: null, color: 'green', userName: id, isHost: false, isBot },
    shouldPassTurn,
  };
}

function makeLobby(clients: FakeClient[]) {
  return {
    clients: new Map(clients.map((c) => [c.id, c])),
    dispatchLobbyState: jest.fn(),
    dispatchToLobby: jest.fn(),
  };
}

function chipCounts(instance: Instance, clientId: string) {
  const held = instance.chipsHeld.get(clientId)!;
  const counts: Record<string, number> = {};
  held.forEach((count, value) => {
    if (count) counts[value] = count;
  });
  return counts;
}

function setHeld(
  instance: Instance,
  clientId: string,
  counts: Partial<Record<ChipValues, number>>,
) {
  const held = instance.chipsHeld.get(clientId)!;
  for (const [value, count] of Object.entries(counts)) {
    held.set(value as ChipValues, count as number);
  }
}

describe('Instance', () => {
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    // Always pick the first element: makes the "random" starting player and chip draws deterministic.
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  function startGame(ids = ['alice', 'bob']) {
    const clients = ids.map((id) => makeClient(id));
    const lobby = makeLobby(clients);
    const instance = new Instance(lobby as any);
    instance.triggerStart(lobby.clients as any);
    return { instance, lobby, clients };
  }

  it('starts with zeroed scores, chips and diamonds and a turn order', () => {
    const { instance, lobby } = startGame();

    expect(instance.hasStarted).toBe(true);
    expect(instance.currentPlayer).toBe('alice');
    expect(instance.turnOrder).toEqual(['alice', 'bob']);
    expect(instance.scores.get('alice')).toBe(0);
    expect(instance.scores.get('bob')).toBe(0);
    expect(instance.diamondsHeld.get('alice')).toBe(0);
    expect(chipCounts(instance, 'alice')).toEqual({});
    expect(instance.chips).toHaveLength(135);
    expect(lobby.dispatchToLobby).toHaveBeenCalledWith(
      'server.game.message',
      expect.objectContaining({ message: 'Game started!' }),
    );
  });

  it('does not start twice', () => {
    const { instance, lobby } = startGame();
    const callsAfterFirstStart = lobby.dispatchToLobby.mock.calls.length;

    instance.triggerStart(lobby.clients as any);

    expect(lobby.dispatchToLobby.mock.calls.length).toBe(callsAfterFirstStart);
  });

  it('drawing a new value keeps the chip and removes it from the bag', () => {
    const { instance, clients } = startGame();
    instance.chips = ['3', '7'];

    const drawn = instance.drawChip(clients[0] as any);

    expect(drawn).toBe('3');
    expect(chipCounts(instance, 'alice')).toEqual({ '3': 1 });
    expect(instance.chips).toEqual(['7']);
    expect(instance.currentPlayer).toBe('alice');
  });

  it('busting with two or fewer distinct chips loses the chips, grants a diamond and passes the turn', () => {
    const { instance, lobby, clients } = startGame();
    setHeld(instance, 'alice', { '3': 1, '5': 1 });
    instance.chips = ['3', '9'];

    instance.drawChip(clients[0] as any);

    expect(chipCounts(instance, 'alice')).toEqual({});
    expect(instance.diamondsHeld.get('alice')).toBe(1);
    expect(instance.currentPlayer).toBe('bob');
    expect(lobby.dispatchToLobby).toHaveBeenCalledWith(
      'server.game.message',
      expect.objectContaining({
        message: expect.stringContaining('receives a diamond'),
      }),
    );
  });

  it('busting with three or more distinct chips grants no diamond', () => {
    const { instance, lobby, clients } = startGame();
    setHeld(instance, 'alice', { '3': 1, '5': 1, '8': 1 });
    instance.chips = ['3', '9'];

    instance.drawChip(clients[0] as any);

    expect(chipCounts(instance, 'alice')).toEqual({});
    expect(instance.diamondsHeld.get('alice')).toBe(0);
    expect(instance.currentPlayer).toBe('bob');
    expect(lobby.dispatchToLobby).toHaveBeenCalledWith(
      'server.game.message',
      expect.objectContaining({
        message: expect.stringContaining('No diamond given'),
      }),
    );
    expect(lobby.dispatchToLobby).toHaveBeenCalledWith('server.game.sound', {
      sound: 'bust',
    });
  });

  it('a third diamond is cashed in for 50 points', () => {
    const { instance, clients } = startGame();
    instance.diamondsHeld.set('alice', 2);
    setHeld(instance, 'alice', { '3': 1 });
    instance.chips = ['3', '9'];

    instance.drawChip(clients[0] as any);

    expect(instance.diamondsHeld.get('alice')).toBe(0);
    expect(instance.scores.get('alice')).toBe(50);
    expect(instance.currentPlayer).toBe('bob');
    expect(instance.hasFinished).toBe(false);
  });

  it('refills the bag from everything not currently held when it runs out', () => {
    const { instance, clients } = startGame();
    setHeld(instance, 'bob', { '10': 2 });
    instance.chips = ['1'];

    instance.drawChip(clients[0] as any);

    // 135 total minus the two 10s bob is holding. Known quirk: the chip that
    // was just drawn is not yet counted as "in play" when the bag refills, so
    // alice's 1 is put back into the bag as well.
    expect(instance.chips).toHaveLength(133);
    expect(instance.chips.filter((c) => c === '10')).toHaveLength(9);
    expect(instance.chips.filter((c) => c === '1')).toHaveLength(16);
  });

  it('passing steals matching chips, then scores and clears the next player', () => {
    const { instance, clients } = startGame();
    setHeld(instance, 'alice', { '3': 1, '7': 1 });
    setHeld(instance, 'bob', { '3': 2, '9': 1 });

    instance.passTurn(clients[0] as any);

    expect(chipCounts(instance, 'alice')).toEqual({ '3': 3, '7': 1 });
    expect(instance.currentPlayer).toBe('bob');
    expect(instance.scores.get('bob')).toBe(9);
    expect(chipCounts(instance, 'bob')).toEqual({});
    expect(instance.scores.get('alice')).toBe(0);
  });

  it('scores the chips you held at the start of your turn', () => {
    const { instance, clients } = startGame();
    setHeld(instance, 'alice', { '3': 3, '7': 1 });

    instance.passTurn(clients[0] as any); // to bob
    instance.passTurn(clients[1] as any); // back to alice, who now scores

    expect(instance.scores.get('alice')).toBe(16);
    expect(chipCounts(instance, 'alice')).toEqual({});
  });

  it('finishes the game when a player reaches 100 points', () => {
    const { instance, lobby, clients } = startGame();
    instance.scores.set('bob', 95);
    setHeld(instance, 'bob', { '9': 1 });

    instance.passTurn(clients[0] as any);

    expect(instance.scores.get('bob')).toBe(104);
    expect(instance.winner).toBe('bob');
    expect(instance.hasFinished).toBe(true);
    expect(lobby.dispatchToLobby).toHaveBeenCalledWith(
      'server.game.message',
      expect.objectContaining({ message: 'Game finished!' }),
    );
  });

  it('lets a bot take its turn after a short delay', () => {
    // Jest 28 on Node 20 cannot fake `performance`; the option exists at runtime
    // but is missing from the bundled @types/jest 27 typings.
    jest.useFakeTimers({ doNotFake: ['performance'] } as any);
    const human = makeClient('alice');
    const bot = makeClient('bot_0', true, () => true);
    const lobby = makeLobby([human, bot]);
    const instance = new Instance(lobby as any);
    instance.triggerStart(lobby.clients as any);

    instance.passTurn(human as any);
    expect(instance.currentPlayer).toBe('bot_0');

    jest.advanceTimersByTime(2000);

    expect(instance.currentPlayer).toBe('alice');
  });
});
