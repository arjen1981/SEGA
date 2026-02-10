# Quickstart: Random Ego-Graph Focus

**Feature**: 002-random-ego-focus  
**Branch**: `002-random-ego-focus`

## What This Feature Does

On every page load, a random SEGA entity (game, studio, platform, or creator) is spotlighted: centered in the graph with only its direct connections visible and its detail panel open. Users explore by clicking neighbors to shift the spotlight, or click "Expand All" to see the complete graph.

## Prerequisites

- Feature 001 (SEGA Graph Visualization) fully implemented
- Static file server (e.g., `serve.ps1`) to serve from project root
- Modern browser (Chrome, Firefox, Safari, Edge)

## How to Run

1. Start the server:
   ```powershell
   powershell -File serve.ps1
   ```

2. Open `http://localhost:8080/src/index.html` in a browser.

3. A random node is spotlighted on load — click neighbors to explore.

## How to Test

1. Open `http://localhost:8080/tests/index.html` in a browser.

2. QUnit test runner executes all unit and integration tests.

## Key Files (New or Modified)

| File | Status | Purpose |
|------|--------|---------|
| `src/js/ego-graph.js` | **NEW** | Ego-graph state management, neighborhood filtering, random selection |
| `src/js/app.js` | Modified | Wire ego-graph into init flow, update selectNode handler to call applyEgoGraph |
| `src/js/search.js` | Modified | selectSuggestion triggers ego-graph instead of just focus |
| `src/index.html` | Modified | Add "Expand All" button in header; hide filter toolbar by default |
| `src/css/styles.css` | Modified | Styles for "Expand All" button; filter toolbar hidden state |
| `tests/unit/ego-graph.test.js` | **NEW** | Unit tests for ego-graph module |
| `tests/integration/ego-graph-integration.test.js` | **NEW** | Integration test for full ego-graph flow |

## Architecture

```
User opens page
  → app.js init()
    → Fetch nodes.json + edges.json
    → createGraph() (all nodes, as before)
    → initEgoGraph(network)
    → spotlightId = pickRandomSpotlight(nodesData)
    → applyEgoGraph(spotlightId)
      → getConnectedNodes() → neighborIds
      → Hide non-neighbor nodes (hidden: true, physics: false)
      → Hide non-neighborhood edges
      → focus() camera on spotlight
      → openDetailPanel(spotlightId)
      → Hide filter toolbar
      → Show "Expand All" button
    → mode = "ego"

User clicks neighbor (ego mode)
  → selectNode event
    → applyEgoGraph(clickedNodeId)  (same flow as above)

User clicks "Expand All"
  → expandAll()
    → Unhide all nodes/edges (hidden: false, physics: true)
    → fit() viewport
    → Show filter toolbar
    → Hide "Expand All" button
    → mode = "full"

User clicks node (full mode)
  → selectNode event
    → applyEgoGraph(clickedNodeId) (back to ego mode)
```
