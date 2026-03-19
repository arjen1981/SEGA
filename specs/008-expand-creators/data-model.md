# Data Model: Expand Creator Nodes with Wikidata

**Feature**: 008-expand-creators  
**Date**: 2026-03-18

## Schema Changes

**No schema changes required.** All new creator nodes and edges conform to the existing schemas from spec 004/006. The `nodes.schema.json` and `edges.schema.json` are carried forward unchanged.

## New Creator Nodes

### Tier 1: New creators linked to games already in the graph

These creators have Wikidata credit relationships to games that already exist in `nodes.json`.

| ID | Label | Wikidata | Wikipedia | birthYear | Roles | Games in Graph |
|----|-------|----------|-----------|-----------|-------|----------------|
| katsuhiro-hayashi | Katsuhiro Hayashi | Q11532861 | ❌ | 1965 | composer | Gain Ground, Rambo |
| yasuhiro-kawakami | Yasuhiro Kawakami | Q8049979 | ❌ | — | composer | Scramble Spirits, Crack Down |
| shinichi-sakamoto | Shinichi Sakamoto | Q125399846 | ❌ | 1966 | composer | Wonder Boy in Monster Land |

### Tier 2: New creators with Wikipedia pages (games not yet in graph)

These creators need associated game nodes added to the graph to create connections.

| ID | Label | Wikidata | Wikipedia | birthYear | Roles | Sega Games (Wikidata) |
|----|-------|----------|-----------|-----------|-------|-----------------------|
| yuzo-koshiro | Yuzo Koshiro | Q948524 | ✅ | 1967 | composer | Streets of Rage 1/2/3, The Revenge of Shinobi, Sorcerian, G.G. Shinobi 1/2 |
| naofumi-hataya | Naofumi Hataya | Q6964522 | ✅ | 1966 | composer | Golden Axe II/III, Shadow Squadron, The Hybrid Front, Rhythm Thief |
| hidenori-shoji | Hidenori Shoji | Q5752541 | ✅ | 1975 | composer | Yakuza 0/2/3 |
| hitoshi-sakimoto | Hitoshi Sakimoto | Q1196596 | ✅ | 1969 | composer | Valkyria Chronicles II/4 |
| saori-kobayashi | Saori Kobayashi | Q3950173 | ✅ | — | composer | Sonic Drift 2, Sylvan Tale |
| tatsuyuki-maeda | Tatsuyuki Maeda | Q3516110 | ✅ | 1968 | composer | Super Columns |
| hideaki-kobayashi | Hideaki Kobayashi | Q5752243 | ✅ | 1973 | composer | Phantasy Star Online 2 |
| kohei-tanaka | Kōhei Tanaka | Q2562073 | ✅ | 1954 | composer | Sakura Wars |
| spencer-nilsen | Spencer Nilsen | Q4118577 | ✅ | 1961 | composer | Jurassic Park |
| motoaki-takenouchi | Motoaki Takenouchi | Q3325232 | ✅ | 1967 | composer | Jewel Master |
| hiroki-kikuta | Hiroki Kikuta | Q2588785 | ✅ | 1962 | composer | Shining Hearts |

### Tier 3: New creators without Wikipedia pages (limited data)

| ID | Label | Wikidata | birthYear | Roles | Sega Games (Wikidata) |
|----|-------|----------|-----------|-------|-----------------------|
| tetsu-katano | Tetsu Katano | Q4217158 | — | director | Sonic Generations, Sakura Wars |
| hiroshi-miyamoto | Hiroshi Miyamoto | Q17118987 | 1985 | director | Sonic Generations |
| hiroyoshi-kato | Hiroyoshi Katō | Q11399379 | — | producer | Yakuza 3 |
| mitsuharu-fukuyama | Mitsuharu Fukuyama | Q124378546 | — | producer | Yakuza: Dead Souls |
| mariko-nanba | Mariko Nanba | Q6763443 | 1971 | director | Brain Assist |
| akiyuki-tateyama | Akiyuki Tateyama | Q18818397 | 1980 | director | Kemono Friends 3 |

**Total new creators**: 20 (3 Tier 1 + 11 Tier 2 + 6 Tier 3)

