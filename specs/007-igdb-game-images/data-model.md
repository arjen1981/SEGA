# Data Model: IGDB Game Images with Wikipedia Fallback

**Feature**: 007-igdb-game-images
**Date**: 2026-03-17
**Input**: spec.md, research.md

## Overview

This feature modifies **one field** on existing game nodes — no schema changes, no new fields, no new node types, no code changes.

The `thumbnail` field on game nodes (currently `null` for 144 of 157 games) is populated with image URLs from two sources:

1. **IGDB** (primary): Cover art CDN URL — `https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg`
2. **Wikimedia Commons** (fallback): Page thumbnail — `https://upload.wikimedia.org/wikipedia/...`

---

## Entity Schema (Unchanged)

### Game Node — `thumbnail` field

```json
{
  "id": "string (kebab-case)",
  "label": "string",
  "group": "game",
  "summary": "string",
  "releaseYear": "integer",
  "genre": "string",
  "wikipediaUrl": "string",
  "wikidataId": "string (Q-number)",
  "thumbnail": "string|null"  ← THIS FIELD IS ENRICHED
}
```

**Before enrichment** (144 games):
```json
"thumbnail": null
```

**After enrichment — IGDB source** (expected majority):
```json
"thumbnail": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg"
```

**After enrichment — Wikipedia fallback**:
```json
"thumbnail": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Hang_on_arcade_flyer.png/300px-Hang_on_arcade_flyer.png"
```

No other fields are added or modified. The `thumbnail` field type (`string|null`) is unchanged.

---

## Enrichment Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────────┐
│ nodes.json  │────▶│ Enrichment Script │────▶│ nodes.json (updated)   │
│ (157 games) │     │                  │     │ (118+ thumbnails)      │
└─────────────┘     └──────┬───────────┘     └────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────▼─────┐ ┌────▼──────────┐
              │ IGDB API  │ │ Wikipedia API  │
              │ (primary) │ │ (fallback)     │
              └───────────┘ └───────────────┘
```

### Processing Rules

For each game node where `group === "game"`:

| Current state | IGDB match? | Wikipedia image? | Action |
|--------------|-------------|-----------------|--------|
| `thumbnail: null` | Yes | — | Set to IGDB URL |
| `thumbnail: null` | No | Yes | Set to Wikipedia URL |
| `thumbnail: null` | No | No | Leave as `null` |
| `thumbnail: "https://upload.wikimedia.org/..."` | Yes | — | Replace with IGDB URL |
| `thumbnail: "https://upload.wikimedia.org/..."` | No | — | Leave unchanged |
| `thumbnail: "https://images.igdb.com/..."` | — | — | Leave unchanged (already IGDB) |

### IGDB Image URL Format

```
https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg
```

- **Size**: `cover_big` = 264×374 px (portrait, suitable for detail panel)
- **image_id**: Alphanumeric string from IGDB cover endpoint (e.g., `co1wyy`)
- **Protocol**: HTTPS (not protocol-relative)
- **Publicly accessible**: No authentication needed to load in browser

---

## Non-Game Nodes — Untouched

| Group | Count | Thumbnail status | Action |
|-------|-------|-----------------|--------|
| company | 1 | Has thumbnail | No change |
| studio | 7 | 4 have thumbnails | No change |
| platform | 17 | All null | No change (out of scope) |
| creator | ~25 | All null | No change (out of scope) |

---

## Validation Constraints

The existing `validate-data.ps1` script validates:
- All nodes have required fields (`id`, `label`, `group`, `summary`, `wikipediaUrl`, `wikidataId`)
- All edge references point to valid node IDs
- All nodes are connected

**No changes needed** to validation — the `thumbnail` field is optional (`string|null`) and not validated by the existing script.

### Additional validation for this feature
The enrichment script itself reports:
- Total games processed
- IGDB matches found
- Wikipedia fallback matches found
- Games still without thumbnails
- Zero regressions (no previously-populated thumbnail set to null)
