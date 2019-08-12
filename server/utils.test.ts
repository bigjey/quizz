import { shuffle } from './utils';

describe('utils#shuffle', () => {
  const arr = [1, 2, 'a', null, undefined];
  const result = shuffle(arr);

  it('should return array of same length', () => {
    expect(result).toHaveLength(arr.length);
  });

  it('should return same values', () => {
    expect(result.sort()).toEqual(arr.sort());
  });
});
