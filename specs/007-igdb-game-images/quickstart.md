# Quickstart: IGDB Game Images with Wikipedia Fallback

**Feature**: 007-igdb-game-images
**Date**: 2026-03-17

## Prerequisites

1. **Node.js 18+** installed (for the enrichment script)
2. **Twitch Developer account** (free): https://dev.twitch.tv/console
3. **Twitch application registered** → obtain `Client ID` and `Client Secret`

## Setup

### 1. Get Twitch/IGDB Credentials

1. Go to https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Name: anything (e.g., "SEGA Graph Enrichment")
4. OAuth Redirect URL: `http://localhost` (not used, but required)
5. Category: "Application Integration"
6. Copy the **Client ID** and generate a **Client Secret**

### 2. Configure Environment

Create a `.env` file in the project root (already in `.gitignore`):

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

## Running the Enrichment

```powershell
# From the project root
node scripts/enrich-thumbnails.mjs
```

The script will:
1. Authenticate with Twitch to get an IGDB access token
2. Read `src/data/nodes.json`
3. For each game node:
   - Search IGDB by title with arcade platform filter
   - Match by release year if multiple results
   - Set `thumbnail` to IGDB cover art URL (`t_cover_big` size)
   - If no IGDB match: try Wikipedia REST API for page thumbnail
   - If no Wikipedia image: try Wikidata P18 property
4. Write updated `src/data/nodes.json`
5. Print summary report

### Expected Output

```
=== IGDB Game Image Enrichment ===
Processing 157 game nodes...

[  1/157] Hang-On           → IGDB ✓ (co1wyy)
[  2/157] Space Harrier      → IGDB ✓ (co2abc)
[  3/157] Fantasy Zone       → IGDB ✓ (co3def)
...
[155/157] Periscope          → IGDB ✗ → Wikipedia ✓
[156/157] Head On            → IGDB ✗ → Wikipedia ✗ → No image
[157/157] Monaco GP          → IGDB ✗ → Wikidata ✓

=== Summary ===
Total games:        157
IGDB matches:       120
Wikipedia fallback:  15
Wikidata fallback:    5
No image found:      17
Previously had thumb: 13 (0 regressions)
```

## Verification

### 1. Validate data integrity

```powershell
.\validate-data.ps1
```

All checks should pass — the enrichment only modifies `thumbnail` fields.

### 2. Visual check

```powershell
.\serve.ps1
```

Open the application and click on game nodes. Verify:
- Games that previously showed no image now display cover art
- Images load correctly without broken links
- Detail panel layout is not distorted

### 3. Re-running

The script is idempotent. Running it again will:
- Skip games that already have an IGDB thumbnail
- Retry games that still have `null` thumbnails (in case IGDB/Wikipedia added coverage)
- Never overwrite a valid thumbnail with `null`

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `401 Unauthorized` from IGDB | Check `.env` credentials. Token may have expired — delete cached token and re-run. |
| `429 Too Many Requests` | Script handles this automatically with backoff. If persistent, wait a few minutes. |
| Wrong game matched | Check the enrichment log for the game title. If mismatched, manually correct in `nodes.json`. |
| Image not loading in browser | IGDB CDN may be temporarily down. The URL format is stable; try again later. |
| `.env` not found | Create the file in the project root with `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`. |
