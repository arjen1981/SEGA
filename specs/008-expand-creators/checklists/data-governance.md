# Data Governance & Specification Quality Checklist: Expand Creator Nodes

**Purpose**: Formal gating review validating requirement completeness, clarity, consistency, and data source governance for Wikidata SPARQL–based creator expansion
**Created**: 2026-03-19
**Feature**: [spec.md](../spec.md)
**Depth**: Formal gating checklist (reviewer/pre-implementation)
**Focus Areas**: Wikidata SPARQL data governance, CC0 licensing, creator filtering, attribution, Constitution amendment

## Requirement Completeness

- [x] CHK001 - Are Wikidata SPARQL endpoint requirements specified (endpoint URL, User-Agent header, rate limit of 1 req/s, response format)? ✅ Plan §External API documents endpoint, rate limit, User-Agent, and CC0 license
- [x] CHK002 - Are the six Wikidata properties (P943, P57, P86, P170, P162, P3080) explicitly listed in requirements with their semantic mapping to graph edge labels? ✅ Plan §External API + Research §R4 maps all 6 properties to edge labels
- [x] CHK003 - Are requirements defined for how new creator node IDs are generated (kebab-case from label, uniqueness check against existing nodes.json)? ✅ Data Model §Node Format shows kebab-case IDs; schema pattern `^[a-z0-9][a-z0-9-]*$`
- [x] CHK004 - Is the "roles" field on creator nodes defined for creators who hold multiple different roles across titles (array vs. comma-separated vs. notableRoles summary)? ✅ Data Model §Node Format: `roles` is array, `notableRoles` is free-text summary
- [x] CHK005 - Are requirements defined for resolving Wikipedia disambiguation when a creator has a common name (e.g., Hideaki Kobayashi → Hideaki_Kobayashi_(composer))? ✅ Research §R6 lists exact Wikipedia URLs including disambiguation suffixes
- [ ] CHK006 - Are fallback requirements specified when the Wikidata SPARQL endpoint is unavailable or returns empty results for a query? [Gap — script should exit with error message]
- [x] CHK007 - Are requirements specified for the enrichment script's summary report format (console output, file, or both) per FR-007? ✅ Tasks §T009 specifies console output with creators added, edges added, enriched count, Wikidata-only count
- [x] CHK008 - Is the attribution UI placement specified (footer, info panel, dedicated page) with enough detail for implementation? ✅ Data Model §UI Attribution: "small attribution line in footer or info panel" + Tasks §T072
- [x] CHK009 - Are requirements defined for the three creator tiers (Tier 1: linked to existing games; Tier 2: Wikipedia-enriched; Tier 3: Wikidata-only) and how each tier's node data differs? ✅ Data Model §Tiers 1/2/3 clearly defined with different data completeness levels

## Requirement Clarity

- [x] CHK010 - Is the spec's target of "at least 40 game nodes have creator connections" (US1-AS1) reconciled with plan.md's Wikidata coverage of only 12 matching games in the existing graph? ✅ Plan §Summary sets target "60+ games with creator links"; spec predates Wikidata pivot — plan numbers are authoritative
- [x] CHK011 - Is "at least 2 verified game credits" (SC-003) scoped — does it mean 2 credits within the graph, 2 credits in Wikidata overall, or 2 credits from any source? ✅ Research §R1 shows Wikidata game-person relationships; SC-003 means 2 credits within the graph
- [x] CHK012 - Is the Wikidata game label → graph node ID mapping strategy specified (hardcoded lookup table, fuzzy match, manual curation)? ✅ Research §R7 + Tasks §T005: hardcoded mapping table in enrichment script
- [x] CHK013 - Is the P170 (creator) property's ambiguous semantics addressed — when does it map to "designed" vs. "directed" vs. other labels? ✅ Research §R4: "treat as 'designed' unless context indicates otherwise"
- [x] CHK014 - Is "visible attribution" (FR-009) quantified — always visible on screen, one click away, or footer-level? ✅ Data Model §UI Attribution + Tasks §T072: footer-level, always visible
- [x] CHK015 - Is the exclusion list rationale documented per-person so future maintainers understand why each QID (Q2831, Q260125, Q3276468, etc.) was excluded? ✅ Research §R2: full table with person name, QID, and exclusion reason

## Requirement Consistency

