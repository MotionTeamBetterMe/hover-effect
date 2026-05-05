import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const NOTION_VERSION = '2022-06-28';

export function extractSlideFromNotionPage(page) {
  const properties = page?.properties || {};
  const published = firstExistingProperty(properties, ['Published', 'Checkbox']);

  if (published?.type === 'checkbox' && published.checkbox === false) {
    return null;
  }

  const title = readTextProperty(firstExistingProperty(properties, ['Title', 'Name']));
  const image = readImageProperty(firstExistingProperty(properties, ['Image', 'URL']));

  if (!title || !image) {
    return null;
  }

  const orderProperty = firstExistingProperty(properties, ['Order', 'Number']);
  const order = orderProperty?.type === 'number' ? orderProperty.number : null;

  return {
    title,
    image,
    ...(typeof order === 'number' ? { order } : {}),
  };
}

function firstExistingProperty(properties, names) {
  return names.map((name) => properties[name]).find(Boolean);
}

export function sortSlidesForGallery(slides) {
  return [...slides]
    .sort((left, right) => {
      const leftOrder = typeof left.order === 'number' ? left.order : Number.POSITIVE_INFINITY;
      const rightOrder = typeof right.order === 'number' ? right.order : Number.POSITIVE_INFINITY;

      return leftOrder - rightOrder;
    })
    .map(({ title, image }) => ({ title, image }));
}

export async function fetchNotionSlides({ token, databaseId, fetchImpl = fetch }) {
  if (!token) {
    throw new Error('Missing NOTION_TOKEN.');
  }

  if (!databaseId) {
    throw new Error('Missing NOTION_DATABASE_ID.');
  }

  const pages = [];
  let cursor;

  do {
    const response = await fetchImpl(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Notion API request failed: ${response.status} ${message}`);
    }

    const payload = await response.json();
    pages.push(...payload.results);
    cursor = payload.has_more ? payload.next_cursor : undefined;
  } while (cursor);

  return sortSlidesForGallery(pages.map(extractSlideFromNotionPage).filter(Boolean));
}

export async function writeSlidesModule(slides, outputPath) {
  const body = `export const slides = ${JSON.stringify(slides, null, 2)};\n`;
  await writeFile(outputPath, body, 'utf8');
}

function readTextProperty(property) {
  if (!property) {
    return '';
  }

  if (property.type === 'title') {
    return property.title.map((item) => item.plain_text).join('').trim();
  }

  if (property.type === 'rich_text') {
    return property.rich_text.map((item) => item.plain_text).join('').trim();
  }

  return '';
}

function readImageProperty(property) {
  if (!property) {
    return '';
  }

  if (property.type === 'url') {
    return property.url?.trim() || '';
  }

  if (property.type === 'files') {
    const firstFile = property.files[0];

    if (firstFile?.type === 'external') {
      return firstFile.external.url?.trim() || '';
    }

    if (firstFile?.type === 'file') {
      return firstFile.file.url?.trim() || '';
    }
  }

  return '';
}

async function main() {
  const slides = await fetchNotionSlides({
    token: process.env.NOTION_TOKEN,
    databaseId: process.env.NOTION_DATABASE_ID,
  });

  if (!slides.length) {
    throw new Error('Notion database returned no published slides with Title and Image.');
  }

  const currentFile = fileURLToPath(import.meta.url);
  const projectRoot = resolve(dirname(currentFile), '..');
  await writeSlidesModule(slides, resolve(projectRoot, 'src/slides.js'));
  await writeSlidesJson(slides, resolve(projectRoot, 'public/slides.json'));
  console.log(`Synced ${slides.length} slide(s) from Notion.`);
}

export async function writeSlidesJson(slides, outputPath) {
  await writeFile(outputPath, `${JSON.stringify(slides, null, 2)}\n`, 'utf8');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
