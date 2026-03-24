# Feature Specification: Accessibility Improvements

**Feature Branch**: `010-a11y-improvements`
**Created**: 2025-01-28
**Status**: Draft
**Input**: User description: "Improve accessibility: keyboard navigation for search suggestions and aria-live region for detail panel"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Keyboard Navigation for Search Suggestions (Priority: P1)

A keyboard-only user opens the application and wants to find a specific game, creator, or platform. They type a search query in the search input field. As results appear in the suggestion dropdown, they use the Arrow Down and Arrow Up keys to move through the list. The currently highlighted suggestion is visually distinct and announced by their screen reader. They press Enter to select the highlighted suggestion, which focuses the graph on that node and opens its detail panel. If they change their mind, pressing Escape closes the dropdown and returns focus to the search input.

**Why this priority**: Keyboard navigation is a fundamental accessibility requirement (WCAG 2.1 Level A, Success Criterion 2.1.1). Without it, keyboard-only users and many assistive technology users cannot use the search feature at all. The search dropdown already has `role="listbox"` markup but no keyboard interaction, making it non-functional for these users.

**Independent Test**: Can be fully tested by tabbing to the search input, typing a query, then using arrow keys to navigate suggestions and Enter to select — all without using a mouse. Delivers a fully keyboard-accessible search flow.

**Acceptance Scenarios**:

1. **Given** the search input is focused and suggestions are visible, **When** the user presses Arrow Down, **Then** the first suggestion becomes highlighted and the screen reader announces it
2. **Given** a suggestion is highlighted, **When** the user presses Arrow Down again, **Then** the next suggestion in the list becomes highlighted
3. **Given** a suggestion is highlighted, **When** the user presses Arrow Up, **Then** the previous suggestion becomes highlighted
4. **Given** the first suggestion is highlighted, **When** the user presses Arrow Up, **Then** highlight wraps to the last suggestion
5. **Given** the last suggestion is highlighted, **When** the user presses Arrow Down, **Then** highlight wraps to the first suggestion
6. **Given** a suggestion is highlighted, **When** the user presses Enter, **Then** that suggestion is selected, the graph focuses on the node, the detail panel opens, and the dropdown closes
7. **Given** suggestions are visible, **When** the user presses Escape, **Then** the dropdown closes and focus remains on the search input
8. **Given** no suggestions are highlighted, **When** the user continues typing, **Then** any previous highlight is reset and the suggestion list updates with new results

---

### User Story 2 — Screen Reader Announcements for Detail Panel (Priority: P2)

A screen reader user navigates the SEGA Arcade Universe. When they click on a node (or select a search result), the detail panel slides open and shows information about that entity. Their screen reader automatically announces that new content is available in the detail panel — including the entity name — so the user knows the panel has updated. When the user clicks a different node, the screen reader announces the updated content without requiring the user to manually navigate to the panel.

**Why this priority**: Without live-region announcements, screen reader users have no way of knowing when the detail panel content changes. They must manually navigate to the panel each time to discover whether it updated. This is a significant usability barrier (WCAG 2.1 Level A, Success Criterion 4.1.3). It ranks P2 because the application is still partially usable without it (users can manually navigate), unlike the search keyboard gap which blocks functionality entirely.

**Independent Test**: Can be fully tested by enabling a screen reader, clicking different nodes in the graph, and verifying that each click triggers an announcement of the newly displayed entity name and type.

**Acceptance Scenarios**:

1. **Given** the detail panel is closed, **When** the user selects a node, **Then** the detail panel opens and the screen reader announces the entity name
2. **Given** the detail panel is open showing entity A, **When** the user selects entity B, **Then** the panel updates and the screen reader announces entity B's name
3. **Given** the detail panel is open, **When** the user closes the panel, **Then** the screen reader announces that the panel has been closed

---

### Edge Cases

- What happens when the user presses Arrow Down with an empty suggestion list? Nothing should happen; no error or focus shift
- What happens when search results change while a suggestion is highlighted? The highlight resets to none; the user starts navigating from the top again
- What happens when the detail panel receives content that is identical to its current content (same node clicked twice)? The live region suppresses the duplicate — no re-announcement occurs
- What happens when the user navigates suggestions and then clicks outside? The dropdown closes, highlight resets
- What happens when the suggestion list has only one item? Arrow Down and Arrow Up both keep that item highlighted (or wrap to the same item)
- What happens when the user presses Enter with no suggestion highlighted? Enter is ignored; no selection occurs

## Clarifications

### Session 2026-03-24

- Q: What should happen when the user presses Enter with the suggestion list visible but no suggestion highlighted? → A: Do nothing (ignore Enter when no highlight is active)
- Q: Should the detail panel live region re-announce when the same node is selected consecutively? → A: Suppress duplicate announcements; do not re-announce if the panel already shows the same node

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The search input MUST support Arrow Down and Arrow Up keys to move a visual highlight through the suggestion list items
- **FR-002**: The currently highlighted suggestion MUST be visually distinguishable from non-highlighted suggestions (e.g., background color change)
- **FR-003**: Pressing Enter while a suggestion is highlighted MUST select that suggestion (focus graph on node, open detail panel, close dropdown). Pressing Enter with no highlight active MUST be ignored (no selection, no side effects)
- **FR-004**: Pressing Escape MUST close the suggestion dropdown and keep focus on the search input
- **FR-005**: Arrow navigation MUST wrap: Arrow Down on the last item moves to the first; Arrow Up on the first item moves to the last
- **FR-006**: The search input MUST use `aria-activedescendant` to indicate the currently highlighted suggestion to assistive technology
- **FR-007**: The search input MUST use `role="combobox"` with `aria-expanded` reflecting whether the suggestion list is currently visible
- **FR-008**: Each suggestion list item MUST have a unique `id` attribute for `aria-activedescendant` referencing
- **FR-009**: When the user types new characters, any existing highlight MUST reset so navigation starts from the beginning of the updated list
- **FR-010**: The detail panel MUST use an `aria-live` region so screen readers announce content changes automatically
- **FR-011**: When the detail panel opens or updates with a different node, the screen reader MUST announce at minimum the entity name. Consecutive selections of the same node MUST NOT trigger a duplicate announcement
- **FR-012**: When the detail panel closes, the screen reader MUST announce that the panel has been dismissed

## Assumptions

- The application already has a dark retro SEGA theme; the highlighted suggestion styling will follow existing color conventions
- The `role="listbox"` on the suggestion UL and `role="option"` on each LI are already present and will be preserved
- Wrapping navigation (last→first, first→last) is preferred over stopping at boundaries, based on common combobox patterns (WAI-ARIA Combobox pattern)
- The `aria-live` region will use `polite` assertiveness level to avoid interrupting active user tasks
- Only one detail panel exists; it updates in place rather than stacking multiple panels

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A keyboard-only user can search for and select any entity using only the keyboard, without touching a mouse, completing the flow in under 30 seconds
- **SC-002**: 100% of search suggestion interactions (navigate, select, dismiss) are operable via keyboard
- **SC-003**: Screen reader users are automatically informed of detail panel content changes within 2 seconds of a node being selected
- **SC-004**: The feature passes automated accessibility checks (axe-core or equivalent) with zero new violations introduced
- **SC-005**: All existing mouse-based search and detail panel interactions continue to work unchanged
