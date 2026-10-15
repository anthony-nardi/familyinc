import { CarefulBot } from '@app/game/bots/CarefulBot';
import { RandomBot } from '@app/game/bots/RandomBot';
import { RiskyBot } from '@app/game/bots/RiskyBot';
import { RuthlessBot } from '@app/game/bots/RuthlessBot';
import { SimpleBot } from '@app/game/bots/SimpleBot';
import { StealyBot } from '@app/game/bots/StealyBot';
import { ChipsHeld } from '@app/game/types';
import { ChipValues } from '@familyinc/shared/common/GameState';

const ME = 'bot';
const OPPONENT = 'opponent';

function held(entries: Partial<Record<ChipValues, number>>) {
  const map = new Map<ChipValues, number>();
  for (let i = 1; i <= 10; i++) {
    map.set(`${i}` as ChipValues, 0);
  }
  for (const [value, count] of Object.entries(entries)) {
    map.set(value as ChipValues, count as number);
  }
  return map;
}

function table(
  mine: Partial<Record<ChipValues, number>>,
  theirs: Partial<Record<ChipValues, number>> = {},
): ChipsHeld {
  return new Map([
    [ME, held(mine)],
    [OPPONENT, held(theirs)],
  ]);
}

const botData = {
  lobby: null as any,
  color: 'red',
  isHost: false,
  isBot: true,
};

describe('SimpleBot and RuthlessBot', () => {
  it.each([
    ['SimpleBot', new SimpleBot({ id: ME, data: botData })],
    ['RuthlessBot', new RuthlessBot({ id: ME, data: botData })],
  ])('%s passes once it holds three distinct values', (_name, bot) => {
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1 }))).toBe(false);
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1 }))).toBe(true);
    expect(bot.shouldPassTurn(table({ '1': 4 }))).toBe(false);
  });

  it('names itself', () => {
    expect(new SimpleBot({ id: ME, data: botData }).data.userName).toBe(
      'Simple Bot',
    );
    expect(new RuthlessBot({ id: ME, data: botData }).data.userName).toBe(
      'Ruthless',
    );
  });
});

describe('RiskyBot', () => {
  const bot = new RiskyBot({ id: ME, data: botData });

  it('keeps drawing until it holds more than three distinct values', () => {
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1 }))).toBe(false);
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1, '4': 1 }))).toBe(
      true,
    );
  });
});

describe('CarefulBot', () => {
  const bot = new CarefulBot({ id: ME, data: botData });

  it('passes as soon as it can steal something', () => {
    expect(bot.shouldPassTurn(table({ '3': 1 }, { '3': 2 }))).toBe(true);
  });

  it('keeps drawing while opponents hold chips it cannot steal', () => {
    expect(bot.shouldPassTurn(table({ '1': 1 }, { '5': 1 }))).toBe(false);
    expect(
      bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1 }, { '5': 1 })),
    ).toBe(true);
  });

  it('passes at three distinct values when nobody else holds anything', () => {
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1 }))).toBe(false);
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1 }))).toBe(true);
  });
});

describe('StealyBot', () => {
  const bot = new StealyBot({ id: ME, data: botData });

  it('passes as soon as it can steal something', () => {
    expect(bot.shouldPassTurn(table({ '3': 1 }, { '3': 2 }))).toBe(true);
  });

  it('pushes to five distinct values while opponents hold unmatched chips', () => {
    expect(
      bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1, '4': 1 }, { '9': 1 })),
    ).toBe(false);
    expect(
      bot.shouldPassTurn(
        table({ '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 }, { '9': 1 }),
      ),
    ).toBe(true);
  });

  it('passes at exactly three distinct values when nobody else holds anything', () => {
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1 }))).toBe(false);
    expect(bot.shouldPassTurn(table({ '1': 1, '2': 1, '3': 1 }))).toBe(true);
  });
});

describe('RandomBot', () => {
  const bot = new RandomBot({ id: ME, data: botData });

  it('keeps drawing while it holds nothing', () => {
    expect(bot.shouldPassTurn(table({}, { '4': 1 }))).toBe(false);
  });

  it('passes once it holds any chip and there is another player', () => {
    expect(bot.shouldPassTurn(table({ '2': 1 }, {}))).toBe(true);
    expect(bot.shouldPassTurn(table({ '2': 1 }, { '2': 1 }))).toBe(true);
  });
});
