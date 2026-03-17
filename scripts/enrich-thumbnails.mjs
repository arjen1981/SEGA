/**
 * IGDB Game Image Enrichment Script
 *
 * Populates `thumbnail` URLs for game nodes in src/data/nodes.json using:
 *   1. IGDB cover art (primary)
 *   2. Wikipedia page thumbnail (fallback)
 *   3. Wikidata P18 image property (secondary fallback)
 *
 * Usage:
 *   bun scripts/enrich-thumbnails.mjs
 *   node scripts/enrich-thumbnails.mjs   (Node 18+)
 *
 * Requires .env with TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET
 *
 * @see specs/007-igdb-game-images/quickstart.md
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const NODES_PATH = resolve(ROOT, "src/data/nodes.json");

// ---------------------------------------------------------------------------
// Environment & configuration
// ---------------------------------------------------------------------------

function loadEnv() {
	const envPath = resolve(ROOT, ".env");
	if (!existsSync(envPath)) {
		console.error("ERROR: .env file not found. Copy .env.example to .env and add your Twitch credentials.");
		process.exit(1);
	}
	const lines = readFileSync(envPath, "utf-8").split("\n");
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eqIndex = trimmed.indexOf("=");
		if (eqIndex === -1) continue;
		const key = trimmed.slice(0, eqIndex).trim();
		const value = trimmed.slice(eqIndex + 1).trim();
		if (!process.env[key]) process.env[key] = value;
	}
}

loadEnv();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
	console.error("ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env");
	process.exit(1);
}

const IGDB_RATE_DELAY_MS = 260; // ~4 req/s with margin
const WIKI_RATE_DELAY_MS = 100; // polite usage
const ARCADE_PLATFORM_ID = 52;
const IGDB_IMAGE_SIZE = "t_cover_big";
const USER_AGENT = "SEGA-Graph-Enrichment/1.0";

// ---------------------------------------------------------------------------
// Helpers: JSON I/O (T006)
// ---------------------------------------------------------------------------

function loadNodes() {
	const raw = readFileSync(NODES_PATH, "utf-8");
	return JSON.parse(raw);
}

function saveNodes(nodes) {
	const json = JSON.stringify(nodes, null, "\t");
	writeFileSync(NODES_PATH, json + "\n", "utf-8");
}

// ---------------------------------------------------------------------------
// Helpers: Game filter (T007)
// ---------------------------------------------------------------------------

function filterGameNodes(nodes) {
	return nodes.filter((n) => n.group === "game");
}

// ---------------------------------------------------------------------------
// Twitch OAuth (T004)
// ---------------------------------------------------------------------------

async function getTwitchToken() {
	const res = await fetch("https://id.twitch.tv/oauth2/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: TWITCH_CLIENT_ID,
			client_secret: TWITCH_CLIENT_SECRET,
			grant_type: "client_credentials",
		}),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Twitch auth failed (${res.status}): ${text}`);
	}
	const data = await res.json();
	return data.access_token;
}

// ---------------------------------------------------------------------------
// Rate-limited IGDB request (T005)
// ---------------------------------------------------------------------------

let lastIgdbRequest = 0;

async function igdbRequest(endpoint, body, token) {
	const now = Date.now();
	const elapsed = now - lastIgdbRequest;
	if (elapsed < IGDB_RATE_DELAY_MS) {
		await sleep(IGDB_RATE_DELAY_MS - elapsed);
	}
	lastIgdbRequest = Date.now();

	const url = `https://api.igdb.com/v4/${endpoint}`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Client-ID": TWITCH_CLIENT_ID,
			Authorization: `Bearer ${token}`,
			"Content-Type": "text/plain",
		},
		body,
	});

	if (res.status === 429) {
		console.warn("  Rate limited by IGDB, waiting 2s...");
		await sleep(2000);
		lastIgdbRequest = Date.now();
		return igdbRequest(endpoint, body, token);
	}

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`IGDB ${endpoint} failed (${res.status}): ${text}`);
	}

	return res.json();
}

// ---------------------------------------------------------------------------
// IGDB search & matching (T008, T009, T010, T011)
// ---------------------------------------------------------------------------

function normalizeTitle(title) {
	return title
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // strip accents
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // strip punctuation
		.replace(/\s+/g, " ")
		.trim();
}

async function searchIgdb(title, token) {
	const escaped = title.replace(/"/g, '\\"');
	const query = `search "${escaped}"; fields name, cover.image_id, first_release_date; where platforms = (${ARCADE_PLATFORM_ID}) & version_parent = null; limit 5;`;
	return igdbRequest("games", query, token);
}

function selectBestMatch(results, releaseYear) {
	if (!results || results.length === 0) return null;

	// Filter to only results that have cover art
	const withCover = results.filter((r) => r.cover && r.cover.image_id);
	if (withCover.length === 0) return null;
	if (withCover.length === 1) return withCover[0];

	// Pick the one closest to the expected release year
	let best = withCover[0];
	let bestDiff = Infinity;
	for (const r of withCover) {
		if (r.first_release_date) {
			const year = new Date(r.first_release_date * 1000).getUTCFullYear();
			const diff = Math.abs(year - releaseYear);
			if (diff < bestDiff) {
				bestDiff = diff;
				best = r;
			}
		}
	}
	return best;
}

function buildIgdbCoverUrl(imageId) {
	return `https://images.igdb.com/igdb/image/upload/${IGDB_IMAGE_SIZE}/${imageId}.jpg`;
}

// ---------------------------------------------------------------------------
// Wikipedia / Wikidata fallback (T015, T016, T025)
// ---------------------------------------------------------------------------

let lastWikiRequest = 0;

async function wikiDelay() {
	const now = Date.now();
	const elapsed = now - lastWikiRequest;
	if (elapsed < WIKI_RATE_DELAY_MS) {
		await sleep(WIKI_RATE_DELAY_MS - elapsed);
	}
	lastWikiRequest = Date.now();
}

function extractWikiTitle(wikipediaUrl) {
	try {
		const url = new URL(wikipediaUrl);
		const path = url.pathname;
		// /wiki/Fantasy_Zone → Fantasy_Zone
		const prefix = "/wiki/";
		if (path.startsWith(prefix)) {
			return path.slice(prefix.length);
		}
	} catch {
		// ignore malformed URLs
	}
	return null;
}

async function fetchWikipediaThumbnail(wikipediaUrl) {
	const title = extractWikiTitle(wikipediaUrl);
	if (!title) return null;

	await wikiDelay();
	try {
		const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
			headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT },
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data.thumbnail?.source || null;
	} catch {
		return null;
	}
}

async function fetchWikidataImage(wikidataId) {
	if (!wikidataId) return null;

	await wikiDelay();
	try {
		const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(wikidataId)}&props=claims&format=json`;
		const res = await fetch(url, {
			headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT },
		});
		if (!res.ok) return null;
		const data = await res.json();
		const entity = data.entities?.[wikidataId];
		const p18Claims = entity?.claims?.P18;
		if (!p18Claims || p18Claims.length === 0) return null;

		const filename = p18Claims[0]?.mainsnak?.datavalue?.value;
		if (!filename) return null;

		const encodedFilename = encodeURIComponent(filename.replace(/ /g, "_"));
		return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=300`;
	} catch {
		return null;
	}
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function padRight(str, len) {
	return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

// ---------------------------------------------------------------------------
// Main enrichment loop (T012, T017, T020, T021, T022)
// ---------------------------------------------------------------------------

async function main() {
	console.log("=== IGDB Game Image Enrichment ===\n");

	// Load nodes
	const nodes = loadNodes();
	const games = filterGameNodes(nodes);
	console.log(`Processing ${games.length} game nodes...\n`);

	// T020: Pre-enrichment snapshot for regression check
	const preSnapshot = new Map();
	for (const g of games) {
		if (g.thumbnail) {
			preSnapshot.set(g.id, g.thumbnail);
		}
	}

	// Authenticate with Twitch
	console.log("Authenticating with Twitch...");
	const token = await getTwitchToken();
	console.log("Authentication successful.\n");

	// Stats
	let igdbMatches = 0;
	let wikiMatches = 0;
	let wikidataMatches = 0;
	let noImage = 0;
	let skippedIgdb = 0;

	for (let i = 0; i < games.length; i++) {
		const game = games[i];
		const idx = `[${String(i + 1).padStart(3)}/${games.length}]`;
		const label = padRight(game.label, 45);

		// T021: If already has IGDB thumbnail, skip entirely
		if (game.thumbnail && game.thumbnail.includes("images.igdb.com")) {
			console.log(`${idx} ${label} → Already IGDB (skipped)`);
			skippedIgdb++;
			continue;
		}

		// Try IGDB first
		let igdbUrl = null;
		try {
			let results = await searchIgdb(game.label, token);
			let match = selectBestMatch(results, game.releaseYear);

			// Retry with normalized title if no match
			if (!match) {
				const normalized = normalizeTitle(game.label);
				if (normalized !== game.label.toLowerCase()) {
					results = await searchIgdb(normalized, token);
					match = selectBestMatch(results, game.releaseYear);
				}
			}

			if (match) {
				igdbUrl = buildIgdbCoverUrl(match.cover.image_id);
			}
		} catch (err) {
			console.error(`${idx} ${label} → IGDB error: ${err.message}`);
		}

		if (igdbUrl) {
			game.thumbnail = igdbUrl;
			igdbMatches++;
			console.log(`${idx} ${label} → IGDB ✓`);
			continue;
		}

		// T021: If already has a non-IGDB thumbnail, keep it (don't try Wikipedia fallback)
		if (game.thumbnail) {
			console.log(`${idx} ${label} → IGDB ✗ (keeping existing thumbnail)`);
			continue;
		}

		// Wikipedia fallback
		const wikiThumb = await fetchWikipediaThumbnail(game.wikipediaUrl);
		if (wikiThumb) {
			game.thumbnail = wikiThumb;
			wikiMatches++;
			console.log(`${idx} ${label} → IGDB ✗ → Wikipedia ✓`);
			continue;
		}

		// Wikidata P18 fallback
		const wikidataImg = await fetchWikidataImage(game.wikidataId);
		if (wikidataImg) {
			game.thumbnail = wikidataImg;
			wikidataMatches++;
			console.log(`${idx} ${label} → IGDB ✗ → Wikipedia ✗ → Wikidata ✓`);
			continue;
		}

		noImage++;
		console.log(`${idx} ${label} → IGDB ✗ → Wikipedia ✗ → Wikidata ✗ → No image`);
	}

	// T021/FR-006: Final safety check — never null out an existing thumbnail
	for (const game of games) {
		const old = preSnapshot.get(game.id);
		if (old && !game.thumbnail) {
			game.thumbnail = old; // restore
		}
	}

	// Save enriched nodes
	saveNodes(nodes);
	console.log("\nSaved updated nodes.json\n");

	// T013, T018, T022: Summary report
	const postCount = games.filter((g) => g.thumbnail).length;
	let regressions = 0;
	let preserved = 0;
	let upgraded = 0;
	for (const [id, oldUrl] of preSnapshot) {
		const game = games.find((g) => g.id === id);
		if (!game.thumbnail) {
			regressions++;
		} else if (game.thumbnail === oldUrl) {
			preserved++;
		} else {
			upgraded++;
		}
	}

	console.log("=== Summary ===");
	console.log(`Total games:         ${games.length}`);
	console.log(`IGDB matches:        ${igdbMatches}`);
	console.log(`Wikipedia fallback:  ${wikiMatches}`);
	console.log(`Wikidata fallback:   ${wikidataMatches}`);
	console.log(`Already IGDB:        ${skippedIgdb}`);
	console.log(`No image found:      ${noImage}`);
	console.log(`With thumbnail now:  ${postCount} / ${games.length} (${Math.round((100 * postCount) / games.length)}%)`);
	console.log("");
	console.log(`Previously had thumb: ${preSnapshot.size}`);
	console.log(`  Preserved:         ${preserved}`);
	console.log(`  Upgraded to IGDB:  ${upgraded}`);
	console.log(`  Regressions:       ${regressions}`);

	if (regressions > 0) {
		console.error("\n⚠️  REGRESSION DETECTED: Some thumbnails were lost!");
		process.exit(1);
	}

	console.log("\n✓ Done — zero regressions.");
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
