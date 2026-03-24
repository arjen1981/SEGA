# SEGA Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-09

## Active Technologies
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (002-random-ego-focus)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (002-random-ego-focus)
- HTML5, CSS3, JavaScript (ES6+) — no build step required + vis-network v10 (CDN: unpkg, already loaded) (002-random-ego-focus)
- N/A — all new state is runtime-only (in-memory); existing JSON data unchanged (002-random-ego-focus)
- HTML5, CSS3, JavaScript ES2020+ (ES modules) + vis-network v10 (CDN), Press Start 2P font (Google Fonts CDN) (003-retro-sega-theme)
- Static JSON files (`nodes.json`, `edges.json`) (003-retro-sega-theme)
- Vanilla JavaScript (ES modules, no transpilation) + vis-network v10 (CDN), QUnit 2.25 (CDN), Google Fonts (Press Start 2P) (004-expand-sega-arcade)
- Static JSON files (`src/data/nodes.json`, `src/data/edges.json`) (004-expand-sega-arcade)
- Static JSON files (`nodes.json`, `edges.json`) — unchanged by this feature (005-fix-mobile-layout)
- Static HTML/CSS/JS — no build step, no transpilation + vis-network 9.1.9 (CDN), no npm/node (feature/006-expand-sega-arcade-data)
- Two JSON files: `src/data/nodes.json`, `src/data/edges.json` (feature/006-expand-sega-arcade-data)
- Node.js 18+ (enrichment script); static HTML/CSS/JS (application — unchanged) + vis-network 9.1.9 (CDN, unchanged); `node-fetch` or built-in `fetch` (Node 18+) for IGDB/Wikipedia API calls (007-igdb-game-images)
- Two JSON files: `src/data/nodes.json`, `src/data/edges.json` (only `nodes.json` modified) (007-igdb-game-images)
- Vanilla JavaScript (ES modules, no transpilation); PowerShell for enrichment script + vis-network 9.1.9 (CDN), QUnit (CDN), Wikidata SPARQL endpoint (008-expand-creators)
- JavaScript ES2020+ (vanilla, no build step) + vis-network 10 (CDN) (009-fix-bugs-techdebt)
- N/A (static site, no backend) (009-fix-bugs-techdebt)

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
- 009-fix-bugs-techdebt: Added JavaScript ES2020+ (vanilla, no build step) + vis-network 10 (CDN)
- 008-expand-creators: Added Vanilla JavaScript (ES modules, no transpilation); PowerShell for enrichment script + vis-network 9.1.9 (CDN), QUnit (CDN), Wikidata SPARQL endpoint
- 007-igdb-game-images: Added Node.js 18+ (enrichment script); static HTML/CSS/JS (application — unchanged) + vis-network 9.1.9 (CDN, unchanged); `node-fetch` or built-in `fetch` (Node 18+) for IGDB/Wikipedia API calls


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
