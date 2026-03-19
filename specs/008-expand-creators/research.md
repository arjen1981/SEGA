# Research: Expand Creator Nodes with Wikidata

**Feature**: 008-expand-creators  
**Date**: 2026-03-18  
**Status**: Complete

## Research Tasks

### R1: Wikidata SPARQL coverage for Sega game creators

**Task**: Assess how many Sega game–person credit relationships exist in Wikidata.

**Findings**: Querying Wikidata for people connected to Sega-published video games (Q122741) via properties P943 (game director), P57 (director), P86 (composer), P170 (creator), P162 (producer), P3080 (game designer) yields:

- **47 unique people** across **76 game–person relationships**
- Of these 47, **15 are already in the graph** as existing creator nodes
- After filtering non-game-creators (see R2), **~18 plausible new creators** remain
- Of those 18, only **3 have connections to games already in the graph**
- Most Wikidata game–person relationships reference games NOT currently in the graph (Streets of Rage, Phantasy Star, Yakuza series, Sonic Generations, etc.)

**Decision**: Wikidata is a viable but limited source for creator expansion when restricted to games already in the graph. To maximize value, the enrichment should also add selected game nodes that have Wikidata creator data and are notable Sega titles.

**Rationale**: The graph already has 157 games but most are arcade-only. Many well-known Sega franchises (Streets of Rage, Phantasy Star, Yakuza) are console games not in the graph. Adding a subset of these as game nodes enables more creator connections.

**Alternatives considered**:
- MobyGames API: Has per-game credits but Gold tier ($4,999.99/month) required — rejected
- IGDB API: No individual person credits, only `involved_companies` — insufficient
- Sega Retro: GFDL license but bot-blocked by Anubis — cannot automate
- Manual research only: Does not scale, not idempotent

---

### R2: Filtering non-Sega creators from Wikidata results

**Task**: Determine which of the 47 Wikidata people are legitimate Sega game creators vs. non-game-industry people with incidental credits.

**Findings**: Several categories of non-game-creators appear in Wikidata results:

| Person | Wikidata ID | Why excluded |
|--------|-------------|-------------|
| Michael Jackson | Q2831 | Musician — credited on Moonwalker for music/likeness, not game development |
| Q131472725 | Q131472725 | Unresolved QID — no English label available |
| John G. Avildsen | Q260125 | Film director — Rocky film director, not the game |
| Kei Tani | Q3276468 | Japanese actor/comedian — not a game developer |
| Ron "Bumblefoot" Thal | Q358842 | Rock musician — Wild Woody soundtrack |
| Joe Delia | Q3180045 | Film composer — Eternal Champions |
| Ian McDonald | Q464833 | Musician — Wachenröder |
| Domenic Troiano | Q5290049 | Musician — Fahrenheit |
| Yoshio Sakamoto | Q3098670 | Nintendo employee (Metroid) — misattributed for Rhythm Tengoku |
| Ko Takeuchi | Q56348353 | Nintendo employee — Rhythm Tengoku |
| Masami Yone | Q56348334 | Nintendo employee — Rhythm Tengoku |

**Borderline cases** (external composers who worked on major Sega titles):

| Person | Decision | Rationale |
|--------|----------|-----------|
| Kōhei Tanaka (Q2562073) | INCLUDE | Composed Sakura Wars (major Sega franchise), has Wikipedia page |
| Tsunku (Q1155641) | EXCLUDE | J-pop producer — Rhythm Tengoku is primarily a Nintendo title distributed by Sega in arcades |
| Hiroki Kikuta (Q2588785) | INCLUDE | Composed Shining Hearts (Sega franchise) |
| Hitoshi Sakimoto (Q1196596) | INCLUDE | Composed Valkyria Chronicles (Sega franchise), prolific game composer |
| Spencer Nilsen (Q4118577) | INCLUDE | Sega of America in-house sound director |
| Motoaki Takenouchi (Q3325232) | INCLUDE | Composed Jewel Master (Sega game) |

**Decision**: Apply a two-part filter: (1) Exclude people whose primary profession is not game development/game music, AND who have only incidental credits. (2) Include external composers if they composed for a major or well-known Sega title.

