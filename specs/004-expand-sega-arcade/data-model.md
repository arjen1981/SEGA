# Data Model: Expand SEGA Arcade Graph Data

**Feature**: 004-expand-sega-arcade
**Date**: 2026-02-16
**Input**: spec.md, research.md

## Overview

This feature extends the existing node/edge data model with:
1. A new `roles` array field on creator nodes (structured role data alongside existing `notableRoles` free-text)
2. Four new edge label types for creator-game credit relationships
3. Removal of the "created" edge label (migrated to specific terms)
4. No new node groups, no schema-breaking changes

The primary work is data expansion (JSON files), not schema redesign.

---

## Entity Changes

### Creator Node (extended)

**New field**: `roles`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roles` | `array` of `string` | No (optional) | Structured role labels from set: `director`, `producer`, `designer`, `programmer`, `composer`, `artist`. Used for badge rendering and future filtering. |

**Rationale**: `notableRoles` is free-text for human display (e.g., "Game director, Producer, Hardware engineer"). `roles` is machine-readable for structured rendering (badges) and filtering. Both coexist — `notableRoles` is NOT replaced.

**Allowed values for `roles` items**:
```json
["director", "producer", "designer", "programmer", "composer", "artist"]
```

**Example** (Yu Suzuki after migration):
```json
{
  "id": "yu-suzuki",
  "label": "Yu Suzuki",
  "group": "creator",
  "summary": "Yu Suzuki is a Japanese game designer...",
  "birthYear": 1958,
  "notableRoles": "Game director, Producer, Hardware engineer",
  "roles": ["director", "producer", "designer", "programmer"],
  "gender": "male",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Yu_Suzuki",
  "wikidataId": "Q282263",
  "thumbnail": "https://upload.wikimedia.org/..."
}
```

**Example** (new creator — Hiroshi Kawaguchi):
```json
{
  "id": "hiroshi-kawaguchi",
  "label": "Hiroshi Kawaguchi",
  "group": "creator",
  "summary": "Sega's longest-serving game music composer...",
  "birthYear": 1965,
  "notableRoles": "Composer, Sound Designer",
  "roles": ["composer"],
  "gender": "male",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Hiroshi_Kawaguchi_(composer)",
  "wikidataId": "Q...",
  "thumbnail": null
}
```

### Game Node (unchanged schema)

No new fields. Existing schema covers all needed attributes:
- `id`, `label`, `group`, `summary`, `releaseYear`, `genre`, `wikipediaUrl`, `wikidataId`, `thumbnail`

### Platform Node (unchanged schema)

No new fields. Existing schema covers all needed attributes:
- `id`, `label`, `group`, `summary`, `releaseYear`, `generation`, `notableFeatures`, `wikipediaUrl`, `wikidataId`, `thumbnail`

---

## Edge Label Changes

### New edge labels

| Label | Direction | From Group | To Group | Description |
|-------|-----------|------------|----------|-------------|
| `designed` | creator → game | creator | game | Person credited as Designer on Wikipedia infobox |
| `programmed` | creator → game | creator | game | Person credited as Programmer on Wikipedia infobox |
| `composed for` | creator → game | creator | game | Person credited as Composer/Music on Wikipedia infobox |
| `artwork for` | creator → game | creator | game | Person credited as Artist/Character Designer on Wikipedia infobox |

### Removed edge label

| Label | Reason |
|-------|--------|
| `created` | Migrated to specific credit terms per FR-005. All 4 current "created" edges (Yu Suzuki → 4 early games) become "designed" + "programmed" pairs. |

### Retained edge labels (unchanged)

| Label | Direction | From Group | To Group |
|-------|-----------|------------|----------|
| `division of` | studio → company | studio | company |
| `developed by` | game → studio | game | studio |
| `runs on` | game → platform | game | platform |
| `worked at` | creator → studio | creator | studio |
| `directed` | creator → game | creator | game |
| `produced` | creator → game | creator | game |

### Complete edge label enum (post-migration)

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
  "artwork for"
]
```

---

## Multi-Edge Rules

A single creator may have multiple edges to the same game when they held multiple roles. Examples:

- **Yu Suzuki → Hang-On**: "designed" + "programmed" (2 edges)
- **Yu Suzuki → G-LOC: Air Battle**: "directed" + "designed" + "programmed" (3 edges)
- **Toshihiro Nagoshi → Spikeout**: "directed" + "produced" + "designed" (3 edges)

Each edge is a separate object in `edges.json`. vis-network renders multi-edges with automatic curvature — no code change needed (FR-014).

---

## Data Volume Estimates

### New nodes to add

| Group | Count | Notes |
|-------|-------|-------|
| Creator | 14 | Per research.md Part 1 (Tier 1–3) |
| Game | 17–20 | Per research.md Part 8, excluding duplicates already in dataset |
| Platform | 3–5 | System 1, System 2, VCO Object minimum; optionally Laserdisc, G80, System 18 |
| **Total new** | **34–39** | |

### Edge additions

| Category | Estimated Count |
|----------|----------------|
| New creator → studio ("worked at") | ~14 |
| New creator → game (credit edges) | ~50–80 |
| Existing creator → game (additional credit edges) | ~30–40 |
| New game → studio ("developed by") | ~17–20 |
| New game → platform ("runs on") | ~17–20 |
| Migration: remove 4 "created", add 8 "designed"/"programmed" | net +4 |
| **Total new edges** | **~130–180** |

