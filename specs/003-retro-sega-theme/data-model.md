# Data Model: Retro SEGA Visual Theme

**Feature**: `003-retro-sega-theme`
**Date**: 2026-02-16
**Source**: [spec.md](spec.md) Key Entities + [001 data-model](../001-sega-graph-visualization/data-model.md)

---

## Data Model Changes

This feature extends the existing data model from `001-sega-graph-visualization`. Only **additions and modifications** are documented here. All existing fields, validation rules, and relationships remain unchanged.

---

## Entity Extensions

### 1. Creator (Person) — Gender Attribute Addition

A new optional `gender` field is added to creator nodes to support male/female silhouette icon differentiation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gender` | string \| undefined | ❌ | Gender of the creator. Values: `"male"`, `"female"`. Omitted if unknown. Sourced from Wikidata P21. |

All other creator fields remain unchanged from the 001 data model.

**Data source**: Wikidata property P21 (sex or gender), consistent with Constitution Principle VI (Wikipedia as Single Source of Truth).

#### Current Creator Gender Data

| Creator ID | Label | Gender | Wikidata P21 Source |
|-----------|-------|--------|---------------------|
| `yu-suzuki` | Yu Suzuki | `"male"` | Q282263 → P21 → Q6581097 (male) |
| `toshihiro-nagoshi` | Toshihiro Nagoshi | `"male"` | Q2572612 → P21 → Q6581097 (male) |
| `yuji-naka` | Yuji Naka | `"male"` | Q726119 → P21 → Q6581097 (male) |
| `rieko-kodama` | Rieko Kodama | `"female"` | Q7333106 → P21 → Q6581072 (female) |
| `tetsuya-mizuguchi` | Tetsuya Mizuguchi | `"male"` | Q536801 → P21 → Q6581097 (male) |

---

## New Entity: Node Icon Set (Runtime Only)

The icon set is not persisted in JSON data files. It exists as JavaScript constants in the `icons.js` module and is applied at runtime.

| Icon ID | Category | Description | Color | Dimensions |
|---------|----------|-------------|-------|------------|
| `platform-system-board` | platform | Large PCB with multiple chip slots, landscape orientation | Green (#2a9d8f) | 64×64 viewBox |
| `game-jamma-pcb` | game | Smaller PCB with prominent JAMMA edge connector teeth | Amber (#e9a820) | 64×64 viewBox |
| `creator-male` | creator | Male head silhouette (short hair contour) | Purple (#7b2d8e) | 64×64 viewBox |
| `creator-female` | creator | Female head silhouette (longer hair contour) | Purple (#7b2d8e) | 64×64 viewBox |
| `creator-neutral` | creator | Gender-neutral head silhouette (simple oval) | Purple (#7b2d8e) | 64×64 viewBox |
| `studio-building` | studio | Japanese-style office building with peaked roof | Blue (#457b9d) | 64×64 viewBox |
| `company-sega` | company | Hand-drawn SEGA italic block letter approximation | Red (#e63946) | 64×64 viewBox |

### Icon Assignment Rules

| Node Group | Icon Selection Logic |
|-----------|---------------------|
| `company` | Always `company-sega` |
| `studio` | Always `studio-building` |
| `platform` | Always `platform-system-board` |
| `game` | Always `game-jamma-pcb` |
| `creator` | `gender === "male"` → `creator-male`; `gender === "female"` → `creator-female`; otherwise → `creator-neutral` |

---

## Updated Validation Rules

All existing validation rules from the 001 data model remain in effect. The following rule is added:

8. *(existing)* Per-group required fields enforced by data compilation script.
9. If present, `gender` MUST be one of `"male"` or `"female"`. If absent or `null`, the system uses the gender-neutral creator icon.

---

## Updated JSON Example

### `nodes.json` — Creator with gender field

```json
{
  "id": "rieko-kodama",
  "label": "Rieko Kodama",
  "group": "creator",
  "summary": "Rieko Kodama, also known as Phoenix Rie, was a Japanese video game artist...",
  "birthYear": 1963,
  "notableRoles": "Artist, Director, Producer",
  "gender": "female",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Rieko_Kodama",
  "wikidataId": "Q7333106",
  "thumbnail": "https://upload.wikimedia.org/wikipedia/en/9/9f/Rieko_Kodama.jpg"
}
```

---

## State Transitions

Not applicable — this feature adds a visual attribute only. No state transitions introduced. The gender field is static data sourced at build time.