---

### R3: Game overlap between Wikidata and existing graph

**Task**: Determine which Wikidata games are already in the graph and which notable games should be added.

**Findings**: Of ~50 unique Wikidata games, only 12 have matches in the existing 157-game graph:

**Games IN the graph with Wikidata creator data:**

| Graph Game | Wikidata Creators | Status |
|-----------|-------------------|--------|
| Fantasy Zone | Hiroshi Kawaguchi (composer) | Existing creator, check if edge exists |
| Alex Kidd: The Lost Stars | Hiroshi Kawaguchi (composer) | Existing creator, check if edge exists |
| Gain Ground | Katsuhiro Hayashi (composer) | NEW creator |
| Scramble Spirits | Yasuhiro Kawakami (composer) | NEW creator |
| Crack Down | Yasuhiro Kawakami (composer) | NEW creator |
| Wonder Boy in Monster Land | Shinichi Sakamoto (composer) | NEW creator |
| Golden Axe: The Revenge of Death Adder | Makoto Uchida (creator) | Existing creator |
| Cyber Police ESWAT | Takayuki Nakamura (composer) | Existing creator, possible new edge |
| Let's Go Jungle! | Takenobu Mitsuyoshi (composer) | Existing creator, possible new edge |
| Monkey Ball | Hideki Naganuma, Tomoya Ohtani (composer) | Existing creators, possible new edges |
| Rambo | Katsuhiro Hayashi (composer) | NEW creator |
| Michael Jackson's Moonwalker | Michael Jackson | EXCLUDED (not a game developer) |

**Decision**: To reach the spec target of 10+ new creators, we should supplement Wikidata data with manual research for games already in the graph that have well-known creators. Wikidata alone provides ~3 genuinely new creators linked to existing graph games.

---

### R4: Edge label mapping from Wikidata properties

**Task**: Map Wikidata relationship properties to existing graph edge labels.

**Findings**: The graph uses past-tense English verbs as edge labels:

| Wikidata Property | Wikidata Label | Graph Edge Label |
|-------------------|---------------|-----------------|
| P943 | game director | directed |
| P57 | director | directed |
| P86 | composer | composed for |
| P170 | creator | designed (when game designer) or directed (context-dependent) |
| P162 | producer | produced |
| P3080 | game designer | designed |

**Decision**: Map directly using the table above. P170 (creator) is ambiguous — treat as "designed" unless context indicates otherwise.

**Rationale**: Existing edge labels are: directed (18), designed (12), programmed (5), composed for (33), produced (23), artwork for (2). The Wikidata properties map cleanly to these established labels.

---

### R5: Constitution Principle VI compliance

**Task**: Assess whether Wikidata usage requires a constitution amendment.

**Findings**: Constitution Principle VI states:

> "All factual text data displayed in the application MUST be sourced exclusively from Wikipedia."

Wikidata is a separate Wikimedia Foundation project (wikidata.org ≠ en.wikipedia.org). It uses structured RDF triples (Q-items, P-properties) rather than prose articles. The constitution already has a "media asset exception" for IGDB images (v1.2.0).

Key distinctions:
- **Wikidata**: CC0 (public domain), structured facts, part of Wikimedia ecosystem
- **Wikipedia**: CC BY-SA, prose articles, already the primary source
- The relationship "Person X composed Game Y" is a structured fact that cannot be extracted from Wikipedia prose in any automated way

**Decision**: A constitution amendment (v1.3.0) is required before implementation. Add a "structured data exception" to Principle VI, analogous to the existing media asset exception.

**Proposed amendment text**:

> **Structured data exception**: Factual, structured relationships (e.g., "Person X directed Game Y") MAY be sourced from Wikidata (wikidata.org) when the equivalent information is not available in structured form on Wikipedia. The data MUST be from the Wikimedia ecosystem (CC0 license). This exception applies solely to verifiable factual relationships — all descriptive text content (biographies, summaries, descriptions) remains Wikipedia-exclusive.

---

### R6: Wikipedia availability for new creators

