import { describe, expect, it, vi } from 'vitest';
import { createSlidesUrl, getSlidesSignature, loadSlides } from './slides-loader.js';

describe('slides loader', () => {
  it('adds a cache-busting query to the slides JSON URL', () => {
    const url = createSlidesUrl({
      cacheKey: 'manual-refresh',
      locationHref: 'https://motionteambetterme.github.io/hover-effect/',
    });

    expect(url.pathname).toBe('/hover-effect/slides.json');
    expect(url.searchParams.get('v')).toBe('manual-refresh');
  });

  it('loads slides from JSON without browser cache', async () => {
    const slides = [{ title: 'Updated', image: 'https://example.com/updated.png' }];
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => slides,
    }));

    await expect(
      loadSlides({
        fetchImpl,
        cacheKey: 123,
        locationHref: 'https://motionteambetterme.github.io/hover-effect/',
      }),
    ).resolves.toEqual(slides);
    expect(fetchImpl).toHaveBeenCalledWith(expect.any(URL), { cache: 'no-store' });
    expect(fetchImpl.mock.calls[0][0].searchParams.get('v')).toBe('123');
  });

  it('creates stable signatures for comparing slide payloads', () => {
    expect(getSlidesSignature([{ title: 'A', image: 'one.png' }])).toBe(
      '[{"title":"A","image":"one.png"}]',
    );
  });
});
