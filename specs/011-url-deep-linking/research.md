# Research: URL-Based Deep Linking

**Feature**: 011-url-deep-linking  
**Date**: 2026-03-24

## Research Tasks

### 1. Hash-based routing in static single-page apps

**Decision**: Use `location.hash` with the `hashchange` event for URL-based deep linking.

**Rationale**: The app is a static site with no build system or router library. The `location.hash` API is the simplest, most compatible approach for fragment-based routing — it doesn't require server configuration (unlike `history.pushState` with path-based routes), works with file:// protocol, and is natively supported across all browsers.

**Alternatives considered**:
- **history.pushState with path-based routes**: Would require server-side rewrite rules to serve index.html for all paths. The PowerShell dev server doesn't support this, and deploying to GitHub Pages would also need a 404.html workaround. Rejected as over-engineered for a single-parameter deep link.
- **URLSearchParams (query strings)**: Works but is unconventional for client-side state in static apps. Query params are typically server-consumed. Hash fragments are the standard for client-side-only navigation.

### 2. Hash update strategy: pushState vs. direct hash assignment

**Decision**: Use `history.pushState()` to update the URL and manually dispatch/handle navigation, rather than directly setting `location.hash`.

**Rationale**: Setting `location.hash = value` fires the `hashchange` event synchronously, which creates a re-entrancy problem: the node-select handler updates the hash, which fires `hashchange`, which tries to navigate to the node again. Using `history.pushState()` updates the URL without firing `hashchange`, giving us clean separation between user-initiated navigation (click → push state) and browser-initiated navigation (back/forward → popstate event). This is the standard pattern for SPAs.

**Implementation pattern**:
- **Node selected by user click** → `history.pushState(null, "", "#node=<id>")` (no event fires)
- **Browser back/forward** → listen for `popstate` event → read hash → navigate to node
- **Node deselected** → `history.pushState(null, "", location.pathname)` (clears hash)
- **Initial page load** → read `location.hash` directly → navigate if valid

**Alternatives considered**:
- **Direct `location.hash` assignment + guard flag**: Set a `suppressHashChange` flag before assignment, check it in the handler. Works but is fragile and error-prone with async operations. Rejected.

### 3. vis-network API for programmatic node selection and focus

**Decision**: Use the existing `applyEgoGraph(nodeId)` + `openDetailPanel(nodeId)` pattern already established in the app.

**Rationale**: The app already has a complete flow for focusing on a node:
1. `applyEgoGraph(nodeId)` — calls `network.selectNodes([nodeId])`, `network.focus(nodeId, ...)`, hides unrelated nodes
2. `openDetailPanel(nodeId)` — renders node info in the detail panel

This is exactly the same sequence triggered by a user click. The deep-link module just needs to call these same functions with the node ID from the hash.

**Key vis-network methods used by existing code**:
- `network.selectNodes([id])` — programmatic selection
- `network.focus(id, {scale, offset, animation})` — viewport centering
- `network.getConnectedNodes(id)` — neighbor lookup for ego mode

### 4. Notification pattern for invalid node IDs

**Decision**: Add a simple auto-dismissing toast notification that reuses the app's existing color scheme.

**Rationale**: The app currently has no toast/notification system. The existing `.error-message` style is for fatal load errors (centered modal). A lightweight toast in the bottom-left corner is more appropriate for a transient "node not found" message — it doesn't block interaction and auto-dismisses after a few seconds.

**Design**:
- Position: fixed, bottom-left (avoids overlap with detail panel on right)
- Duration: 4 seconds, then fade out
- Style: uses existing CSS custom properties (--color-text, --color-bg, etc.)
- Accessibility: `role="status"` and `aria-live="polite"` for screen reader announcement
- No close button needed (auto-dismisses; short duration)

**Alternatives considered**:
- **Console.warn only**: Not user-facing; violates FR-005 requirement for user notification. Rejected.
- **Reuse .error-message**: That's a centered blocking overlay for fatal errors. Using it for a transient notification would feel alarming and inconsistent. Rejected.
- **Browser alert()**: Blocks the thread and feels jarring. Rejected.

### 5. Guard against redundant navigation

**Decision**: Compare the requested node ID against `getSpotlightId()` before navigating.

**Rationale**: The ego-graph module already tracks the current spotlight node via `getSpotlightId()`. Before calling `applyEgoGraph()` + `openDetailPanel()`, the deep-link module checks if the target node is already the active spotlight. If so, it skips navigation entirely. This prevents unnecessary DOM updates, layout recalculations, and animation restarts.

### 6. Module architecture

**Decision**: Create a single new `deep-link.js` module with a clear public API.

**Rationale**: Follows the existing one-file-per-concern pattern (graph.js, ego-graph.js, detail-panel.js, etc.). The module encapsulates all hash read/write logic and exposes only what app.js needs for wiring.

**Exported API**:
- `initDeepLink(nodeMap, { onNavigate, onInvalidNode })` — sets up popstate listener, returns initial hash node ID (or null)
- `updateHash(nodeId)` — pushes new hash state (called on node select)
- `clearHash()` — clears hash from URL (called on node deselect)

**Integration point**: `app.js` calls `initDeepLink()` after data is loaded and graph is created, before the stabilization handler that would otherwise set a random spotlight.
