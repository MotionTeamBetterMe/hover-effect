import { describe, expect, it } from 'vitest';
import { extractSlideFromNotionPage, sortSlidesForGallery } from './notion-slides.mjs';

describe('Notion slide sync', () => {
  it('extracts a published slide from Title and Image properties', () => {
    const slide = extractSlideFromNotionPage({
      properties: {
        Title: {
          type: 'title',
          title: [{ plain_text: 'Launch visual' }],
        },
        Image: {
          type: 'url',
          url: 'https://example.com/launch.jpg',
        },
        Order: {
          type: 'number',
          number: 2,
        },
        Published: {
          type: 'checkbox',
          checkbox: true,
        },
      },
    });

    expect(slide).toEqual({
      title: 'Launch visual',
      image: 'https://example.com/launch.jpg',
      order: 2,
    });
  });

  it('supports the default Notion column names from a new table', () => {
    const slide = extractSlideFromNotionPage({
      properties: {
        Name: {
          type: 'title',
          title: [{ plain_text: 'Default table slide' }],
        },
        URL: {
          type: 'url',
          url: 'https://example.com/default.jpg',
        },
        Number: {
          type: 'number',
          number: 4,
        },
        Checkbox: {
          type: 'checkbox',
          checkbox: true,
        },
      },
    });

    expect(slide).toEqual({
      title: 'Default table slide',
      image: 'https://example.com/default.jpg',
      order: 4,
    });
  });

  it('ignores unpublished pages', () => {
    const slide = extractSlideFromNotionPage({
      properties: {
        Title: {
          type: 'title',
          title: [{ plain_text: 'Draft visual' }],
        },
        Image: {
          type: 'url',
          url: 'https://example.com/draft.jpg',
        },
        Published: {
          type: 'checkbox',
          checkbox: false,
        },
      },
    });

    expect(slide).toBeNull();
  });

  it('sorts slides by Order while preserving unordered slides after ordered ones', () => {
    expect(
      sortSlidesForGallery([
        { title: 'Third', image: 'https://example.com/3.jpg', order: 3 },
        { title: 'No order', image: 'https://example.com/no.jpg' },
        { title: 'First', image: 'https://example.com/1.jpg', order: 1 },
      ]),
    ).toEqual([
      { title: 'First', image: 'https://example.com/1.jpg' },
      { title: 'Third', image: 'https://example.com/3.jpg' },
      { title: 'No order', image: 'https://example.com/no.jpg' },
    ]);
  });
});
