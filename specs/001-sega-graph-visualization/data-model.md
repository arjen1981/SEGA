# Data Model: SEGA Studio Graph Visualization

**Feature**: `001-sega-graph-visualization`
**Date**: 2026-02-09
**Source**: [spec.md](spec.md) Key Entities + Relationships

---

## Entities

### 1. SEGA (Company) — Root Node

The singular root entity at the center of the graph.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., `"sega"`) |
| `label` | string | ✅ | Display name: `"SEGA"` |
| `group` | string | ✅ | Always `"company"` |
| `summary` | string | ✅ | Wikipedia extract (1–2 paragraphs) |
| `founded` | number | ✅ | Founding year (e.g., `1960`) |
| `headquarters` | string | ✅ | Headquarters location |
| `wikipediaUrl` | string | ✅ | Canonical Wikipedia article URL |
| `wikidataId` | string | ✅ | Wikidata Q-ID (e.g., `"Q122741"`) |
| `thumbnail` | string | ❌ | Wikimedia thumbnail URL |

### 2. Internal Studio

A development division or subsidiary of SEGA.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., `"sonic-team"`) |
| `label` | string | ✅ | Display name (e.g., `"Sonic Team"`) |
| `group` | string | ✅ | Always `"studio"` |
| `summary` | string | ✅ | Wikipedia extract |
| `founded` | number | ❌ | Year established |
| `defunct` | number \| null | ❌ | Year closed, or `null` if active |
| `status` | string | ✅ | `"active"` or `"defunct"` |
| `focus` | string | ❌ | Notable focus areas (e.g., `"Arcade racing games"`) |
| `wikipediaUrl` | string | ✅ | Canonical Wikipedia article URL |
| `wikidataId` | string | ✅ | Wikidata Q-ID |
| `thumbnail` | string | ❌ | Wikimedia thumbnail URL |

**Examples**: Sonic Team, AM2, AM3, Amusement Vision, Ryu Ga Gotoku Studio, Wow Entertainment, Hitmaker, Smilebit, Overworks, United Game Artists

### 3. Arcade Platform

A SEGA arcade system board or hardware platform. **Excludes all home consoles.**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., `"naomi"`) |
| `label` | string | ✅ | Display name (e.g., `"NAOMI"`) |
| `group` | string | ✅ | Always `"platform"` |
| `summary` | string | ✅ | Wikipedia extract |
| `releaseYear` | number | ❌ | Year released |
| `generation` | string | ❌ | Arcade generation or era |
| `notableFeatures` | string | ❌ | Notable technical features |
| `wikipediaUrl` | string | ✅ | Canonical Wikipedia article URL |
| `wikidataId` | string | ✅ | Wikidata Q-ID |
| `thumbnail` | string | ❌ | Wikimedia thumbnail URL |

**Examples**: System 1, System 16, System 24, Model 1, Model 2, Model 3, ST-V (Titan), NAOMI, NAOMI 2, Hikaru, Chihiro, Lindbergh, ALLS

**Excluded**: Genesis/Mega Drive, Master System, Saturn, Dreamcast, Game Gear, SG-1000, Pico, 32X, Sega CD

### 4. Game Title

An arcade video game developed or published by SEGA. **Only arcade releases.**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., `"virtua-fighter"`) |
| `label` | string | ✅ | Display name (e.g., `"Virtua Fighter"`) |
| `group` | string | ✅ | Always `"game"` |
| `summary` | string | ✅ | Wikipedia extract |
| `releaseYear` | number | ❌ | Year of arcade release |
| `genre` | string | ❌ | Game genre (e.g., `"Fighting"`) |
| `wikipediaUrl` | string | ✅ | Canonical Wikipedia article URL |
| `wikidataId` | string | ✅ | Wikidata Q-ID |
| `thumbnail` | string | ❌ | Wikimedia thumbnail URL |

**Examples**: Hang-On, Space Harrier, OutRun, After Burner, Virtua Racing, Virtua Fighter, Daytona USA, Sega Rally Championship, House of the Dead, Crazy Taxi, Virtual On, Initial D Arcade Stage

### 5. Creator (Person)

