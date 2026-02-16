/**
 * Icon module — SVG icon definitions and assignment logic for the retro SEGA theme.
 *
 * Exports:
 *   svgToDataUri(svgString)                    → data URI string
 *   getIconDataUri(group, gender?)             → data URI for a group/gender combo
 *   assignNodeIcons(nodesArray)                → mutates nodes with image + shape
 *   PLATFORM_SYSTEM_BOARD, GAME_JAMMA_PCB, ... → raw SVG string constants
 *
 * All icons use a 64×64 viewBox with required xmlns, width, height attributes
 * for Firefox compatibility. Data URIs use encodeURIComponent() encoding.
 *
 * @module icons
 */

// ---------------------------------------------------------------------------
// SVG Icon Constants
// ---------------------------------------------------------------------------

/**
 * Platform system-board — large landscape PCB with multiple chip slots.
 * Color: green #2a9d8f
 */
export const PLATFORM_SYSTEM_BOARD = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <pattern id="pcb-grid" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#1f7a6f" stroke-width="0.5" opacity="0.55"/>
    </pattern>
  </defs>
  <rect x="4" y="8" width="56" height="38" rx="2" fill="#2a9d8f" stroke="#1f7a6f" stroke-width="2"/>
  <rect x="4" y="8" width="56" height="38" rx="2" fill="url(#pcb-grid)"/>
  <rect x="10" y="14" width="12" height="8" rx="1" fill="#1f7a6f"/>
  <rect x="26" y="14" width="12" height="8" rx="1" fill="#1f7a6f"/>
  <rect x="42" y="14" width="12" height="8" rx="1" fill="#1f7a6f"/>
  <rect x="10" y="28" width="8" height="6" rx="1" fill="#1f7a6f"/>
  <rect x="22" y="28" width="8" height="6" rx="1" fill="#1f7a6f"/>
  <rect x="34" y="28" width="8" height="6" rx="1" fill="#1f7a6f"/>
  <rect x="46" y="28" width="8" height="6" rx="1" fill="#1f7a6f"/>
  <line x1="10" y1="40" x2="54" y2="40" stroke="#1f7a6f" stroke-width="1"/>
  <g fill="#1f7a6f">
    <rect x="8" y="48" width="3" height="8"/>
    <rect x="13" y="48" width="3" height="8"/>
    <rect x="18" y="48" width="3" height="8"/>
    <rect x="23" y="48" width="3" height="8"/>
    <rect x="28" y="48" width="3" height="8"/>
    <rect x="33" y="48" width="3" height="8"/>
    <rect x="38" y="48" width="3" height="8"/>
    <rect x="43" y="48" width="3" height="8"/>
    <rect x="48" y="48" width="3" height="8"/>
    <rect x="53" y="48" width="3" height="8"/>
  </g>
</svg>`;

/**
 * Game JAMMA PCB — smaller PCB with prominent 56-pin JAMMA edge connector teeth.
 * Color: amber #e9a820
 */
export const GAME_JAMMA_PCB = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <pattern id="game-grid" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#c08b18" stroke-width="0.5" opacity="0.5"/>
    </pattern>
  </defs>
  <rect x="10" y="6" width="44" height="42" rx="2" fill="#e9a820" stroke="#c08b18" stroke-width="2"/>
  <rect x="10" y="6" width="44" height="42" rx="2" fill="url(#game-grid)"/>
  <rect x="16" y="12" width="14" height="10" rx="1" fill="#c08b18"/>
  <rect x="34" y="12" width="14" height="10" rx="1" fill="#c08b18"/>
  <rect x="16" y="28" width="10" height="6" rx="1" fill="#c08b18"/>
  <rect x="30" y="28" width="10" height="6" rx="1" fill="#c08b18"/>
  <line x1="16" y1="38" x2="48" y2="38" stroke="#c08b18" stroke-width="0.5"/>
  <g fill="#c08b18">
    <rect x="12" y="50" width="2" height="8"/>
    <rect x="16" y="50" width="2" height="8"/>
    <rect x="20" y="50" width="2" height="8"/>
    <rect x="24" y="50" width="2" height="8"/>
    <rect x="28" y="50" width="2" height="8"/>
    <rect x="32" y="50" width="2" height="8"/>
    <rect x="36" y="50" width="2" height="8"/>
    <rect x="40" y="50" width="2" height="8"/>
    <rect x="44" y="50" width="2" height="8"/>
    <rect x="48" y="50" width="2" height="8"/>
  </g>
</svg>`;

/**
 * Creator male — male head silhouette with short hair contour.
 * Color: purple #7b2d8e
 */
export const CREATOR_MALE = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="22" r="12" fill="#7b2d8e"/>
  <path d="M32 10 C24 10 20 16 20 22 C20 28 24 34 32 34 C40 34 44 28 44 22 C44 16 40 10 32 10 Z" fill="#7b2d8e"/>
  <path d="M18 56 C18 42 24 36 32 36 C40 36 46 42 46 56" fill="#7b2d8e" stroke="#5e2270" stroke-width="1.5"/>
  <rect x="20" y="8" width="24" height="4" rx="2" fill="#5e2270"/>