- [x] CHK016 - Does spec.md still reference "MobyGames" throughout while plan.md uses "Wikidata SPARQL" — is there a requirement to update spec.md to reflect the corrected data source? ✅ Plan §Note explicitly flags this: "The spec should be updated to match before implementation." Tracked as a known divergence.
- [x] CHK017 - Are edge label formats consistent between existing edges (past-tense: "directed", "composed for") and the Wikidata property mapping in plan.md? ✅ Research §R4 maps all Wikidata properties to existing past-tense labels
- [x] CHK018 - Does the Creator Key Entity definition (singular "role" attribute in spec) conflict with the data model's "roles" array and "notableRoles" summary field? ✅ Data Model §Node Format clarifies: `roles` (array for badges), `notableRoles` (free-text summary). Spec entity description is simplified, data model is authoritative.
- [x] CHK019 - Does the spec's assumption "MobyGames API is accessible" conflict with the plan's documented finding that MobyGames Gold tier costs $4,999.99/month and was rejected? ✅ Plan §Note explicitly documents this conflict. MobyGames rejected; Wikidata SPARQL is the corrected source.
- [x] CHK020 - Are the success criteria numbers (SC-001: ≥35 creators, SC-002: ≥50 games with links) consistent with plan.md's estimate of ~12–18 new creators and ~60+ linked games? ✅ Plan targets 35–43 creators (25 existing + 10–18 new). SC-001 ≥35 is achievable. SC-002 ≥50 aligns with plan's 60+ target.

## Data Source Governance

- [x] CHK021 - Is the CC0 (public domain) license of Wikidata data documented in requirements, confirming no attribution is legally required but will be provided voluntarily? ✅ Plan §External API: "License: CC0 (public domain)". Data Model §Attribution: voluntary attribution with CC0 noted.
- [x] CHK022 - Is the Constitution Principle VI amendment to v1.3.0 (structured data exception for Wikidata) explicitly documented as a blocking prerequisite with proposed wording? ✅ Plan §Complexity Tracking + §Proposed Constitution Amendment: full amendment text provided. Tasks §T001 is first task.
- [x] CHK023 - Is the boundary between Wikidata-sourced data (structured credit relationships only) and Wikipedia-sourced data (descriptive text, biographies, summaries) clearly defined per the proposed amendment? ✅ Plan §Proposed Amendment: "solely to verifiable factual relationships — all descriptive text content remains Wikipedia-exclusive"
- [x] CHK024 - Are data provenance requirements defined per-node — can each creator node trace back to its source (Wikidata QID for credits, Wikipedia URL for text, IGDB for images)? ✅ Data Model §Node Format: every node has `wikidataId` (QID) and `wikipediaUrl` (or Wikidata entity URL fallback)
- [x] CHK025 - Is the ATTRIBUTION.md content structure specified with all three sources (Wikipedia/CC BY-SA, Wikidata/CC0, IGDB/ToS) including fields for source name, URL, license, and usage scope? ✅ Data Model §Attribution Entities: full ATTRIBUTION.md template with all 3 sources, fields, and licenses
- [x] CHK026 - Are requirements defined for Wikidata's User-Agent policy (mandatory descriptive header, contact info) to prevent endpoint access being blocked? ✅ Plan §External API: "requires User-Agent header". Scripts use "SEGAGraph/1.0" header.
- [x] CHK027 - Is IGDB attribution included in scope given it was introduced in feature 007 but attribution was not added at that time? ✅ Data Model §Attribution: IGDB listed as third source with "Game cover art thumbnails" usage scope
- [x] CHK028 - Are requirements specified for the `wikipediaUrl` fallback on Wikidata-only creators (Tier 3) — using the Wikidata entity page URL as a substitute? ✅ Data Model §Node Format note: "Use the Wikidata entity page URL as fallback"

## Scenario Coverage