A notable individual associated with SEGA's arcade game development.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., `"yu-suzuki"`) |
| `label` | string | ✅ | Display name (e.g., `"Yu Suzuki"`) |
| `group` | string | ✅ | Always `"creator"` |
| `summary` | string | ✅ | Wikipedia extract |
| `birthYear` | number | ❌ | Year of birth |
| `notableRoles` | string | ❌ | Notable roles/titles (e.g., `"Game director, Producer"`) |
| `wikipediaUrl` | string | ✅ | Canonical Wikipedia article URL |
| `wikidataId` | string | ✅ | Wikidata Q-ID |
| `thumbnail` | string | ❌ | Wikimedia thumbnail URL |

**Examples**: Yu Suzuki, Toshihiro Nagoshi, Yuji Naka, Rieko Kodama, Hisao Oguchi, Tetsu Katano, Makoto Osaki

---

## Relationships (Edges)

| Relationship | Source → Target | `label` value | Wikidata property |
|--------------|-----------------|---------------|-------------------|
| Division of | Studio → SEGA | `"division of"` | P749 (parent org) |
| Developed by | Game → Studio | `"developed by"` | P178 (developer) |
| Runs on | Game → Platform | `"runs on"` | P400 (platform) |
| Worked at | Creator → Studio | `"worked at"` | P108 (employer) |
| Created | Creator → Game | `"created"` | P800 (notable work) |
| Directed | Creator → Game | `"directed"` | P800 + role qualifier |
| Produced | Creator → Game | `"produced"` | P800 + role qualifier |

### Edge Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string | ✅ | Source node `id` |
| `to` | string | ✅ | Target node `id` |
| `label` | string | ✅ | Relationship type for display |
| `title` | string | ❌ | Tooltip text (defaults to `label` if omitted) |

---

## Validation Rules

1. Every `id` MUST be unique across all entities.
2. Every edge `from` and `to` MUST reference an existing node `id`.
3. Every node MUST have a non-empty `label`, `group`, `summary`, and `wikipediaUrl`.
4. `group` MUST be one of: `"company"`, `"studio"`, `"platform"`, `"game"`, `"creator"`.
5. `wikipediaUrl` MUST be a valid `https://en.wikipedia.org/wiki/...` URL.
6. Exactly one node MUST have `group: "company"` (the SEGA root).
7. No node may exist without at least one edge connecting it to another node.
8. Per-group required fields (e.g., `founded` and `headquarters` for company, `status` for studio) are enforced by the data compilation script (T007), not by the JSON Schema. The JSON Schema enforces only the universal required fields shared by all groups.

---

## JSON File Structure

### `nodes.json`

```json
[
  {
    "id": "sega",
    "label": "SEGA",
    "group": "company",
    "summary": "Sega Corporation is a Japanese ...",
    "founded": 1960,
    "headquarters": "Shinagawa, Tokyo, Japan",
    "wikipediaUrl": "https://en.wikipedia.org/wiki/Sega",
    "wikidataId": "Q122741",
    "thumbnail": "https://upload.wikimedia.org/..."
  },
  {
    "id": "am2",
    "label": "Sega AM2",
    "group": "studio",
    "summary": "Sega AM2 Co., Ltd. is a ...",
    "founded": 1983,
    "defunct": null,
    "status": "active",
    "focus": "Arcade fighting and racing games",
    "wikipediaUrl": "https://en.wikipedia.org/wiki/Sega_AM2",
    "wikidataId": "Q1075863",
    "thumbnail": null
  }
]
```

### `edges.json`

```json
[
  {
    "from": "am2",
    "to": "sega",
    "label": "division of"
  },
  {
    "from": "virtua-fighter",
    "to": "am2",
    "label": "developed by"
  },
  {
    "from": "virtua-fighter",
    "to": "model-1",
    "label": "runs on"
  },
  {
    "from": "yu-suzuki",
    "to": "am2",
    "label": "worked at"
  },
  {
    "from": "yu-suzuki",
    "to": "virtua-fighter",
    "label": "directed"
  }
]
```

---

## State Transitions

Not applicable — this is a read-only data visualization application.
All data is static and pre-compiled. There are no entity state changes
at runtime.
