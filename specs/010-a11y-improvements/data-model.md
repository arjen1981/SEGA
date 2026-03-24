# Data Model: Accessibility Improvements

**Feature**: 010-a11y-improvements
**Date**: 2026-03-24

## Overview

This feature introduces no new data entities or changes to existing data structures (`nodes.json`, `edges.json`). All changes are UI-level state management for keyboard navigation and screen reader announcements.

## UI State Model

### Search Keyboard Navigation State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `highlightIndex` | `number` | `-1` | Index of the currently highlighted suggestion in the visible list. `-1` means no highlight. |

**State transitions**:
- `input` event → reset to `-1`
- Arrow Down → increment (wrap to `0` at end)
- Arrow Up → decrement (wrap to `list.length - 1` at start)
- Enter (when `>= 0`) → select and reset to `-1`
- Escape → reset to `-1`
- Click outside → reset to `-1`

### Detail Panel Announcement State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `lastAnnouncedNodeId` | `string \| null` | `null` | ID of the last node whose detail was announced. Used to suppress duplicate announcements. |

**State transitions**:
- Panel opens/updates with new node → set to `nodeId`, announce
- Panel opens/updates with same node → no change, suppress announcement
- Panel closes → set to `null`, announce "closed"

## ARIA Attribute Contracts

### Search Input (`#search-input`)

| Attribute | Value | Dynamic? |
|-----------|-------|----------|
| `role` | `"combobox"` | No |
| `aria-expanded` | `"true"` / `"false"` | Yes — reflects dropdown visibility |
| `aria-controls` | `"search-suggestions"` | No |
| `aria-activedescendant` | `"search-suggestion-{index}"` or `""` | Yes — updated on arrow navigation |
| `aria-label` | `"Search for games, creators, platforms and more"` | No (existing) |
| `autocomplete` | `"off"` | No (existing) |

### Suggestion List (`#search-suggestions`)

| Attribute | Value | Dynamic? |
|-----------|-------|----------|
| `role` | `"listbox"` | No (existing) |
| `id` | `"search-suggestions"` | No (existing) |
| `hidden` | present / absent | Yes (existing) |

### Suggestion Item (`li.search-suggestion-item`)

| Attribute | Value | Dynamic? |
|-----------|-------|----------|
| `role` | `"option"` | No (existing) |
| `id` | `"search-suggestion-{index}"` | Yes — set on render |
| `aria-selected` | `"true"` / `"false"` | Yes — reflects highlight state |
| `class` | includes `"highlighted"` when active | Yes |

### Detail Content (`#detail-content`)

| Attribute | Value | Dynamic? |
|-----------|-------|----------|
| `aria-live` | `"polite"` | No |

## Validation Rules

- `highlightIndex` MUST be in range `[-1, list.length - 1]`
- `aria-activedescendant` MUST reference an existing element ID or be empty string
- `lastAnnouncedNodeId` MUST match a valid node ID or be `null`
- Suggestion item IDs MUST be unique within the document during any render cycle
