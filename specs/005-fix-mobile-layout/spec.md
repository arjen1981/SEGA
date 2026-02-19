# Feature Specification: Fix Mobile Layout & Detail Panel

**Feature Branch**: `005-fix-mobile-layout`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "Focus on the mobile view. The detail panel is not aligned well — it overlaps the search bar and the legend bar peeks through behind it. The detail pane is immediately full-screen, so the visitor has no visual cue that a graph exists underneath. When the detail pane is closed, the graph does not work well — centering is incorrect for the active viewport resolution, and less of the graph is visible than expected."

## Clarifications

### Session 2026-02-19

- Q: When the bottom sheet opens on mobile, should the graph canvas resize to fit only the visible area above the sheet, or stay full-size with the sheet overlaying it? → A: Canvas stays full-size; the sheet overlays it. The ego-graph centering logic offsets the spotlight node vertically into the visible area above the sheet. No canvas resize or relayout.
- Q: Should the mobile bottom sheet animation use the same timing as the desktop side panel (0.25s ease), just changing direction to vertical? → A: Yes. Same 0.25s ease timing, vertical slide-up (translateY) instead of horizontal slide-in (translateX). Keeps animation system consistent.
- Q: Should the mobile bottom sheet support swipe-down to dismiss, or keep the existing × close button only? → A: Keep × close button only this iteration. No swipe-down gesture — avoids touch event complexity with panel scroll.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Detail Panel as Half-Screen Sheet on Mobile (Priority: P1)

A visitor taps a node on their phone. Instead of the detail panel filling the entire screen (hiding the graph completely), it slides up from the bottom as a half-screen sheet — covering roughly the lower 60% of the viewport. The top portion of the graph remains visible above the sheet, giving the visitor a clear sense that they're inspecting one node within a larger network. The visitor can see the selected node and some of its neighbors above the panel while reading the details below.

The sheet must not overlap the search bar in the header or let the legend bar peek through at the bottom. It sits cleanly between the header area (top) and the bottom of the viewport, with no layering conflicts.

**Why this priority**: The full-screen detail panel is the most disorienting mobile issue. Visitors lose all spatial context of the graph when they tap a node, making the app feel broken. A half-screen sheet is the industry-standard mobile pattern (Google Maps, Apple Maps, Spotify) and immediately communicates that the graph is still there.

**Independent Test**: Open the app on a phone (or in a browser at ≤767px width). Tap any node. Verify the detail panel appears as a bottom sheet covering approximately the lower half of the screen. Verify the graph is still partially visible above the sheet. Verify the header/search bar is not obscured. Verify no part of the legend bar is visible behind or below the sheet.

**Acceptance Scenarios**:

1. **Given** the app is viewed at ≤767px width, **When** the visitor taps a node, **Then** the detail panel slides up from the bottom (0.25s ease animation) covering 60% of the viewport height.
2. **Given** the detail panel is open on mobile, **When** the visitor looks at the screen, **Then** the full-size graph canvas is visible above the overlay sheet, showing the selected node and its neighborhood centered in the visible area.
3. **Given** the detail panel is open on mobile, **When** the visitor looks at the top of the screen, **Then** the header and search bar are fully visible and not overlapped by the panel.
4. **Given** the detail panel is open on mobile, **When** the visitor looks at the bottom, **Then** the legend bar is completely hidden behind the panel — no fragments peek through.
5. **Given** the detail panel is open on mobile, **When** the visitor scrolls within the panel, **Then** only the panel content scrolls (the panel itself does not grow or shrink).

---

### User Story 2 — Graph Centering and Viewport Fit After Panel Close on Mobile (Priority: P2)

A visitor closes the detail panel on their phone. The graph immediately re-centers and fits to the now-full mobile viewport. The visible area expands to use all available space below the header, and the graph nodes are properly centered — no offset toward where the panel used to be, no nodes cut off at the edges. The centering logic accounts for the actual mobile viewport dimensions rather than assuming a desktop panel width.

**Why this priority**: Even if the detail panel looks good, a broken graph after closing it makes the app feel buggy. The current centering logic uses a fixed panel width offset (`--detail-panel-width: 400px`) that doesn't apply on mobile where the panel is full-width. This creates a lopsided, off-center graph view.

**Independent Test**: Open the app on a phone (≤767px). Tap a node to open the detail panel, then close it. Verify the graph re-centers in the full viewport. Repeat with "Expand All" — verify all nodes are visible and centered. Compare with desktop behavior to confirm parity of experience.

**Acceptance Scenarios**:

