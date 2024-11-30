import { getCurrentDate } from '../src/utils';
import { describe, expect, test } from 'vitest';

describe('util functions', () => {
  describe('getCurrentDate', () => {
    test.each([
      { tzOffset: -5, description: 'Negative offset' },
      { tzOffset: 0, description: 'Zero offset' },
      { tzOffset: 4, description: 'Positive offset' },
    ])(
      'should return the current date with the specified timezone offset ($description)',
      ({ tzOffset }) => {
        const result = getCurrentDate(tzOffset);

        const tzOffsetMilliseconds = Math.abs(tzOffset) * 60 * 60 * 1000;

        let expectedMilliseconds = 0;
        if (Math.sign(tzOffset) < 0) {
          expectedMilliseconds = Date.now() - tzOffsetMilliseconds;
        } else {
          expectedMilliseconds = Date.now() + tzOffsetMilliseconds;
        }

        expect(result.getTime()).toBe(expectedMilliseconds);
      }
    );
  });
});
