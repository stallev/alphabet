import { describe, expect, it } from 'vitest';

import { format } from './format';

describe('format', () => {
  it('substitutes placeholders', () => {
    expect(format('Привет, {name}', { name: 'Анна' })).toBe('Привет, Анна');
  });

  it('leaves missing keys unchanged', () => {
    expect(format('Привет, {name}', {})).toBe('Привет, {name}');
  });
});
