# Research: Accessibility Improvements

**Feature**: 010-a11y-improvements
**Date**: 2026-03-24

## Decision 1: Combobox ARIA Pattern

**Decision**: Use the WAI-ARIA 1.2 Combobox pattern with Listbox popup

**Rationale**: The W3C APG (ARIA Authoring Practices Guide) defines a standard combobox pattern that is well-supported across screen readers (NVDA, JAWS, VoiceOver). The pattern uses:
- `role="combobox"` on the input element
- `aria-expanded` toggled on input to reflect dropdown visibility
- `aria-activedescendant` on input pointing to the `id` of the highlighted option
- `role="listbox"` on the suggestions container (already present)
- `role="option"` on each suggestion item (already present)
- `aria-controls` on input pointing to the listbox `id`

**Alternatives considered**:
- **Custom focus management** (moving DOM focus to each list item): Rejected because it removes focus from the input, preventing continued typing. The `aria-activedescendant` approach keeps focus on the input while announcing the active descendant.
- **`aria-owns`**: Not needed here because the listbox is already a DOM child of the search container. `aria-controls` is sufficient for the programmatic relationship.

## Decision 2: Suggestion Item ID Strategy

**Decision**: Use deterministic IDs in the format `search-suggestion-{index}` (0-based), regenerated on each `renderSuggestions()` call

**Rationale**: IDs must be unique within the document and stable during a single render cycle. Since the suggestion list is completely re-rendered on each input change, sequential indices are sufficient. No need for node-ID-based IDs because the list is ephemeral and the index-to-node mapping is 1:1 during any given render.

**Alternatives considered**:
- **Node-ID-based IDs** (e.g., `search-suggestion-sonic-the-hedgehog`): Rejected because node IDs may contain special characters or be long; index-based is simpler and guaranteed unique.

## Decision 3: Keyboard Highlight State Management

**Decision**: Track a `highlightIndex` variable (integer, -1 = no highlight) in the keydown handler closure. Apply a CSS class `.highlighted` to the active item and update `aria-activedescendant` on the input.

**Rationale**: This approach:
- Keeps DOM focus on the input (users can keep typing)
- Uses a simple integer for O(1) wrap-around arithmetic
- Resets to -1 on every `input` event (FR-009)
- Matches the pattern used by the WAI-ARIA Combobox APG example

**Alternatives considered**:
- **Track by node ID**: Rejected because it requires searching the list on each keystroke. Index is more efficient.
- **CSS `:focus` on list items with `tabindex`**: Rejected because moving focus away from the input prevents typing.

## Decision 4: Aria-Live Region Strategy for Detail Panel

**Decision**: Add `aria-live="polite"` to the `#detail-content` div. Use a visually-hidden status element inside the detail content area that receives a brief announcement text (e.g., "Showing details for Sonic the Hedgehog"). Track the last-announced node ID to suppress duplicate announcements.

**Rationale**:
- `polite` assertiveness: Does not interrupt the user's current interaction; queues the announcement.
- Placing `aria-live` on the content div means screen readers announce when its text content changes.
- Duplicate suppression via `lastAnnouncedNodeId` comparison prevents noise when clicking the same node (per clarification).
- The close announcement uses a brief "Detail panel closed" text to inform users.

**Alternatives considered**:
- **`aria-live="assertive"`**: Rejected because it interrupts the user, which is inappropriate for a detail panel that updates passively.
- **Separate visually-hidden live region**: Considered but unnecessary — `aria-live` on the existing content div is simpler and achieves the same result. However, a visually-hidden status span *within* the live region can provide a concise announcement without reading the entire panel content.
- **`role="status"`**: Considered but `aria-live="polite"` is more broadly supported for content regions.

## Decision 5: Highlight CSS Strategy

**Decision**: Add a `.search-suggestion-item.highlighted` CSS class that mirrors the existing `:hover` style (`background-color: rgba(0, 68, 255, 0.1)`) to ensure visual consistency. This class is applied/removed programmatically by the keyboard handler.

**Rationale**: The project already has a consistent hover style for suggestion items. Using the same visual treatment for keyboard highlight ensures sighted keyboard users get the same feedback as mouse users. The existing global `:focus-visible` outline (`2px solid var(--color-sega-blue)`) will continue to apply to the search input itself.

**Alternatives considered**:
- **Different highlight color for keyboard**: Rejected to maintain visual consistency with the retro theme.
- **Use `:focus-visible` on list items**: Rejected because DOM focus stays on the input, not the list items.
