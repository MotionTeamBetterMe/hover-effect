# Notion Slide Gallery Widget

Static responsive slide gallery for Notion `/embed`, hosted on GitHub Pages.

Live URL:

```text
https://motionteambetterme.github.io/hover-effect/
```

## Notion Sync

The widget can read slides from a Notion database during GitHub Actions builds. The GitHub Pages URL stays public for Notion embed, but the Notion token and database stay private in GitHub Secrets.

Required Notion database properties:

| Property | Type | Required |
| --- | --- | --- |
| `Title` | Title | Yes |
| `Image` | URL or Files & media | Yes |
| `Order` | Number | No |
| `Published` | Checkbox | No |

If `Published` exists and is unchecked, the slide is skipped. If `Order` exists, lower numbers appear first.

Required GitHub repository secrets:

```text
NOTION_TOKEN
NOTION_DATABASE_ID
```

After both secrets are set, run:

```text
Actions -> Sync Notion Slides -> Run workflow
```

The sync workflow also runs every 15 minutes.

## Edit Slides

Fallback slides are edited in one file:

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

If Notion secrets are configured, production uses Notion data during deployment. If secrets are missing, production uses `src/slides.js`.

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
