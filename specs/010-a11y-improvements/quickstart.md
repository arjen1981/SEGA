# Quickstart: Accessibility Improvements

**Feature**: 010-a11y-improvements
**Branch**: `010-a11y-improvements`

## Prerequisites

- PowerShell (for dev server)
- Modern browser with developer tools
- Optional: Screen reader (NVDA on Windows, VoiceOver on macOS) for manual verification

## Dev Server

```powershell
cd C:\Project\SEGA
.\serve.ps1
# Opens at http://localhost:8080
```

## Run Tests

```powershell
# Start dev server first (if not running)
.\serve.ps1

# Open test page in browser
Start-Process "http://localhost:8080/tests/"
```

All tests run in-browser via QUnit 2.25.0 (CDN-loaded).

## Files to Modify

| File | Change |
|------|--------|
| `src/index.html` | Add `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` to search input; add `aria-live="polite"` to detail content |
| `src/js/app.js` | Add arrow key/Enter keyboard handler in search keydown listener; update `renderSuggestions()` to generate item IDs and `aria-selected`; update `aria-expanded` on input |
| `src/js/detail-panel.js` | Track `lastAnnouncedNodeId` to suppress duplicate announcements |
| `src/css/styles.css` | Add `.search-suggestion-item.highlighted` style |
| `tests/unit/search.test.js` | Add keyboard navigation tests |
| `tests/unit/detail-panel.test.js` | Add aria-live announcement tests |

## Manual Testing Checklist

1. **Keyboard navigation**: Tab to search, type "sonic", press Arrow Down → first suggestion highlights. Arrow Down again → second highlights. Arrow Up → wraps. Enter → selects. Escape → closes.
2. **Screen reader**: Enable NVDA/VoiceOver, click different nodes → screen reader announces entity name each time. Click same node twice → no re-announcement.
3. **Mouse regression**: Verify clicking suggestions still works. Verify clicking outside closes dropdown.

## Lint

```powershell
npx @biomejs/biome check src/ tests/
```
