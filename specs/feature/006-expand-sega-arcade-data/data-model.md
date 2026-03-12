# Data Model: Major SEGA Arcade Data Expansion

**Feature**: 006-expand-sega-arcade-data  
**Date**: 2026-03-12  
**Input**: spec.md, research.md

## Overview

This feature is **data-only** — no schema or code changes. The existing node/edge JSON schema from spec 004 supports all needed fields. All work is adding new JSON objects to `nodes.json` and `edges.json`.

- **No new fields** on any node type
- **No new edge label types** (all 10 existing labels are sufficient)
- **No new node groups** (company, studio, platform, game, creator all exist)

---

## Entity Schemas (Unchanged)

### Game Node

```json
{
  "id": "string (kebab-case)",
  "label": "string",
  "group": "game",
  "summary": "string (1-2 paragraphs from Wikipedia)",
  "releaseYear": "integer",
  "genre": "string",
  "wikipediaUrl": "string (https://en.wikipedia.org/wiki/...)",
  "wikidataId": "string (Q-number)",
  "thumbnail": "string|null"
}
```

### Creator Node

```json
{
  "id": "string (kebab-case)",
  "label": "string",
  "group": "creator",
  "summary": "string",
  "birthYear": "integer",
  "notableRoles": "string (free-text)",
  "roles": ["director"|"producer"|"designer"|"programmer"|"composer"|"artist"],
  "gender": "male|female",
  "wikipediaUrl": "string",
  "wikidataId": "string",
  "thumbnail": "string|null"
}
```

### Platform Node

```json
{
  "id": "string (kebab-case)",
  "label": "string",
  "group": "platform",
  "summary": "string",
  "releaseYear": "integer",
  "generation": "string",
  "notableFeatures": "string",
  "wikipediaUrl": "string",
  "wikidataId": "string",
  "thumbnail": "string|null"
}
```

### Studio Node

```json
{
  "id": "string (kebab-case)",
  "label": "string",
  "group": "studio",
  "summary": "string",
  "founded": "integer",
  "defunct": "integer|null",
  "status": "active|defunct",
  "focus": "string",
  "wikipediaUrl": "string",
  "wikidataId": "string",
  "thumbnail": "string|null"
}
```

### Edge

```json
{
  "from": "string (node ID)",
  "to": "string (node ID)",
  "label": "string (one of 10 labels)"
}
```

---

## Edge Label Enum (Complete — No Changes)

```json
[
  "division of",
  "developed by",
  "runs on",
  "worked at",
  "directed",
  "produced",
  "designed",
  "programmed",
  "composed for",
  "artwork for",
  "partner of"
]
```

---

## Data Volume

### New Nodes by Group

| Group | New Count | Examples |
|-------|-----------|---------|
| Game | 69–73 | Periscope, Frogger, Champion Boxing, Moonwalker, Star Wars Trilogy, Maimai, Ongeki |
| Platform | 5 | Hikaru, RingEdge, RingEdge 2, Nu, Europa-R |
| Studio | 4 | Compile, Westone, Sega Rosso, Sega AM4 |
| Creator | 6 | Noriyoshi Ohba, Makoto Uchida, Ryuta Ueda, Hayao Nakayama, David Rosen, Masamitsu Niitani |
| **Total** | **84–88** | |

### New Edges by Type

| Edge Label | New Count | Direction |
|------------|-----------|-----------|
| developed by | ~70 | game → studio/company |
| runs on | ~70 | game → platform |
| division of | 2 | studio → company |
| worked at | 6 | creator → studio/company |
| directed | ~5 | creator → game |
| produced | ~3 | creator → game |
| designed | ~4 | creator → game |
| composed for | ~4 | creator → game |
| **Total** | **~164** | |

### Post-Expansion Totals

| Metric | Before | After |
|--------|--------|-------|
| Nodes | 140 | 224–228 |
| Edges | 296 | ~460 |
| Games | 88 | 157–161 |
| Creators | 20 | 26 |
| Platforms | 24 | 29 |
| Studios | 7 | 11 |

---

## Edge Patterns for New Games

Every new game node requires **minimum 2 edges**:

1. `{ "from": "{game-id}", "to": "{studio-id}", "label": "developed by" }`
2. `{ "from": "{game-id}", "to": "{platform-id}", "label": "runs on" }`

Games with known Wikipedia-credited personnel get additional edges:

3. `{ "from": "{creator-id}", "to": "{game-id}", "label": "directed|produced|designed|..." }`

### Studio Assignment Rules

| Condition | Developer Target |
|-----------|-----------------|
| Pre-1990 game (before AM division structure) | `"sega"` |
| Known AM division development | Specific AM studio (e.g., `"sega-am2"`) |
| External developer on Sega hardware | External studio node (e.g., `"compile"`) |
| Sega-manufactured but third-party developed | `"sega"` (as manufacturer) |

### Platform Assignment Rules

| Game Era | Platform Selection |
|----------|-------------------|
| 1966–1980 electro-mechanical/early digital | `"pre-system-1"` |
| 1981–1982 vector/raster games | `"g80"` |
| 1983–1984 Z80-based | `"system-1"` |
| 1985+ | Match to specific known hardware per Wikipedia |

---

## Existing Edge Corrections

### Initial D Arcade Stage developer attribution

Current: `initial-d-arcade-stage → sega` (developed by)
Corrected: `initial-d-arcade-stage → sega-rosso` (developed by)

**Rationale**: Initial D Arcade Stage was developed by Sega Rosso, a subsidiary established specifically for this franchise. Adding the Sega Rosso studio node enables correct attribution.

### Wonder Boy developer attribution

Current: `wonder-boy → sega` (developed by)
Add: `wonder-boy → westone` (developed by) — keep the sega edge as publisher

Current: `wonder-boy-monster-land → sega` (developed by)
Add: `wonder-boy-monster-land → westone` (developed by)

**Rationale**: Wonder Boy games were developed by Westone Bit Entertainment (Escape), not directly by Sega's internal teams. Sega published and manufactured the arcade versions.

---

## Validation Rules (Unchanged)

All validation rules from spec 004 remain in effect:

- `id`: unique, kebab-case (`^[a-z0-9][a-z0-9-]*$`)
- `group`: one of `company`, `studio`, `platform`, `game`, `creator`
- `wikipediaUrl`: matches `^https://en\.wikipedia\.org/wiki/.+`
- `wikidataId`: matches `^Q[0-9]+$`
- Edge `from`/`to`: must reference valid node IDs
- Edge `label`: must be from the 11-value enum above
- No orphan nodes (every node in at least one edge)
- No duplicate IDs