### Post-expansion totals

| Metric | Before | After | FR Limit |
|--------|--------|-------|----------|
| Total nodes | 93 | ~132–134 | <200 (FR-012) ✅ |
| Total edges | 156 | ~296–340 | No limit |
| Creator nodes | 5 | 20 | ≥20 (SC-001) ✅ |
| Platform nodes | 13 | 24 | 15–17 (plan) ✅ |
| Game nodes | 67 | 84–87 | ≥87 (SC-002: ≥80) ✅ |

**Note on SC-001**: 15 new creators (Mie Kumagai confirmed as 15th; Ryuichi Nishizawa blocked — English Wikipedia article does not exist, Constitution VI) + 5 existing = 20, meeting the SC-001 minimum target exactly. 2 additional platform nodes (super-scaler, outrun-board) added for missing "runs on" edge coverage.

---

## Validation Rules

### Node validation (existing — no changes)
- Every node must have: `id`, `label`, `group`, `summary`, `wikipediaUrl`, `wikidataId`
- `id` must be unique, kebab-case (`^[a-z0-9][a-z0-9-]*$`)
- `group` must be one of: `company`, `studio`, `platform`, `game`, `creator`
- `wikipediaUrl` must match `^https://en\.wikipedia\.org/wiki/.+`
- `wikidataId` must match `^Q[0-9]+$`

### Node validation (new)
- Creator `roles` array items must be from set: `director`, `producer`, `designer`, `programmer`, `composer`, `artist`
- Creator `roles` array must not be empty if present
- Creator `roles` array must contain unique values (no duplicates)

### Edge validation (updated)
- `label` must be from the updated enum (see above — no more "created")
- `from` and `to` must reference valid node IDs
- No orphan nodes (every node participates in at least one edge)

---

## Code Changes

### detail-panel.js — Role badge rendering (FR-015)

Add role badge rendering in the `getGroupFacts()` function's `creator` case, or as a separate section before the facts list. When `node.roles` exists and is a non-empty array, render each role as a styled inline badge.

**Rendering approach**:
```html
<div class="detail-roles">
  <span class="role-badge">director</span>
  <span class="role-badge">producer</span>
  <span class="role-badge">designer</span>
</div>
```

**Placement**: After the group badge, before the summary paragraph. This gives visual prominence to the structured roles.

**Fallback**: If `roles` is absent or empty, render nothing (creator still shows `notableRoles` in facts list).

### styles.css — Role badge styling

```css
.detail-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0.5rem 0;
}

.role-badge {
  display: inline-block;
  padding: 0.15rem 0.4rem;
  font-family: var(--font-retro);
  font-size: 0.5rem;
  color: #e9a820;
  border: 1px solid #e9a820;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Design rationale**: Amber color matches the retro SEGA theme established in spec 003. `var(--font-retro)` uses Press Start 2P. Small size prevents visual clutter. Border style matches the arcade PCB aesthetic.

---

## Migration Plan

### Edge migration: "created" → specific terms

| Current Edge | Action |
|-------------|--------|
| `yu-suzuki → hang-on / "created"` | Remove; add `"designed"` + `"programmed"` |
| `yu-suzuki → space-harrier / "created"` | Remove; add `"designed"` + `"programmed"` |
| `yu-suzuki → out-run / "created"` | Remove; add `"designed"` + `"programmed"` |
| `yu-suzuki → after-burner / "created"` | Remove; add `"designed"` + `"programmed"` |

### Edge correction

| Current Edge | Action |
|-------------|--------|
| `tetsuya-mizuguchi → sega-rally-championship / "directed"` | Change to `"produced"` (per Wikipedia research) |

### Creator node updates (existing nodes)

All 5 existing creators get `roles` array added:

| Creator | roles |
|---------|-------|
| Yu Suzuki | `["director", "producer", "designer", "programmer"]` |
| Toshihiro Nagoshi | `["director", "producer", "designer"]` |
| Yuji Naka | `["designer", "programmer"]` |
| Rieko Kodama | `["artist", "director", "producer"]` |
| Tetsuya Mizuguchi | `["designer", "producer"]` |

---

## Platform Additions

Minimum 3 new platforms needed to support new games:

| ID | Label | Year | Generation | Games Using It |
|----|-------|------|------------|----------------|
| `system-1` | Sega System 1 | 1983 | 2nd gen (8-bit Z80) | Flicky, Choplifter, Wonder Boy |
| `system-2` | Sega System 2 | 1985 | 2nd gen (8-bit Z80) | Wonder Boy in Monster Land |
| `vco-object` | VCO Object | 1981 | 1st gen (discrete/TTL) | Turbo, Buck Rogers: Planet of Zoom |

Optional platforms (if corresponding games are included):

| ID | Label | Year | Games Using It |
|----|-------|------|----------------|
| `system-18` | Sega System 18 | 1989 | Shadow Dancer, Alien Storm |
| `sega-laserdisc` | Sega Laserdisc | 1983 | Astron Belt |
| `alls` | Sega ALLS | 2017 | House of the Dead: Scarlet Dawn |
