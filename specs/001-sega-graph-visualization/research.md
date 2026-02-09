# Research: SEGA Studio Graph Visualization

**Feature**: `001-sega-graph-visualization`
**Date**: 2026-02-09
**Purpose**: Resolve all NEEDS CLARIFICATION items from the implementation plan

---

## R1: Graph Visualization Library

**NEEDS CLARIFICATION**: Which JavaScript graph library to use?

### Decision: vis-network

**Rationale**: vis-network provides the most "batteries-included" experience
for this project's specific requirements. Its `groups` feature maps directly
to the four node categories (studios, platforms, games, creators),
automatically applying distinct colors and shapes. Edge labels, tooltips,
node images, and interactive physics all work via simple configuration
properties rather than custom rendering code.

### Alternatives Considered

| Library | Verdict | Reason |
|---------|---------|--------|
| **D3.js (d3-force)** | Rejected | Too low-level. Every interaction (pan, zoom, drag, click) and visual feature must be hand-built. Estimated 3–5× more code than vis-network for the same result. |
| **Cytoscape.js** | Runner-up | Strong contender but slightly more complex: best force layout (fcose) requires an additional extension script; edge labels/tooltips need the popper/qtip extension. More setup friction than vis-network for comparable results. Viable fallback. |
| **force-graph** | Runner-up | Most actively maintained, smallest bundle (~50 KB gzipped), simplest API. Trade-off: custom node shapes per category require writing `nodeCanvasObject` Canvas callbacks (~30–50 lines of custom drawing code that vis-network handles declaratively). |
| **Sigma.js** | Eliminated | ESM-only; no UMD/CDN bundle available. Requires npm + bundler. Fails the "no build step" constraint (FR-012). Designed for 10K+ node graphs — overkill for ~200 nodes. |

### Key Facts

- **CDN**: `<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>` — single tag, zero dependencies
- **Bundle size**: ~300 KB minified / ~95 KB gzipped
- **Force layout**: Built-in physics simulation with `barnesHut` solver (default), works well at 200 nodes with zero tuning
- **Interactions**: Built-in pan, zoom, drag, click, hover, tooltips, selection — all configurable via options object
- **Node groups**: Declarative per-category styling (color, shape, icon) via `groups` configuration
- **Edge labels**: Native `label` and `title` properties on edge objects
- **Maintenance**: Community-maintained (v10.0.2), stable and mature

---

## R2: Testing Framework

**NEEDS CLARIFICATION**: Browser-based JavaScript testing approach

### Decision: QUnit

**Rationale**: QUnit is the only CDN-loadable testing framework with a
built-in DOM fixture reset mechanism (`#qunit-fixture`). Since this project's
acceptance scenarios are heavily DOM-centric (detail panels, filters, search),
automatic fixture cleanup between tests is essential for reliable test
isolation. QUnit loads from two CDN files (JS + CSS), requires no npm/Node.js,
and the test runner is itself a static HTML file — perfectly aligned with the
project's static-files-only philosophy.

### Alternatives Considered

| Framework | Verdict | Reason |
|-----------|---------|--------|
| **Jasmine Standalone** | Runner-up | Works without npm. Built-in spies are a plus. But no automatic DOM fixture reset, and 5-file boot sequence adds friction. |
| **Mocha + Chai (browser)** | Rejected | Chai v5+ dropped browser UMD bundle; must pin Chai v4 (unmaintained). Two-library dependency with version-pinning workaround is fragile. |
| **Vitest / Jest** | Rejected | Requires npm + Node.js. Uses jsdom (simulated DOM) which cannot test Canvas/SVG rendering, pointer events, or layout — the core of this app's user stories. |
| **Custom HTML runner** | Rejected | No test isolation, no structured output, no async support. Unmanageable beyond 2–3 smoke tests. |

### Key Facts

- **CDN**: `<script src="https://code.jquery.com/qunit/qunit-2.25.0.js">` + `<link href="...qunit-2.25.0.css">`
- **Fixture reset**: Built-in `#qunit-fixture` div automatically resets after every test
- **Assertions**: Built-in `assert.equal()`, `assert.deepEqual()`, `assert.ok()`, `assert.strictEqual()`
- **Async**: Native `async/await` support in test functions

---

## R3: Wikipedia Data Extraction Strategy

**Context**: Constitution Principle VI mandates Wikipedia as the sole data source.