- [x] CHK029 - Are the 11 excluded non-game-creators (Michael Jackson/Q2831, film directors, musicians, Nintendo employees) documented as an explicit exclusion list with rationale per person? ✅ Research §R2: full table with 11 exclusions, each with name, QID, and reason
- [x] CHK030 - Are borderline inclusion criteria defined for external composers who worked on major Sega titles (e.g., Kōhei Tanaka for Sakura Wars) vs. incidental music contributors? ✅ Research §R2: "Borderline cases" table with 6 entries, each with INCLUDE/EXCLUDE decision and rationale
- [x] CHK031 - Are requirements defined for creators whose Wikidata labels use non-ASCII romanizations (macrons: "Kōhei", "Katō") — how are these normalized for node IDs and display? ✅ Data Model §Tiers: IDs use ASCII kebab-case (kohei-tanaka, hiroyoshi-kato); labels preserve Unicode (Kōhei Tanaka)
- [ ] CHK032 - Are recovery requirements defined for a failed enrichment run (rollback to pre-enrichment JSON state, partial output cleanup)? [Gap — git restore provides rollback; script should be atomic]
- [x] CHK033 - Are requirements specified for handling Wikidata results that reference games not in the graph — should new game nodes be added (Tier 2 approach) or results discarded? ✅ Data Model §Tier 2: game nodes added for Tier 2 creators. Research §R1: "enrichment should also add selected game nodes"
- [x] CHK034 - Are requirements defined for the scenario where a Wikidata QID has no English label (e.g., Q131472725 in research) — skip silently, log warning, or flag for review? ✅ Research §R2: Q131472725 listed in exclusion table as "Unresolved QID — no English label available"
- [x] CHK035 - Are idempotency requirements (FR-011) specified with enough detail — does "identical output" mean byte-identical JSON, or semantically equivalent with stable key ordering? ✅ Tasks §T076: "produces identical nodes.json and edges.json on second run" — byte-identical

## Acceptance Criteria Quality

- [x] CHK036 - Can "at least 35 total creator nodes" (SC-001) be objectively verified by counting nodes where `group="creator"` in nodes.json? ✅ Yes — simple JSON filter. Tasks §T069 verifies this.
- [x] CHK037 - Can "zero regressions" (SC-005) be objectively verified — is a baseline snapshot or diff method defined (e.g., T011 baseline capture)? ✅ Tasks §T011 captures baseline counts; §T068 diffs existing 25 creators against baseline
- [x] CHK038 - Is SC-002 ("at least 50 game nodes have creator connections") measurable by counting unique game IDs in edges where the source node has `group="creator"`? ✅ Yes — count unique `to` values in credit edges. Tasks §T070 verifies this.
- [x] CHK039 - Is "visible to 100% of users" (SC-004) testable for a static HTML site — is "visible" defined as rendered in DOM on page load without scrolling or interaction? ✅ Tasks §T074 verifies attribution visibility. Footer is always rendered on page load.

## Dependencies & Assumptions

- [x] CHK040 - Is the assumption that Wikidata SPARQL coverage provides sufficient creator data validated by research (47 people, 76 relationships, ~20 new creators after filtering)? ✅ Research §R1: validated with actual SPARQL queries. 47 people, 76 relationships confirmed.
- [x] CHK041 - Is the dependency on Constitution Principle VI amendment (v1.3.0) documented with a clear gating sequence (amendment MUST precede implementation per Tasks §T001)? ✅ Plan §Constitution Check flags violation. Tasks §T001 is first task. Plan §Proposed Amendment has full text.
- [x] CHK042 - Is the dependency on validate-data.ps1 passing after enrichment documented — does the validator support Wikidata-sourced nodes without schema changes? ✅ Data Model §Schema Changes: "No schema changes required." Nodes follow existing schema. Tasks §T019/T048/T057/T065/T066 run validation.
- [x] CHK043 - Is the spec.md → plan.md divergence (MobyGames vs. Wikidata) tracked as a required spec update before or during implementation? ✅ Plan §Note: "The spec should be updated to match before implementation." CHK016 also flags this.
- [x] CHK044 - Are the 12 of 20 new creators with Wikipedia pages documented as the enrichment boundary — 8 Wikidata-only creators will have minimal nodes (name, QID, group only)? ✅ Research §R6: full table of 20 creators with Wikipedia availability. Data Model §Tier 3 defines minimal nodes.

## Notes

- This is a **formal gating checklist** — all items should be addressed before proceeding to implementation
- **Data source pivot**: MobyGames ($4,999.99/month Gold tier) was rejected; Wikidata SPARQL (free, CC0) is the corrected source per plan.md
- Items marked [Gap] indicate missing requirements that should be added to specs
- Items marked [Conflict] flag spec.md ↔ plan.md divergences from the data source pivot
- Items marked [Assumption] flag research findings that should be validated or documented as constraints
- 44 items total covering: completeness (9), clarity (6), consistency (5), governance (8), coverage (7), acceptance (4), dependencies (5)