1. **Given** the detail panel was open on mobile, **When** the visitor closes it, **Then** the graph re-centers within the full available viewport within 1 second.
2. **Given** the detail panel is closed on mobile, **When** the visitor views the graph, **Then** no horizontal or vertical offset is apparent — the graph is visually centered.
3. **Given** the graph is in ego-graph mode on mobile, **When** the detail panel closes, **Then** the spotlight node re-centers accounting for full mobile viewport dimensions (no 400px horizontal offset, no vertical sheet offset).
4. **Given** the graph is in "Expand All" mode on mobile, **When** the detail panel closes, **Then** all nodes fit within the visible canvas area with appropriate padding.
5. **Given** the visitor rotates their phone (portrait ↔ landscape), **When** the graph is visible, **Then** centering adjusts to the new viewport dimensions.

---

### User Story 3 — Clean Layer Order on Mobile (Priority: P3)

A visitor uses the app on their phone and never sees visual layering glitches. The search suggestions dropdown, when visible, appears above the detail panel sheet. The legend bar is fully hidden when the detail panel is open. The filter toolbar remains accessible above the graph. No element "peeks through" behind another.

**Why this priority**: Layering bugs erode trust in the app. While less severe than the full-screen panel or broken centering, they make the mobile experience feel unpolished.

**Independent Test**: Open the app at ≤767px. Open the search and type a query — verify the suggestions dropdown appears above everything. Then tap a node — verify the detail panel does not obscure the search bar. Verify the legend bar is hidden behind the panel. Toggle filters — verify the filter toolbar is visible and functional.

**Acceptance Scenarios**:

1. **Given** the search dropdown is open on mobile, **When** the detail panel is also open, **Then** the search suggestions appear above the detail panel sheet.
2. **Given** the detail panel is open on mobile, **When** the visitor looks at the screen, **Then** the legend bar is not visible — it is fully behind or below the panel.
3. **Given** the filter toolbar is visible on mobile, **When** the detail panel is open, **Then** the filter toolbar remains accessible above the graph area (not obscured).
4. **Given** any combination of UI elements are open on mobile, **When** the visitor interacts with the app, **Then** no unintended overlap or visual bleed-through occurs.

---

### Edge Cases

