/**
 * Channel → collection allowlist for the surf feature.
 *
 * Ported verbatim from `x86-ad-agent/src/config/channels.py`. Keyed by the
 * display names the surfer component already holds, so lookup is a direct
 * `CHANNELS[channel]` with no string normalization.
 */
export const CHANNELS: Record<string, string[]> = {
	"Somewhat Commercial": [
		"vhscommercials",
		"vhsopenings",
		"vhstrailers",
		"classic_tv_commercials",
		"movie_trailers",
	],
	"VHS Vault": [
		"vhsvault",
		"vhsvault_inbox",
		"flemishdog",
		"video-home-system",
		"vhsanddvdcollector",
		"gorelicktv",
		"vhsmovies",
		"georgesretrochannel",
		"the-vista-group-video",
	],
	"Anime All Access": [
		"anime_miscellaneous",
		"anime",
		"animepacks",
		"anime-series",
	],
	"Gamer Nation": [
		"game_replays",
		"worldoflongplays",
		"speed_runs",
		"lets-play",
		"gamefootage",
		"videogameprev",
	],
	"Kids Korner": ["vhskids", "vhsinstructionals", "saturdaymorningcartoons"],
};
