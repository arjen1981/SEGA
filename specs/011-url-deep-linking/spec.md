# Feature Specification: URL-Based Deep Linking

**Feature Branch**: `011-url-deep-linking`  
**Created**: 2026-03-24  
**Status**: Draft  
**Input**: User description: "URL-based deep linking — gebruik location.hash zodat je een directe link naar een specifieke node kunt delen (bijv. #node=virtua-fighter). Kost weinig moeite, enorm nuttig."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Share a Direct Link to a Node (Priority: P1)

A user is viewing a specific node (e.g. "Virtua Fighter") in the SEGA graph and wants to share that exact view with someone else. The user copies the browser URL — which now contains a hash fragment like `#node=virtua-fighter` — and sends it to a colleague. When the colleague opens the link, the graph loads and automatically focuses on the "Virtua Fighter" node with its detail panel open, just as if they had clicked on it.

**Why this priority**: This is the core value proposition — enabling shareable, bookmarkable links to specific graph nodes.

**Independent Test**: Navigate to a node, verify the URL updates, copy the URL, open it in a new tab, and confirm the correct node is focused and displayed.

**Acceptance Scenarios**:

1. **Given** the graph is loaded and no hash is in the URL, **When** a user clicks on the node "sega-am2", **Then** the URL updates to `#node=sega-am2` without a page reload.
2. **Given** a user opens the app with `#node=virtua-fighter` in the URL, **When** the graph finishes loading, **Then** the "Virtua Fighter" node is selected, the ego-graph is activated for that node, and the detail panel opens showing its information.
3. **Given** a user opens the app with `#node=virtua-fighter`, **When** the graph finishes loading, **Then** the graph viewport is centered on the linked node so it is visible to the user.

---

### User Story 2 - Navigate Away and Back via Browser History (Priority: P2)

A user selects node A, then selects node B. Each selection updates the URL hash. The user presses the browser back button and is navigated back to node A — the graph re-focuses on node A and the detail panel updates accordingly.

**Why this priority**: Browser history integration makes deep linking feel native and intuitive, complementing the sharing use case.

**Independent Test**: Select two nodes in sequence, press back, verify the first node is re-focused. Press forward, verify the second node is shown again.

**Acceptance Scenarios**:

1. **Given** a user has selected node A and then node B, **When** the user presses the browser back button, **Then** node A is selected, focused, and its detail panel is shown.
2. **Given** a user pressed back to return to node A, **When** the user presses the browser forward button, **Then** node B is selected, focused, and its detail panel is shown.
3. **Given** a user has selected a node and then deselects it (clicks empty space), **When** the URL hash is cleared, **Then** pressing back re-selects the previously viewed node.

---

### User Story 3 - Handle Invalid or Missing Node in URL (Priority: P2)

A user opens a link with a hash that references a node ID that does not exist (e.g., `#node=nonexistent-game`). The application loads normally with no errors, shows the default view (random spotlight), and displays a brief, non-intrusive message indicating the linked node was not found.

**Why this priority**: Graceful error handling prevents broken experiences when links become outdated or contain typos.

**Independent Test**: Open the app with an invalid node hash and verify the app loads normally with a user-friendly notification.

**Acceptance Scenarios**:

1. **Given** a user opens the app with `#node=nonexistent-game`, **When** the graph finishes loading, **Then** the app falls back to the default view (random spotlight) and displays a brief notification that the node was not found.
2. **Given** a user opens the app with a malformed hash like `#nonsense`, **When** the graph loads, **Then** the hash is ignored and the default view is shown without errors.
3. **Given** a user opens the app with an empty hash `#`, **When** the graph loads, **Then** the default view is shown as if no hash were present.

---

### Edge Cases

- What happens when a user manually edits the hash in the address bar while the app is running? The app should respond to `hashchange` events and navigate to the specified node or show a not-found message.
- What happens when the user deselects all nodes? The hash should be cleared from the URL so the default state has no hash fragment.
- What happens if the same node is already selected when the hash changes to that node? No redundant navigation or panel reload should occur.
- What happens when the hash contains URL-encoded characters? The system should decode the hash value before performing the node lookup.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST update the URL hash to `#node=<nodeId>` whenever a user selects a node in the graph.
- **FR-002**: The system MUST read the URL hash on initial page load and, if a valid `#node=<nodeId>` is present, select that node, activate its ego-graph, open its detail panel, and center the viewport on it.
- **FR-003**: The system MUST listen to `hashchange` events and navigate to the referenced node when the hash changes (e.g., via browser back/forward or manual URL editing).
- **FR-004**: The system MUST clear the hash from the URL when a user deselects all nodes (clicks empty canvas).
- **FR-005**: The system MUST gracefully handle invalid or non-existent node IDs in the hash by falling back to the default view and showing a brief, non-intrusive notification.
- **FR-006**: The system MUST skip the random spotlight selection on initial load when a valid deep-link hash is present.
- **FR-007**: The system MUST update the URL hash without causing a full page reload.
- **FR-008**: The system MUST URL-decode the hash parameter value before performing node lookups.
- **FR-009**: The system MUST ignore malformed hash fragments that do not match the `#node=<value>` pattern.

### Key Entities

- **Deep Link Hash**: A URL fragment in the format `#node=<nodeId>` where `nodeId` corresponds to a node's unique identifier in the graph dataset.
- **Node**: An existing entity in the graph (game, studio, franchise, person, etc.) with a unique kebab-case `id` field.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can share a URL containing a node hash, and recipients see the correct node focused with its detail panel open upon loading — 100% of valid node IDs resolve correctly.
- **SC-002**: Browser back/forward navigation between previously selected nodes works seamlessly without page reloads.
- **SC-003**: Invalid node hashes result in a graceful fallback with user notification — no console errors or broken UI states.
- **SC-004**: Selecting and deselecting nodes updates the URL hash in real time without any perceptible delay or page flicker.

## Assumptions

- Node IDs are stable, unique, kebab-case strings that are safe to use directly in URL hash fragments without complex encoding.
- The graph and node data are fully loaded before deep-link resolution is attempted (hash processing occurs after data fetch completes).
- The notification for invalid nodes uses the same visual patterns already present in the app (or a simple, dismissible inline message if none exist).
- Only one node can be deep-linked at a time (no multi-select deep linking).