**Task**: Determine which new creators have English Wikipedia articles for biographical enrichment.

**Findings**:

| New Creator | Wikidata ID | Wikipedia | Games (in Wikidata) |
|------------|-------------|-----------|---------------------|
| Yuzo Koshiro | Q948524 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Yuzo_Koshiro) | Streets of Rage 1/2/3, Revenge of Shinobi, Sorcerian, G.G. Shinobi 1/2 |
| Naofumi Hataya | Q6964522 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Naofumi_Hataya) | Golden Axe II/III, Shadow Squadron, The Hybrid Front, Rhythm Thief |
| Hidenori Shoji | Q5752541 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Hidenori_Shoji) | Yakuza 0/2/3 |
| Hitoshi Sakimoto | Q1196596 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Hitoshi_Sakimoto) | Valkyria Chronicles II/4 |
| Saori Kobayashi | Q3950173 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Saori_Kobayashi) | Sonic Drift 2, Sylvan Tale |
| Tatsuyuki Maeda | Q3516110 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Tatsuyuki_Maeda) | Super Columns |
| Hideaki Kobayashi | Q5752243 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Hideaki_Kobayashi_(composer)) | Phantasy Star Online 2 |
| Kōhei Tanaka | Q2562073 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Kohei_Tanaka_(composer)) | Sakura Wars |
| Motoaki Takenouchi | Q3325232 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Motoaki_Takenouchi) | Jewel Master |
| Mariko Nanba | Q6763443 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Mariko_Nanba) | Brain Assist |
| Spencer Nilsen | Q4118577 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Spencer_Nilsen) | Jurassic Park |
| Hiroki Kikuta | Q2588785 | ✅ [en.wikipedia.org](https://en.wikipedia.org/wiki/Hiroki_Kikuta) | Shining Hearts |
| Katsuhiro Hayashi | Q11532861 | ❌ | Gain Ground, Rambo: First Blood Part II, Girl's Garden |
| Yasuhiro Kawakami | Q8049979 | ❌ | Scramble Spirits, Crack Down |
| Tetsu Katano | Q4217158 | ❌ | Sonic Generations, Sakura Wars |
| Shinichi Sakamoto | Q125399846 | ❌ | Wonder Boy in Monster Land |
| Hiroyoshi Katō | Q11399379 | ❌ | Yakuza 3 |
| Mitsuharu Fukuyama | Q124378546 | ❌ | Yakuza: Dead Souls |
| Hiroshi Miyamoto | Q17118987 | ❌ | Sonic Generations |
| Akiyuki Tateyama | Q18818397 | ❌ | Kemono Friends 3 |

**Summary**: 12 of 20 new creator candidates have English Wikipedia articles. 8 have Wikidata-only data (name, birth year where available, QID).

**Decision**: Include all 20 candidates but mark Wikipedia availability clearly. Creators without Wikipedia pages get minimal nodes (name, wikidataId, group) — no biographical text.

---

### R7: Enrichment script approach

**Task**: Determine the best approach for the enrichment pipeline.

**Findings**: The enrichment needs to:
1. Query Wikidata SPARQL for Sega game creators
2. Filter out non-game-creators (exclusion list)
3. Match Wikidata game labels to existing graph game IDs
4. Generate new creator nodes (with Wikipedia data where available)
5. Generate new edges (creator → game)
6. Merge with existing nodes.json and edges.json without duplicates
7. Be idempotent (FR-011)

**Decision**: Build a single PowerShell script (`scripts/enrich-creators.ps1`) that:
- Queries Wikidata SPARQL endpoint
- Applies hardcoded exclusion list for non-game-creators
- Uses a mapping table for Wikidata game labels → graph game IDs
- Outputs merged nodes.json and edges.json
- Produces a summary report

**Rationale**: PowerShell is the available scripting language (no Node.js, Bun available but PS is consistent with other project scripts like `validate-data.ps1`).

**Alternatives considered**:
- Manual JSON editing: Not idempotent, error-prone
- Bun/JavaScript script: Would work but PowerShell is the project convention for tooling
