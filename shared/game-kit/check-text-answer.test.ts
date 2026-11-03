import { describe, expect, it } from 'vitest';

import { checkTextAnswer } from './check-text-answer';

describe('checkTextAnswer', () => {
  it('matches ignoring case', () => {
    expect(checkTextAnswer('Answer', 'answer')).toBe(true);
  });

  it('trims leading and trailing spaces on input', () => {
    expect(checkTextAnswer('  hello  ', 'hello')).toBe(true);
  });

  it('trims spaces on the reference answer', () => {
    expect(checkTextAnswer('hello', '  hello  ')).toBe(true);
  });

  it('returns false for empty input', () => {
    expect(checkTextAnswer('', 'hello')).toBe(false);
    expect(checkTextAnswer('   ', 'hello')).toBe(false);
  });

  it('returns false for empty reference', () => {
    expect(checkTextAnswer('hello', '')).toBe(false);
    expect(checkTextAnswer('hello', '   ')).toBe(false);
  });
});
