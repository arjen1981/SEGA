# Quickstart: URL-Based Deep Linking

**Feature**: 011-url-deep-linking  
**Date**: 2026-03-24

## What This Feature Does

Adds URL hash-based deep linking to the SEGA graph. When a user selects a node, the URL updates to `#node=<nodeId>`. When someone opens that URL, the app navigates directly to that node. Browser back/forward works. Invalid hashes are handled gracefully.

## Key Files

| File | Role |
|------|------|
| `src/js/deep-link.js` | **NEW** — Hash parsing, URL updates, popstate listener |
| `src/js/app.js` | **MODIFIED** — Wire deep-link module into init flow |
| `src/css/styles.css` | **MODIFIED** — Toast notification styles |
| `tests/unit/deep-link.test.js` | **NEW** — Unit tests for hash parsing and URL updates |
| `tests/integration/deep-link-integration.test.js` | **NEW** — Navigation flow tests |

## How It Works

### URL Format

```
https://example.com/index.html#node=virtua-fighter
                               └── hash fragment
```

### Module API

```javascript
import { initDeepLink, updateHash, clearHash } from "./deep-link.js";

// 1. Initialize after data is loaded
const { initialNodeId } = initDeepLink(nodeMap, {
  onNavigate: (nodeId) => {
    applyEgoGraph(nodeId);
    openDetailPanel(nodeId);
  },
  onInvalidNode: (nodeId) => {
    showToast(`Node "${nodeId}" not found`);
    // fall back to random spotlight
  },
});

// 2. On node select → update URL
network.on("selectNode", (params) => {
  updateHash(params.nodes[0]);
});

// 3. On deselect → clear URL
network.on("deselectNode", () => {
  clearHash();
});

// 4. On initial load → use deep link instead of random spotlight
if (initialNodeId) {
  applyEgoGraph(initialNodeId);
  openDetailPanel(initialNodeId);
} else {
  // default random spotlight
}
```

### Browser History Flow

```
User clicks Node A  →  pushState("#node=a")  →  URL: #node=a
User clicks Node B  →  pushState("#node=b")  →  URL: #node=b
User presses Back   →  popstate fires        →  reads #node=a → navigates to A
User presses Forward→  popstate fires        →  reads #node=b → navigates to B
User deselects      →  pushState("")          →  URL: (no hash)
```

## Running Tests

```powershell
# Start the dev server
.\serve.ps1

# Open tests in browser
start http://localhost:8080/tests/
```

## Acceptance Criteria Summary

1. Click a node → URL updates to `#node=<id>`
2. Open URL with valid `#node=<id>` → node is focused with detail panel
3. Back/forward buttons navigate between previously selected nodes
4. Invalid `#node=nonexistent` → fallback to default view + toast notification
5. Deselect node → hash is cleared from URL
