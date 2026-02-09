# Implementation Plan: SEGA Studio Graph Visualization

**Branch**: `001-sega-graph-visualization` | **Date**: 2026-02-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-sega-graph-visualization/spec.md`

## Summary

Build a static HTML + JavaScript application that renders an interactive
force-directed network graph visualizing SEGA's arcade ecosystem. Nodes
represent SEGA (root), internal studios, arcade platforms, arcade game
titles, and notable creators. Clicking a node reveals a detail panel with
Wikipedia-sourced information. The application ships as static files
(HTML/CSS/JS + JSON data) suitable for any static hosting provider. Data
is pre-compiled from Wikipedia at build time into local JSON files.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+) — no build step required
**Primary Dependencies**: vis-network v10 (CDN: single `<script>` tag from unpkg, ~95 KB gzipped)
**Storage**: Local JSON files (`nodes.json`, `edges.json`) loaded via `fetch()` at runtime — no database
**Testing**: QUnit v2.25 (CDN: 1 JS + 1 CSS file, browser-based test runner)
**Linting**: Biome (dev-only `package.json` with single devDependency)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge); static file hosting
**Project Type**: single — static web application
**Performance Goals**: Graph interactive within 3 seconds load; pan/zoom/drag at 60 fps; filter updates < 0.5 seconds
**Constraints**: No server-side processing; no build toolchain required; all files serveable from static host; up to 200 nodes rendered simultaneously
**Scale/Scope**: ~100–200 nodes (10–15 studios, 10–20 arcade platforms, 30–50 arcade games, 20–30 creators) with ~300–500 edges
**Data Source**: Wikipedia REST API + Wikidata SPARQL → pre-compiled static JSON (one-time build step)

## Constitution Check (Pre-Research)

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Code Readability & Maintainability | ✅ PASS | Single-responsibility JS modules (graph.js, detail-panel.js, filters.js, search.js); self-documenting naming; no build complexity |
| II. User-Centric Design | ✅ PASS | 4 user stories with acceptance criteria defined in spec; UX modeled on proven reference site |
| III. Test-Driven Quality Assurance | ✅ PASS | QUnit selected (research R2): CDN-loadable, browser-based, built-in DOM fixture reset; test runner is a static HTML file |
| IV. Consistent Code Standards | ✅ PASS | Biome selected (research R4): single tool for JS/CSS/HTML linting + formatting; dev-only package.json; CI-runnable |
| V. Performance & Accessibility | ✅ PASS | Latency targets defined (3s load, 200ms feedback, 200 nodes); WCAG 2.1 AA noted in spec; vis-network handles 200 nodes well |
| VI. Wikipedia as Single Source of Truth | ✅ PASS | FR-008 mandates Wikipedia-only; FR-009 handles missing data; hybrid Wikidata+Wikipedia pipeline (research R3); CC-BY-SA attribution via links |

**Gate Result**: ✅ PASS — all principles satisfied, all NEEDS CLARIFICATION resolved

## Project Structure

### Documentation (this feature)

```text
specs/001-sega-graph-visualization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.html           # Main entry point
├── css/
│   └── styles.css       # Application styles
├── js/
│   ├── app.js           # Application bootstrap and initialization
│   ├── graph.js         # Graph rendering and force simulation
│   ├── detail-panel.js  # Node detail panel display logic
│   ├── filters.js       # Node category filter controls
│   └── search.js        # Search / autocomplete functionality
└── data/
    ├── nodes.json       # All node entities (studios, platforms, games, creators)
    └── edges.json       # All relationships between nodes

tests/
├── unit/                # Unit tests for JS modules
└── integration/         # Browser-based integration tests
```

**Structure Decision**: Single project layout. This is a static web
application with no backend. All source lives under `src/` with a
flat JS module structure. Data files are co-located under `src/data/`
so they deploy alongside the HTML. Tests live in a parallel `tests/`
directory at the repository root.

## Complexity Tracking

> No constitution violations requiring justification.

## Constitution Check (Post-Design)

*Re-evaluated after Phase 1 design artifacts are complete.*

| Principle | Status | Post-Design Evidence |
|-----------|--------|---------------------|
| I. Code Readability & Maintainability | ✅ PASS | 5 single-responsibility JS modules defined in project structure; clear separation of concerns (graph.js, detail-panel.js, filters.js, search.js, app.js) |
| II. User-Centric Design | ✅ PASS | quickstart.md documents end-to-end user flow; data-model.md entities map 1:1 to spec's user story node types; detail panel content sourced from Wikipedia summaries |
| III. Test-Driven Quality Assurance | ✅ PASS | QUnit selected with CDN delivery; test directory structure defined (`tests/unit/`, `tests/integration/`); DOM fixture reset enables isolated acceptance scenario testing |
| IV. Consistent Code Standards | ✅ PASS | Biome configured as single linter/formatter for JS/CSS/HTML; `biome.json` config defined; CI gate via `npx biome check` |
| V. Performance & Accessibility | ✅ PASS | vis-network's barnesHut physics handles 200 nodes; JSON data files are lightweight (~50–100 KB); no server round-trips at runtime |
| VI. Wikipedia as Single Source of Truth | ✅ PASS | Data model requires `wikipediaUrl` and `wikidataId` on every node; `summary` field sourced from Wikipedia `/page/summary/` API; JSON schemas enforce URL format; detail panel links back to Wikipedia article |

**Post-Design Gate Result**: ✅ PASS — all principles fully satisfied with concrete design evidence
