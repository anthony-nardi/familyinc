import {
  getInitialChips,
  getPlayersHeldChips,
  isPlayerHoldingMoreThan2Chips,
} from '@app/game/instance/utils';
import { ChipValues } from '@familyinc/shared/common/GameState';

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

describe('getInitialChips', () => {
  it('builds the 135 chip bag: 16 each of 1-5 and 11 each of 6-10', () => {
    const chips = getInitialChips();
    expect(chips).toHaveLength(135);
    for (let value = 1; value <= 5; value++) {
      expect(chips.filter((c) => c === `${value}`)).toHaveLength(16);
    }
    for (let value = 6; value <= 10; value++) {
      expect(chips.filter((c) => c === `${value}`)).toHaveLength(11);
    }
  });

  it('returns a fresh array every time', () => {
    expect(getInitialChips()).not.toBe(getInitialChips());
  });
});

describe('isPlayerHoldingMoreThan2Chips', () => {
  it('counts distinct chip values, not total chips', () => {
    expect(isPlayerHoldingMoreThan2Chips(held({}))).toBe(false);
    expect(isPlayerHoldingMoreThan2Chips(held({ '1': 5 }))).toBe(false);
    expect(isPlayerHoldingMoreThan2Chips(held({ '1': 1, '2': 1 }))).toBe(false);
    expect(
      isPlayerHoldingMoreThan2Chips(held({ '1': 1, '2': 1, '3': 1 })),
    ).toBe(true);
  });

  it('treats a missing player as holding nothing', () => {
    expect(isPlayerHoldingMoreThan2Chips(undefined)).toBe(false);
  });
});

describe('getPlayersHeldChips', () => {
  it('lists the chip values a player holds', () => {
    const chipsHeld = new Map([
      ['alice', held({ '2': 1, '7': 3 })],
      ['bob', held({})],
    ]);

    expect(getPlayersHeldChips(chipsHeld, 'alice')).toEqual(['2', '7']);
    expect(getPlayersHeldChips(chipsHeld, 'bob')).toEqual([]);
    expect(getPlayersHeldChips(chipsHeld, 'nobody')).toEqual([]);
  });
});