- What happens when the detail panel content is taller than the 60% sheet height? The panel content scrolls internally; the sheet height does not exceed its maximum.
- What happens when the visitor taps a different node while the detail panel is already open? The sheet content updates in place without closing and re-opening.
- What happens on very small screens (≤320px width)? The layout remains functional — the sheet may use up to 65% of viewport height to ensure content is readable.
- What happens when the visitor scrolls the graph while the detail panel sheet is open? The graph pans normally in the visible area above the sheet; touch events on the sheet scroll only the panel content.
- What happens if the visitor opens the search while the detail panel is open on mobile? The search dropdown appears on top. Selecting a result replaces the detail panel content with the new node.
- What happens on a tablet (768px–1024px)? The existing side-panel layout is retained — these changes apply only to the mobile breakpoint (≤767px).
- What happens if the visitor tries to swipe the sheet down to close it? Nothing — swipe-to-dismiss is not supported in this iteration. The visitor uses the × close button. Swipe-down may be added in a future iteration.
- What happens when the browser is resized across the 767px breakpoint while the detail panel is open? The panel transitions between bottom sheet (≤767px) and side panel (>767px) layout on the next open/close cycle. An already-open panel MAY reflow immediately or on next interaction — graceful degradation is acceptable.
- What happens when the visitor taps "Expand All" while the bottom sheet is open? The sheet closes, the graph expands to show all nodes, and centering uses the full mobile viewport (no vertical offset since the sheet is now closed).
- What happens when the phone's virtual keyboard opens while the bottom sheet is visible (e.g., user taps the search field)? The bottom sheet remains at its CSS-defined height; the keyboard's viewport compression is handled by the browser. The search field and dropdown take priority (higher z-index) over the bottom sheet.
- What happens when the detail panel content is still loading when the sheet opens? The sheet opens at full 60% height immediately and displays the existing loading/placeholder state within the panel content area. No sheet-specific skeleton is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On viewports ≤767px wide, the detail panel MUST appear as a bottom sheet covering 60% of the viewport height (60vh, with 60dvh progressive enhancement), anchored to the bottom of the screen.
- **FR-002**: On viewports ≤767px wide, the detail panel MUST NOT overlap the header area (app title, expand-all button, search bar).
- **FR-003**: On viewports ≤767px wide, the legend bar MUST be fully covered by the detail panel's higher z-index (panel z-index 20 over legend z-index 10) when the panel is open — no part of the legend bar may be visible.
- **FR-004**: The detail panel sheet MUST scroll its content internally when the content exceeds the sheet height — the sheet itself MUST NOT grow beyond its maximum height.
- **FR-005**: When the detail panel is closed on mobile, the graph MUST re-center and fit to the available graph area (viewport height minus header height). The re-centering animation MUST complete within 1 second of the close action (separate from the 0.25s sheet-close animation).
- **FR-006**: The graph centering logic MUST account for the actual mobile viewport dimensions — it MUST NOT apply a desktop-sized horizontal panel offset (e.g., 400px) on mobile viewports. When the bottom sheet is open, centering MUST use a vertical offset to position the spotlight node in the visible area above the sheet. This applies to all ego-graph states: initial node focus, switching to a different node while the sheet is open, and returning from "Expand All".
- **FR-007**: The search suggestions dropdown MUST appear above (higher z-index than) the detail panel sheet on mobile.
- **FR-008**: Touch events on the detail panel sheet MUST scroll only the panel content; touch events on the visible graph area above the sheet MUST pan/interact with the graph.
- **FR-009**: When the visitor taps a different node while the detail panel is open on mobile, the sheet content MUST update in place without a close/re-open animation.
- **FR-010**: These mobile layout changes MUST apply only to the ≤767px breakpoint — tablet (768px–1024px) and desktop layouts MUST remain unchanged.
- **FR-011**: When the device orientation changes (portrait ↔ landscape), the graph MUST re-center to fit the new viewport dimensions. If the bottom sheet is open during orientation change, it MUST resize to 60% of the new viewport height and the graph MUST re-center in the visible area above the resized sheet.
- **FR-012**: The existing desktop and tablet detail panel behavior (side panel sliding from right) MUST NOT be affected by these changes — zero regressions on viewports >767px.
- **FR-013**: The × close button on the mobile bottom sheet MUST have a minimum tap target of 44×44 CSS pixels, per WCAG 2.5.8 (Target Size).
- **FR-014**: When `prefers-reduced-motion: reduce` is active, the bottom sheet slide animation MUST be suppressed (instant show/hide, no 0.25s transition).
- **FR-015**: When the bottom sheet opens or closes on mobile, the state change MUST be communicated to assistive technologies via an appropriate ARIA attribute (e.g., `aria-expanded` on the panel element).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a mobile viewport (≤767px), the unobscured graph area above the bottom sheet MUST be at least 100px tall, ensuring the selected node and part of its neighborhood are visible. On a typical 667px-tall viewport this yields approximately 150px of visible graph space above the 60% sheet and header.
- **SC-002**: After closing the detail panel on mobile, the graph is visually centered (no offset greater than 10px from true center) and the centering animation completes within 1 second of the close action.
- **SC-003**: Z-index stacking is correct on mobile in all combinations: (a) search dropdown appears above the open bottom sheet, (b) bottom sheet fully covers the legend bar, (c) header and search bar remain above the graph canvas, (d) CRT scanline overlay renders on top of all elements.
- **SC-004**: The detail panel opens and content is fully readable without horizontal scrolling on screens as narrow as 320px.
- **SC-005**: All existing desktop and tablet functionality works identically before and after this change — zero regressions.
- **SC-006**: Graph interaction (pan, zoom, tap node) works correctly both with the detail panel open and closed on mobile.
- **SC-007**: After an orientation change (portrait ↔ landscape), the graph is centered within 10px of true center and the bottom sheet (if open) resizes to 60% of the new viewport height within 1 second.

## Assumptions

- The mobile breakpoint is defined as ≤767px viewport width, matching the existing CSS breakpoint in the codebase.
- The "bottom sheet" pattern for the detail panel on mobile follows standard mobile UX conventions (similar to Google Maps, Apple Maps). No drag-to-resize or snap-points are required for this iteration — the sheet is a fixed height.
- The current `getPanelOffset()` function in ego-graph.js uses `--detail-panel-width` (400px) as a fallback, which causes incorrect centering on mobile. On mobile, this horizontal offset should be 0; instead, a vertical offset should shift the focus point upward into the visible area above the overlay sheet.
- The graph canvas remains full-size on mobile when the bottom sheet opens — no resize or relayout is triggered. The sheet overlays the lower portion of the canvas. This matches how Google Maps handles its bottom sheet.
- The legend bar's z-index (10) and the detail panel's z-index (20) are already defined. Adjustments may be needed to ensure the bottom sheet fully covers the legend bar.
- The `app-main` height calculation currently uses a hardcoded `110px` for mobile header height. This may need adjustment once the detail panel becomes a bottom sheet to ensure the graph area is correctly sized.
- No new JavaScript dependencies are required — changes are limited to CSS layout rules and minor adjustments in the centering/offset logic.
- vis-network automatically resizes its internal canvas when container dimensions change (via internal ResizeObserver), but does NOT auto-center the view after resize. Explicit calls to `fit()` or `focus()` are required after resize or orientation change.
- Animations use CSS `transform` only (translateY for the sheet), which is GPU-composited and does not trigger layout reflow.
- For browsers that do not support `dvh` units (pre-Safari 15.4, pre-Chrome 108), the fallback `vh` value produces a minor ~3–5% height variance on mobile Safari, which is considered acceptable.