### Decision: Hybrid pipeline — Wikidata for relationships + Wikipedia REST API for summaries

**Rationale**: Relationships between entities (e.g., "game X runs on platform Y",
"creator Z worked at studio W") are structured in Wikidata as machine-readable
properties (P178=developer, P400=platform, P123=publisher). Wikipedia's prose
articles do not encode these relationships in a parseable way. However,
Wikipedia's REST API `/page/summary/{title}` endpoint returns clean JSON with
summary text, thumbnail, and description — ideal for detail panel content.
The recommended approach combines both sources.

### Pipeline

1. **Curate seed list**: Manually list the ~100–200 entities to include
   (studios, arcade platforms, arcade games, creators) with their Wikipedia
   article titles and Wikidata Q-IDs.
2. **Wikidata SPARQL/API**: For each entity, fetch structured properties
   that encode relationships:
   - Games: `P178` (developer), `P400` (platform), `P123` (publisher)
   - Studios: `P749` (parent org), `P571` (inception date)
   - Platforms: `P176` (manufacturer), `P577` (publication date)
   - Creators: `P108` (employer), `P800` (notable work)
3. **Wikipedia REST API**: For each entity, fetch `/page/summary/{title}`
   to get:
   - `extract` — first paragraph summary text
   - `thumbnail.source` — thumbnail image URL
   - `description` — short description
   - `content_urls.desktop.page` — canonical Wikipedia link
4. **Manual gap-fill**: Review output for missing relationships or entities
   not in Wikidata. Add manually with Wikipedia article as citation.
5. **Compile to static JSON**: Output `nodes.json` and `edges.json`.

### Licensing

| Source | License | Obligation |
|--------|---------|------------|
| **Wikidata** | CC0 (public domain) | None — unrestricted use |
| **Wikipedia text** | CC-BY-SA 3.0 | Attribution required; link back to source article |
| **Wikipedia thumbnails** | Varies per image | Link to Wikimedia-hosted URL to avoid per-image license auditing |

### Key Facts

- `/page/summary/{title}` returns: `title`, `extract`, `description`, `thumbnail`, `content_urls`, `wikibase_item` (Wikidata Q-ID)
- Wikidata SPARQL endpoint: `https://query.wikidata.org/sparql`
- The data compilation is a **one-time build step**, not a runtime operation

---

## R4: Linter & Formatter

**Context**: Constitution Principle IV requires consistent, enforced code standards.

### Decision: Biome

**Rationale**: Biome is a single tool that lints and formats JavaScript, CSS,
and HTML — eliminating the multi-tool coordination burden of ESLint + Prettier +
Stylelint. It requires only one config file (`biome.json`) with sensible
defaults out of the box. A dev-only `package.json` with a single devDependency
(`@biomejs/biome`) keeps the development toolchain minimal while the deployed
application remains pure static files.

### Alternatives Considered

| Tool | Verdict | Reason |
|------|---------|--------|
| **ESLint + Prettier** | Rejected | Two tools, two configs, conflict-resolution plugin needed. Overkill for a small static project. No CSS linting without Stylelint (third tool). |
| **StandardJS** | Rejected | JS-only; no HTML/CSS coverage. Enforces no-semicolons style (not configurable). |
| **VS Code extensions only** | Rejected | Fails Principle IV — standards suggested but not enforced. No CI gate, no reproducibility outside VS Code. |

### Key Facts

- **Config**: Single `biome.json` file with zero-config defaults
- **Coverage**: JS linting (434 rules) + formatting, CSS linting + formatting, HTML formatting
- **Dev-only package.json**: One devDependency; deployed app has no Node.js dependency
- **CI gate**: `npx biome check` returns non-zero on violations
- **VS Code extension**: Official first-party extension (`biomejs.biome`) with format-on-save

---

## Resolution Summary

| NEEDS CLARIFICATION | Resolution |
|---------------------|------------|
| Primary Dependencies | **vis-network** (CDN, single script tag) |
| Testing | **QUnit** (CDN, browser-based, built-in DOM fixture reset) |
| Wikipedia data approach | **Hybrid**: Wikidata SPARQL for relationships + Wikipedia REST API for summaries → static JSON |
| Linter/Formatter | **Biome** (dev-only, single tool for JS/CSS/HTML) |

All NEEDS CLARIFICATION items are now resolved.
