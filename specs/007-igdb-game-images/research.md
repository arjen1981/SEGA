# Research: IGDB Game Images with Wikipedia Fallback

**Feature**: 007-igdb-game-images
**Date**: 2026-03-17

## Research Task 1: IGDB API Authentication

**Decision**: Use Twitch OAuth Client Credentials flow (server-to-server, no user auth needed).

**Rationale**: IGDB is owned by Twitch. All API access requires a Twitch Developer app registration (free). The flow is straightforward: POST to Twitch token endpoint → receive bearer token → include `Client-ID` and `Authorization: Bearer <token>` headers on all IGDB requests. Tokens last ~60 days.

**Key details**:
- Token endpoint: `POST https://id.twitch.tv/oauth2/token` with `client_id`, `client_secret`, `grant_type=client_credentials`
- Required headers on every IGDB request: `Client-ID: <client_id>` + `Authorization: Bearer <token>`
- No scopes needed for IGDB read access
- Max 25 active tokens per app

**Alternatives considered**: None — Twitch OAuth is the only authentication method for IGDB.

---

## Research Task 2: IGDB Game Search & Matching Strategy

**Decision**: Use Apicalypse `search` query with arcade platform filter (`platforms = (52)`) and release year verification as secondary disambiguator.

**Rationale**: IGDB's Apicalypse query language allows combining `search` (relevance-sorted fuzzy match) with `where` filters. The generic Arcade platform ID in IGDB is **52** — IGDB does not distinguish between SEGA-specific arcade boards (System 16, Model 2, Naomi, etc.), which simplifies filtering. Adding a release year window (±2 years) as a secondary filter handles title collisions (e.g., "Columns" matching multiple games).

**Query template**:
```
search "{title}";
fields name, cover.image_id, first_release_date;
where platforms = (52) & version_parent = null;
limit 5;
```

**Matching algorithm**:
1. Search IGDB by exact title with arcade platform filter
2. If multiple results: prefer the result whose `first_release_date` year is closest to the node's `releaseYear`
3. If no results: retry with normalized title (strip colons, subtitles, special characters)
4. If still no results: fall through to Wikipedia fallback

**Alternatives considered**:
- Exact name match (`where name = "..."`) — rejected: too brittle for title variations
- No platform filter — rejected: too many false positives across console versions

---

## Research Task 3: IGDB Cover Art Image URLs

**Decision**: Use `cover_big` size (264×374 px) for thumbnail URLs stored in `nodes.json`.

**Rationale**: The `cover_big` size provides good visual quality for the detail panel at 264×374 px — large enough to be recognizable but not oversized for a side panel. This matches the approximate display size used in the existing detail panel. The CDN URL format is stable and publicly accessible without authentication.

**CDN URL format**: `https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg`

**Available sizes** (for reference):
| Size | Dimensions | Use case |
|------|-----------|----------|
| `thumb` | 90×90 | Too small |
| `cover_small` | 90×128 | Too small |
| `cover_big` | 264×374 | **Selected** — ideal for detail panel |
| `720p` | 1280×720 | Too large, wrong aspect ratio |

**Alternatives considered**:
- `cover_small` (90×128) — rejected: too low resolution for modern displays
- `720p` (1280×720) — rejected: landscape orientation, excessive bandwidth for a thumbnail
- `cover_big_2x` (528×748) — considered but rejected: unnecessary for current detail panel size

---

## Research Task 4: IGDB Rate Limits & Batch Strategy

**Decision**: Implement 250ms delay between requests (4 req/sec) with batch cover expansion.

**Rationale**: IGDB free tier allows 4 requests per second. Exceeding this returns HTTP 429. For 157 games, using the `cover.image_id` expansion in the game search query avoids separate cover requests, reducing total API calls to ~157 searches (one per game). At 4 req/sec with 250ms delays, this completes in ~40 seconds.

**Key details**:
- Rate limit: 4 requests/second per Client-ID
- No documented daily limit
- HTTP 429 response when exceeded
- Batch strategy: expand `cover.image_id` in game query → single request per game
- Total estimated time: ~40 seconds for 157 games (without retries)

**Alternatives considered**:
- Batch search (multiple titles per request) — rejected: Apicalypse `search` only accepts one search term
- No rate limiting — rejected: would hit 429 errors immediately

---

## Research Task 5: Wikipedia/Wikidata Fallback

**Decision**: Use Wikipedia REST API (`/api/rest_v1/page/summary/{title}`) as primary fallback, with Wikidata P18 property as secondary fallback.

**Rationale**: The Wikipedia page summary API returns a `thumbnail.source` URL directly — the simplest approach. Since every game node already has a `wikipediaUrl`, we can extract the article title from it. For games where the Wikipedia article has no image, the Wikidata API can check the P18 (image) property using the existing `wikidataId`.

**Fallback chain**:
1. Extract article title from `wikipediaUrl` (e.g., `https://en.wikipedia.org/wiki/Fantasy_Zone` → `Fantasy_Zone`)
2. GET `https://en.wikipedia.org/api/rest_v1/page/summary/Fantasy_Zone`
3. If response contains `thumbnail.source` → use it
4. If not, query Wikidata: GET `https://www.wikidata.org/w/api.php?action=wbgetentities&ids={wikidataId}&props=claims&format=json`
5. Extract P18 claim → construct Wikimedia Commons URL: `https://commons.wikimedia.org/wiki/Special:FilePath/{filename}?width=300`

**Rate limits**: Wikipedia allows 200 req/sec with proper User-Agent. Wikidata similar. A polite 100ms delay is sufficient.

**Alternatives considered**:
- SPARQL query for P18 — rejected: adds unnecessary complexity for a simple property lookup
- Wikipedia Action API (`pageimages` prop) — viable alternative but REST API is simpler

---

## Research Task 6: Title Normalization for Matching

**Decision**: Implement a normalization pipeline: lowercase, strip special characters, collapse whitespace, handle common SEGA title patterns.

**Rationale**: SEGA arcade titles have several patterns that complicate exact matching:
- Special characters: "Dynamite Düx", "Alien³: The Gun"
- Colons and subtitles: "Golden Axe: The Revenge of Death Adder"
- Roman numerals vs arabic: "Virtua Fighter III" vs "Virtua Fighter 3"
- Parenthetical disambiguation: Wikipedia uses "(video game)" suffixes

**Normalization steps**:
1. Lowercase the title
2. Replace accented characters with ASCII equivalents (ü→u, é→e)
3. Strip punctuation (except spaces and hyphens)
4. Collapse multiple spaces to single space
5. Trim whitespace

**For IGDB matching**: Use the raw title first (IGDB's search handles fuzzy matching well), then fall back to normalized title if zero results.

**Alternatives considered**:
- Manual IGDB slug mapping — rejected: too labor-intensive for 157 games
- Levenshtein distance matching — overly complex for this use case; IGDB search already handles fuzzy matching
