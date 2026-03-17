# Implementation Plan: IGDB Game Images with Wikipedia Fallback

**Branch**: `007-igdb-game-images` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-igdb-game-images/spec.md`

## Summary

Populate `thumbnail` URLs for 144 game nodes currently without images in `nodes.json`, using IGDB as the primary image source and Wikipedia/Wikimedia Commons as fallback. A Node.js enrichment script queries the IGDB API (via Twitch OAuth) by game title + release year, retrieves cover art CDN URLs, and writes them back to `nodes.json`. Games not found on IGDB fall back to Wikidata P18 image property or the Wikipedia page thumbnail. The application itself requires zero code changes — the detail panel already renders any valid `thumbnail` URL.

## Technical Context

**Language/Version**: Node.js 18+ (enrichment script); static HTML/CSS/JS (application — unchanged)
**Primary Dependencies**: vis-network 9.1.9 (CDN, unchanged); `node-fetch` or built-in `fetch` (Node 18+) for IGDB/Wikipedia API calls
**Storage**: Two JSON files: `src/data/nodes.json`, `src/data/edges.json` (only `nodes.json` modified)
**Testing**: QUnit (browser-based, `tests/index.html`) — existing tests unchanged; enrichment script validated via summary report + `validate-data.ps1`
**Target Platform**: Enrichment script runs on developer machine (Windows/PowerShell + Node.js). Application serves modern desktop browsers.
**Project Type**: Single static web application + offline data enrichment tooling
**Performance Goals**: Enrichment completes all 157 game nodes within 10 minutes including rate limit pauses. Application render performance unaffected (data-only change to `thumbnail` field).
**Constraints**: IGDB requires free Twitch Developer credentials (client ID + secret). IGDB rate limit: 4 requests/second. Wikipedia API: polite usage (1 req/sec with User-Agent). IGDB image CDN URLs must be publicly accessible without auth.
**Scale/Scope**: 157 game nodes to process. Target: 75%+ coverage (118+ with thumbnails, up from 13).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Readability | ✅ PASS | Enrichment script is new standalone tooling with clear single responsibility. Application code unchanged. |
| II. User-Centric Design | ✅ PASS | Images dramatically improve the visual experience. User explicitly requested this feature. |
| III. Test-Driven QA (NON-NEGOTIABLE) | ✅ PASS | No application code changes → existing tests sufficient. Enrichment script validated by summary report output (FR-009) and `validate-data.ps1`. |
| IV. Consistent Code Standards | ✅ PASS | Enrichment script uses Biome-compatible JS conventions. JSON output follows established `nodes.json` schema. |
| V. Performance & Accessibility | ✅ PASS | Only `thumbnail` URLs change — no impact on graph rendering. Images already lazy-loaded (`loading="lazy"`) in detail panel. |
| VI. Wikipedia Source of Truth (NON-NEGOTIABLE) | ✅ PASS | Constitution v1.2.0 added a media asset exception to Principle VI: images MAY be sourced from specialized open databases (e.g., IGDB) when Wikipedia coverage is insufficient. IGDB usage is limited to `thumbnail` URLs on game nodes; all textual data remains Wikipedia-sourced. |

**Gate result: PASS** — All principles satisfied. Principle VI media asset exception (v1.2.0) explicitly covers IGDB image sourcing.

## Project Structure

### Documentation (this feature)

```text
specs/007-igdb-game-images/
├── plan.md              # This file
├── research.md          # Phase 0: IGDB API mechanics, matching strategy, fallback logic
├── data-model.md        # Phase 1: thumbnail field enrichment model
├── quickstart.md        # Phase 1: step-by-step enrichment guide
├── contracts/           # Phase 1: updated node schema with thumbnail source tracking
│   └── nodes.schema.json
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── data/
│   └── nodes.json       # MODIFIED: thumbnail fields populated (144 nulls → URLs)
├── index.html           # UNCHANGED
├── css/styles.css       # UNCHANGED
└── js/                  # UNCHANGED (all .js files)

scripts/
└── enrich-thumbnails.mjs  # NEW: Node.js enrichment script (IGDB + Wikipedia fallback)

tests/                   # UNCHANGED (all test files)
```

**Structure Decision**: One new file added: `scripts/enrich-thumbnails.mjs` — a standalone Node.js script for offline data enrichment. Application source is unchanged. The `scripts/` directory is new and follows the convention of keeping tooling separate from application code.

## Complexity Tracking

No constitution violations to justify. Principle VI media asset exception (v1.2.0) covers IGDB image sourcing.
