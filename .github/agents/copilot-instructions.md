# SEGA Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-09

## Active Technologies
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (002-random-ego-focus)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (002-random-ego-focus)
- HTML5, CSS3, JavaScript (ES6+) — no build step required + vis-network v10 (CDN: unpkg, already loaded) (002-random-ego-focus)
- N/A — all new state is runtime-only (in-memory); existing JSON data unchanged (002-random-ego-focus)
- HTML5, CSS3, JavaScript ES2020+ (ES modules) + vis-network v10 (CDN), Press Start 2P font (Google Fonts CDN) (003-retro-sega-theme)
- Static JSON files (`nodes.json`, `edges.json`) (003-retro-sega-theme)

- HTML5, CSS3, JavaScript (ES6+) — no build step required + vis-network v10 (CDN: single `<script>` tag from unpkg, ~95 KB gzipped) (001-sega-graph-visualization)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

HTML5, CSS3, JavaScript (ES6+) — no build step required: Follow standard conventions

## Recent Changes
- 003-retro-sega-theme: Added HTML5, CSS3, JavaScript ES2020+ (ES modules) + vis-network v10 (CDN), Press Start 2P font (Google Fonts CDN)
- 002-random-ego-focus: Added HTML5, CSS3, JavaScript (ES6+) — no build step required + vis-network v10 (CDN: unpkg, already loaded)
- 002-random-ego-focus: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
