# Notion Slide Gallery Widget

Static responsive slide gallery for Notion `/embed`, hosted on GitHub Pages.

The production widget can read slides from a private Notion database during GitHub Actions builds. The final GitHub Pages site is public so Notion can embed it, but the Notion database and API token stay private.

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

## Notion Database Setup

Create a Notion database named `Slides` with these properties:

| Property | Type | Required |
| --- | --- | --- |
| `Title` | Title | Yes |
| `Image` | URL or Files & media | Yes |
| `Order` | Number | No |
| `Published` | Checkbox | No |

If `Published` exists and is unchecked, the slide is skipped. If `Order` exists, lower numbers appear first.

## Notion Integration

1. Open [Notion integrations](https://www.notion.so/my-integrations).
2. Create an internal connection.
3. Copy the internal integration secret.
4. Open the `Slides` database in Notion.
5. Use `...` -> `Connections` and add the integration to the database.
6. Copy the database URL and extract the 32-character database ID.

## GitHub Secrets

Add these repository secrets:

```text
NOTION_TOKEN
NOTION_DATABASE_ID
```

Repository secrets page:

```text
https://github.com/MotionTeamBetterMe/hover-effect/settings/secrets/actions
```

## Deployment

The repo has two workflows:

```text
.github/workflows/deploy.yml
.github/workflows/sync-notion.yml
```

`Deploy to GitHub Pages` runs on push to `main`. If Notion secrets exist, it syncs slides before build.

`Sync Notion Slides` runs manually and every 15 minutes. It reads Notion, builds the site, and deploys to GitHub Pages.

Live URL:

```text
https://motionteambetterme.github.io/hover-effect/
```

## Notion Embed

1. In Notion, type `/embed`.
2. Paste:

```text
https://motionteambetterme.github.io/hover-effect/
```

3. Resize the embed block height as needed.

The overlay uses the iframe viewport, not the browser Fullscreen API.
