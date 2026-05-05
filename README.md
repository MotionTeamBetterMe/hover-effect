# Notion Slide Gallery Widget

Static responsive slide gallery for Notion `/embed`, hosted on GitHub Pages.

Live URL:

```text
https://motionteambetterme.github.io/hover-effect/
```

## Edit Slides

Slides are edited in one file:

```text
src/slides.js
```

Each slide needs only:

```js
{
  title: 'Slide title',
  image: 'https://example.com/image.jpg'
}
```

Use image URLs that open without login. Notion private file URLs are not reliable for a public embed.

After editing `src/slides.js`, commit to `main`. GitHub Actions deploys the updated widget automatically.

## Local Development

```bash
npm install
npm run dev
```

Local URL is usually:

```text
http://localhost:5173/
```

## Checks

```bash
npm test
npm run build
```

## GitHub Pages

Deployment workflow:

```text
.github/workflows/deploy.yml
```

Pages must use:

```text
Settings -> Pages -> Build and deployment -> Source: GitHub Actions
```

## Notion Embed

1. In Notion, type `/embed`.
2. Paste:

```text
https://motionteambetterme.github.io/hover-effect/
```

3. Resize the embed block height as needed.

The overlay uses the iframe viewport, not the browser Fullscreen API.
