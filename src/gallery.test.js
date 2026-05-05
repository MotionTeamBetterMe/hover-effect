import { describe, expect, it } from 'vitest';
import { getAdjacentSlideIndex, getPreferredTheme, normalizeSlides } from './gallery.js';

describe('gallery behavior', () => {
  it('cycles slide navigation in both directions', () => {
    expect(getAdjacentSlideIndex(0, -1, 4)).toBe(3);
    expect(getAdjacentSlideIndex(3, 1, 4)).toBe(0);
    expect(getAdjacentSlideIndex(1, 1, 4)).toBe(2);
  });

  it('normalizes slide data without requiring optional fields', () => {
    const slides = normalizeSlides([
      {
        title: 'Strategy',
        image: '/slides/strategy.jpg',
      },
    ]);

    expect(slides).toEqual([
      {
        id: 'strategy',
        title: 'Strategy',
        description: '',
        image: '/slides/strategy.jpg',
        tag: '',
        link: '',
      },
    ]);
  });

  it('rejects slides that are missing required editable fields', () => {
    expect(() => normalizeSlides([{ title: 'Missing image' }])).toThrow(
      'Slide 1 must include title and image.',
    );
  });

  it('uses the system theme preference', () => {
    expect(getPreferredTheme({ systemPrefersDark: true })).toBe('dark');
    expect(getPreferredTheme({ systemPrefersDark: false })).toBe('light');
  });
});
