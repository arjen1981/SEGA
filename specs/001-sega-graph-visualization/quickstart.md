# Quickstart: SEGA Studio Graph Visualization

**Feature**: `001-sega-graph-visualization`
**Date**: 2026-02-09

---

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local static file server (any of the options below)
- Node.js (optional, dev-only — for Biome linting and QUnit test runner)

## Quick Launch

### 1. Serve the static files

The application must be served over HTTP (not `file://`) because
`fetch()` requires it for loading JSON data files.

**Option A — Python (if installed):**
```bash
cd src
python -m http.server 8080
```

**Option B — Node.js (if installed):**
```bash
npx serve src
```

**Option C — VS Code Live Server extension:**
Right-click `src/index.html` → "Open with Live Server"

### 2. Open in browser

Navigate to `http://localhost:8080` (or the port shown by your server).

You should see:
- An interactive force-directed graph with SEGA at the center
- Color-coded nodes: studios, arcade platforms, games, creators
- Labeled edges showing relationships

### 3. Interact

- **Drag** a node to reposition it
- **Scroll** to zoom in/out
- **Click + drag** on empty space to pan
- **Click** a node to open the detail panel with Wikipedia information
- **Use filter controls** to show/hide node categories
- **Use the search field** to find a specific entity

---

## Development Setup

### Install dev tools (one-time)

```bash
npm install
```

This installs Biome (linter/formatter) as the only dev dependency.
The application itself has no npm dependencies.

### Lint & format

```bash
npx biome check --write
```

### Run tests

Open `tests/index.html` in a browser. This is a QUnit test runner that
loads all test modules. No Node.js required to run tests.

Alternatively, with a local server:
```bash
npx serve . &
open http://localhost:3000/tests/index.html
```

---

## Project Structure

```
src/
├── index.html           # Main application entry point
├── css/styles.css       # All application styles
├── js/
│   ├── app.js           # Bootstrap and initialization
│   ├── graph.js         # vis-network graph rendering
│   ├── detail-panel.js  # Click-to-reveal detail panel
│   ├── filters.js       # Category filter controls
│   └── search.js        # Search / autocomplete
└── data/
    ├── nodes.json       # Pre-compiled entity data
    └── edges.json       # Pre-compiled relationship data

tests/
├── index.html           # QUnit test runner
├── unit/                # Unit tests per module
└── integration/         # Integration tests

biome.json               # Biome linter/formatter config
package.json             # Dev-only (Biome dependency)
```

---

## Data Updates

The JSON data files are pre-compiled from Wikipedia/Wikidata.
To update the data:

1. Edit the entity seed list
2. Re-run the data compilation pipeline (Wikidata SPARQL + Wikipedia REST API)
3. Replace `src/data/nodes.json` and `src/data/edges.json`
4. Validate against schemas in `specs/001-sega-graph-visualization/contracts/`

---

## Deployment

Copy the entire `src/` directory to any static hosting provider:
- GitHub Pages
- Netlify
- Vercel
- Any web server serving static files

No build step required. The `src/` directory IS the deployable artifact.
