# Implementation Plan: Expand SEGA Arcade Graph Data

**Branch**: `004-expand-sega-arcade` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-expand-sega-arcade/spec.md`

## Summary

Expand the SEGA arcade graph dataset from 93 nodes (1 company, 7 studios, 13 platforms, 67 games, 5 creators) to ~170–200 nodes by adding 15+ new creators with structured `roles` arrays, 20+ new game nodes, and any missing arcade platform nodes. Migrate existing "created" edges to Wikipedia-specific credit terms (designed, programmed, composed for, artwork for, directed, produced). Add a small code change to render `roles` as badges in the detail panel. All data sourced exclusively from English Wikipedia.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES modules, no transpilation)
**Primary Dependencies**: vis-network v10 (CDN), QUnit 2.25 (CDN), Google Fonts (Press Start 2P)
**Storage**: Static JSON files (`src/data/nodes.json`, `src/data/edges.json`)
**Testing**: QUnit 2.25 via `tests/index.html` (browser-based, no CLI runner)
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari)
**Project Type**: Single static web app — no build pipeline, no server
**Performance Goals**: Graph renders and stabilizes within 5 seconds with expanded dataset (SC-006); total node count under 200 (FR-012)
**Constraints**: Wikipedia as sole data source (Constitution VI); no console platforms; SEGA-only titles; `additionalProperties: false` in JSON schemas
**Scale/Scope**: ~170–200 nodes, ~300–400 edges after expansion

### Current Baseline

| Entity   | Current Count | Target    |
|----------|---------------|-----------|
| Company  | 1             | 1 (no change) |
| Studio   | 7             | 7 (no change) |
| Platform | 13            | 15–17     |
| Game     | 67            | 87+       |
| Creator  | 5             | 20+       |
| **Total**| **93**        | **~170–200** |

| Edge Label   | Current Count | Change        |
|-------------|---------------|---------------|
| division of | 7             | No change     |
| developed by| 67            | +20 (new games) |
| runs on     | 64            | +20 (new games) |
| worked at   | 7             | +15+ (new creators) |
| created     | 4             | **Remove** (migrate to specific terms) |
| directed    | 4             | +many         |
| produced    | 3             | +many         |
| designed    | 0             | **New**       |
| programmed  | 0             | **New**       |
| composed for| 0             | **New**       |
| artwork for | 0             | **New**       |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Code Readability & Maintainability | ✅ PASS | Only change is adding role badge rendering to detail-panel.js — single-responsibility, descriptive naming. Data changes are JSON-only. |
| II | User-Centric Design | ✅ PASS | Spec contains 3 user stories with acceptance scenarios, edge cases, and independent test instructions. |
| III | Test-Driven Quality Assurance | ✅ PASS | Detail panel role badge rendering gets a new test. Data validated via `validate-data.ps1` and JSON schemas. Existing tests must not regress. |
| IV | Consistent Code Standards | ✅ PASS | Biome linter/formatter enforced. New edge labels follow existing patterns. `roles` array follows same style as other node fields. |
| V | Performance & Accessibility | ✅ PASS | SC-006 mandates <5s render. FR-012 caps nodes at 200. Badges use semantic HTML. |
| VI | Wikipedia as Single Source of Truth | ✅ PASS | All new data sourced from Wikipedia. `wikipediaUrl` required on every node (FR-009). No fabricated credits (edge case #2). |

**Gate result**: PASS — no violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-expand-sega-arcade/
├── plan.md              # This file
├── research.md          # Phase 0: Wikipedia research findings
├── data-model.md        # Phase 1: Entity schema extensions
├── quickstart.md        # Phase 1: Setup and validation guide
├── contracts/           # Phase 1: Updated JSON schemas
│   ├── nodes.schema.json
│   └── edges.schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── nodes.json       # PRIMARY: Add ~80+ new nodes (creators, games, platforms)
│   └── edges.json       # PRIMARY: Add ~200+ new edges, migrate "created" → specific terms
├── js/
│   ├── detail-panel.js  # MODIFY: Add roles badge rendering (FR-015)
│   ├── app.js           # No change expected
│   ├── graph.js         # No change expected (FR-014: new edge types work without code changes)
│   ├── ego-graph.js     # No change expected
│   ├── filters.js       # No change expected
│   ├── icons.js         # No change expected
│   └── search.js        # No change expected
├── css/
│   └── styles.css       # MODIFY: Add .role-badge styles
└── index.html           # No change expected

tests/
├── unit/
│   └── detail-panel.test.js  # MODIFY: Add role badge rendering tests
└── integration/              # No change expected
```

**Structure Decision**: Single static web app. This feature is primarily a data expansion (JSON files) with one small code change (role badges in detail panel + CSS). No new JS modules needed.

## Constitution Check — Post-Design Re-evaluation

*Re-checked after Phase 1 design artifacts (data-model.md, contracts/, quickstart.md) are complete.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Code Readability & Maintainability | ✅ PASS | Role badge rendering is a 5-line addition to `renderNode()` in detail-panel.js. Follows existing pattern (group badge). CSS follows existing `.badge-*` convention. |
| II | User-Centric Design | ✅ PASS | Role badges provide structured display per user request. Quickstart includes 9-point manual verification checklist. |
| III | Test-Driven Quality Assurance | ✅ PASS | New QUnit test for role badge rendering. `validate-data.ps1` covers data integrity. Contracts define JSON schemas for automated validation. |
| IV | Consistent Code Standards | ✅ PASS | Data model extends existing schemas additively (`roles` field, new enum values). No new patterns introduced. |
| V | Performance & Accessibility | ✅ PASS | Projected ~130 nodes — well under 200 cap. Badge uses `<span>` with text content (screen reader friendly). |
| VI | Wikipedia as Single Source of Truth | ✅ PASS | research.md documents 14 creators + 17–25 games with verified Wikipedia URLs. Uncertain edges flagged. No fabricated data. |

**Post-design gate result**: PASS — no violations, no changes from pre-design check.
