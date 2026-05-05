export function createSlidesUrl({
  basePath = './slides.json',
  cacheKey = Date.now(),
  locationHref = window.location.href,
} = {}) {
  const url = new URL(basePath, locationHref);
  url.searchParams.set('v', String(cacheKey));
  return url;
}

export async function loadSlides({
  fetchImpl = fetch,
  cacheKey = Date.now(),
  basePath = './slides.json',
  locationHref = window.location.href,
} = {}) {
  const response = await fetchImpl(createSlidesUrl({ basePath, cacheKey, locationHref }), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Unable to load slides: ${response.status}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Slides JSON must be an array.');
  }

  return payload;
}

export function getSlidesSignature(slides) {
  return JSON.stringify(slides);
}