## New Edges for Existing Creators

Wikidata reveals additional game credits for creators already in the graph. These are new edges only (no node changes).

| From (existing creator) | To (game) | Label | Source |
|-------------------------|-----------|-------|--------|
| takayuki-nakamura | eswat | composed for | P86 |
| takenobu-mitsuyoshi | lets-go-jungle | composed for | P86 |
| hideki-naganuma | monkey-ball | composed for | P86 (Banana Blitz) |
| tomoya-ohtani | monkey-ball | composed for | P86 (Step & Roll) |
| makoto-uchida | golden-axe-the-revenge-of-death-adder | directed | P170 |
| hiroshi-kawaguchi | fantasy-zone | composed for | P86 |
| hiroshi-kawaguchi | alex-kidd-the-lost-stars | composed for | P86 |

> **Note**: Each edge must be verified against existing edges.json to avoid duplicates before adding.

## New Edges for New Creators (Tier 1 — games in graph)

| From (new creator) | To (existing game) | Label | Source |
|--------------------|--------------------|-------|--------|
| katsuhiro-hayashi | gain-ground | composed for | P86 |
| katsuhiro-hayashi | rambo-arcade | composed for | P86 |
| yasuhiro-kawakami | scramble-spirits | composed for | P86 |
| yasuhiro-kawakami | crack-down | composed for | P86 |
| shinichi-sakamoto | wonder-boy-in-monster-land | composed for | P86 |

## Attribution Entities

### ATTRIBUTION.md structure

```markdown
# Data Sources & Attribution

## Wikipedia / Wikimedia Commons
- **Usage**: Biographical text, summaries, thumbnails
- **License**: CC BY-SA 3.0
- **URL**: https://en.wikipedia.org

## Wikidata
- **Usage**: Structured creator–game credit relationships
- **License**: CC0 (Public Domain)
- **URL**: https://www.wikidata.org

## IGDB (Internet Games Database)
- **Usage**: Game cover art thumbnails
- **License**: Used under IGDB terms of service
- **URL**: https://www.igdb.com
```

### UI Attribution

A small attribution line in the application footer or info panel:

```
Data from Wikipedia · Wikidata · IGDB
```

## Node Format Examples

### Creator with Wikipedia (Tier 2)

```json
{
  "id": "yuzo-koshiro",
  "label": "Yuzo Koshiro",
  "group": "creator",
  "summary": "[Wikipedia extract]",
  "birthYear": 1967,
  "notableRoles": "Composer",
  "roles": ["composer"],
  "gender": "male",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Yuzo_Koshiro",
  "wikidataId": "Q948524",
  "thumbnail": "[Wikimedia thumbnail URL or null]"
}
```

### Creator without Wikipedia (Tier 1/3)

```json
{
  "id": "katsuhiro-hayashi",
  "label": "Katsuhiro Hayashi",
  "group": "creator",
  "summary": "Katsuhiro Hayashi is a Japanese video game composer who worked at Sega.",
  "birthYear": 1965,
  "notableRoles": "Composer",
  "roles": ["composer"],
  "gender": "male",
  "wikipediaUrl": "https://www.wikidata.org/wiki/Q11532861",
  "wikidataId": "Q11532861"
}
```

> **Note on `wikipediaUrl` for Wikidata-only creators**: Use the Wikidata entity page URL as fallback. This satisfies the schema requirement (`format: uri`) while clearly indicating the data source. Constitution amendment allows this for Wikidata-sourced structured data.

### Edge format

```json
{
  "from": "katsuhiro-hayashi",
  "to": "gain-ground",
  "label": "composed for"
}
```

## Impact Summary

| Metric | Before | After (projected) |
|--------|--------|-------------------|
| Total nodes | 223 | 243 (+20 creators) |
| Creator nodes | 25 | 45 |
| Total edges | 443 | ~475 (+5 Tier 1 edges, +7 existing creator edges, ~20 Tier 2/3 edges) |
| Games with creators | 49 | 55+ |
| Data sources attributed | 0 | 3 (Wikipedia, Wikidata, IGDB) |