</svg>`;

/**
 * Creator female — female head silhouette with longer hair contour.
 * Color: purple #7b2d8e
 */
export const CREATOR_FEMALE = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="22" r="12" fill="#7b2d8e"/>
  <path d="M32 10 C24 10 20 16 20 22 C20 28 24 34 32 34 C40 34 44 28 44 22 C44 16 40 10 32 10 Z" fill="#7b2d8e"/>
  <path d="M18 56 C18 42 24 36 32 36 C40 36 46 42 46 56" fill="#7b2d8e" stroke="#5e2270" stroke-width="1.5"/>
  <path d="M18 22 C16 10 22 6 32 6 C42 6 48 10 46 22 C46 28 44 34 42 38 L22 38 C20 34 18 28 18 22 Z" fill="#5e2270"/>
</svg>`;

/**
 * Creator neutral — gender-neutral oval head silhouette.
 * Color: purple #7b2d8e
 */
export const CREATOR_NEUTRAL = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <ellipse cx="32" cy="22" rx="11" ry="13" fill="#7b2d8e"/>
  <path d="M18 56 C18 42 24 36 32 36 C40 36 46 42 46 56" fill="#7b2d8e" stroke="#5e2270" stroke-width="1.5"/>
</svg>`;

/**
 * Studio building — Japanese-style office with peaked roof.
 * Color: blue #457b9d
 */
export const STUDIO_BUILDING = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <polygon points="32,6 8,26 56,26" fill="#35607a"/>
  <rect x="12" y="26" width="40" height="32" fill="#457b9d" stroke="#35607a" stroke-width="1.5"/>
  <rect x="18" y="32" width="8" height="6" fill="#35607a" rx="1"/>
  <rect x="38" y="32" width="8" height="6" fill="#35607a" rx="1"/>
  <rect x="18" y="44" width="8" height="6" fill="#35607a" rx="1"/>
  <rect x="38" y="44" width="8" height="6" fill="#35607a" rx="1"/>
  <rect x="28" y="42" width="8" height="16" fill="#35607a" rx="1"/>
</svg>`;

/**
 * SEGA company — large corporate office building (flat/high-rise style),
 * bigger than the internal studio building.
 * Color: red #e63946
 */
export const COMPANY_SEGA = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="6" y="4" width="36" height="56" fill="#e63946" stroke="#b22d38" stroke-width="1.5"/>
  <rect x="42" y="20" width="18" height="40" fill="#c0313e" stroke="#b22d38" stroke-width="1.5"/>
  <rect x="11" y="10" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="20" y="10" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="29" y="10" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="11" y="19" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="20" y="19" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="29" y="19" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="11" y="28" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="20" y="28" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="29" y="28" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="11" y="37" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="20" y="37" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="29" y="37" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="11" y="46" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="20" y="46" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="29" y="46" width="5" height="5" fill="#b22d38" rx="0.5"/>
  <rect x="46" y="26" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="53" y="26" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="46" y="34" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="53" y="34" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="46" y="42" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="53" y="42" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="46" y="50" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="53" y="50" width="4" height="4" fill="#b22d38" rx="0.5"/>
  <rect x="18" y="50" width="10" height="14" fill="#b22d38" rx="1"/>
</svg>`;

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Convert a raw SVG string to a data URI using encodeURIComponent().
 * @param {string} svgString — raw SVG markup
 * @returns {string} data URI starting with "data:image/svg+xml,"
 */
export function svgToDataUri(svgString) {
	return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
}

/** @type {Record<string, string>} Cached data URIs keyed by icon identifier */
const DATA_URI_CACHE = {};

/**
 * Get the data URI for a node group, optionally distinguished by gender.
 *
 * @param {string} group  — one of "company", "studio", "platform", "game", "creator"
 * @param {string} [gender] — "male", "female", or omitted for neutral fallback
 * @returns {string} data URI for the corresponding SVG icon
 */
export function getIconDataUri(group, gender) {
	const cacheKey = group === "creator" ? `creator-${gender || "neutral"}` : group;
	if (DATA_URI_CACHE[cacheKey]) {
		return DATA_URI_CACHE[cacheKey];
	}

	let svg;
	switch (group) {
		case "company":
			svg = COMPANY_SEGA;
			break;
		case "studio":
			svg = STUDIO_BUILDING;
			break;
		case "platform":
			svg = PLATFORM_SYSTEM_BOARD;
			break;
		case "game":
			svg = GAME_JAMMA_PCB;
			break;
		case "creator":
			if (gender === "male") {
				svg = CREATOR_MALE;
			} else if (gender === "female") {
				svg = CREATOR_FEMALE;
			} else {
				svg = CREATOR_NEUTRAL;
			}
			break;
		default:
			svg = CREATOR_NEUTRAL;
			break;
	}

	const uri = svgToDataUri(svg);
	DATA_URI_CACHE[cacheKey] = uri;
	return uri;
}

/**
 * Assign icon images to each node based on its group and gender.
 * Mutates nodes in-place by setting `node.image` and `node.shape`.
 *
 * @param {Array<object>} nodesArray — array of node objects from nodes.json
 */
export function assignNodeIcons(nodesArray) {
	for (const node of nodesArray) {
		const gender = node.group === "creator" ? node.gender : undefined;
		node.image = getIconDataUri(node.group, gender);
		node.shape = "image";
	}
}
