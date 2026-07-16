import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { type Observable, throwError, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { CHANNELS } from "./channels";
import { ACCEPTED_VIDEO_FORMATS } from "./archive-formats";

/**
 * Video object returned to the surfer. Shape matches the component's existing
 * `VideoData`, so the template binds unchanged.
 */
export interface Video {
	url: string;
	title: string;
	uploader: string;
	duration: number;
}

/** archive.org advancedsearch.php result doc with item-level `format` array. */
interface SearchDoc {
	identifier: string;
	format?: string[];
}

/** archive.org /metadata/<id> payload — only the fields we use. */
interface IaMetadata {
	files: IaFile[];
	metadata: {
		title?: string;
		uploader?: string;
	};
}

/** A single file inside an archive.org item. */
interface IaFile {
	name: string;
	format: string;
	length?: string;
}

const ARCHIVE_ROOT = "https://archive.org";
const SEARCH_URL = `${ARCHIVE_ROOT}/advancedsearch.php`;
const METADATA_URL = `${ARCHIVE_ROOT}/metadata`;
const DOWNLOAD_URL = `${ARCHIVE_ROOT}/download`;
const PAGE_SIZE = 20;
const MAX_PAGE_ATTEMPTS = 3;
const DEFAULT_UPLOADER = "Unknown uploader";
// archive.org refuses requests beyond ~10000 results with a [DEEP_PAGING] error
// that omits CORS headers (so the browser misreports it as a CORS failure).
// Cap the random page so (page - 1) * PAGE_SIZE stays under the limit.
const DEEP_PAGING_LIMIT = 10000;

@Injectable({
	providedIn: "root",
})
export class ArchiveService {
	constructor(private readonly http: HttpClient) {}

	/**
	 * Select a random playable video from archive.org for the given channel.
	 *
	 * Flow: count the collection (once) → pick a random page → prefilter items on
	 * the item-level `format` array → fetch the chosen item's metadata → pick the
	 * first browser-playable file → build the video. Retries up to 3× on a
	 * degenerate page (no candidate passes the prefilter) before erroring.
	 *
	 * Uses archive.org's `page` parameter for randomness — `sort[]=random` is a
	 * fixed Solr permutation and `start` is silently ignored by advancedsearch.php.
	 */
	randomVideo(channel: string): Observable<Video> {
		const collections = CHANNELS[channel];
		if (!collections) {
			return throwError(() => new Error(`Unknown channel: ${channel}`));
		}
		const collection =
			collections[Math.floor(Math.random() * collections.length)];
		const query = `mediatype:movies AND collection:${collection}`;

		// Fetch the count once per subscribe; page retries reuse it.
		return this.fetchCount(query).pipe(
			mergeMap((numFound) => this.tryPages(query, numFound)),
		);
	}

	/** Fetch numFound for a query via a rows=0 search. */
	private fetchCount(query: string): Observable<number> {
		const params = new HttpParams()
			.set("q", query)
			.set("rows", "0")
			.set("output", "json");
		return this.http
			.get<{ response: { numFound: number } }>(SEARCH_URL, { params })
			.pipe(map((res) => res.response.numFound));
	}

	/** Fetch a page of search docs with item-level `format` for prefiltering. */
	private fetchPage(query: string, page: number): Observable<SearchDoc[]> {
		const params = new HttpParams()
			.set("q", query)
			.set("rows", String(PAGE_SIZE))
			.set("page", String(page))
			.set("output", "json")
			.append("fl[]", "identifier")
			.append("fl[]", "format");
		return this.http
			.get<{ response: { docs: SearchDoc[] } }>(SEARCH_URL, { params })
			.pipe(map((res) => res.response.docs));
	}

	/** Fetch an item's metadata (files + title/uploader). */
	private fetchMetadata(identifier: string): Observable<IaMetadata> {
		return this.http.get<IaMetadata>(`${METADATA_URL}/${identifier}`);
	}

	/** First item on the page whose item-level formats intersect the allowlist. */
	private firstPlayableCandidate(docs: SearchDoc[]): SearchDoc | undefined {
		return docs.find((doc) => {
			const formats = doc.format ?? [];
			return formats.some((f) => ACCEPTED_VIDEO_FORMATS.includes(f));
		});
	}

	/** First file in the item whose format is browser-playable. */
	private firstPlayableFile(files: IaFile[]): IaFile | undefined {
		return files.find((f) => ACCEPTED_VIDEO_FORMATS.includes(f.format));
	}

	/** Build the Video object from identifier, selected file, and item metadata. */
	private buildVideo(
		identifier: string,
		file: IaFile,
		metadata: IaMetadata["metadata"],
	): Video {
		return {
			url: `${DOWNLOAD_URL}/${identifier}/${encodeURIComponent(file.name)}`,
			title: metadata.title ?? "No title available",
			uploader: metadata.uploader ?? DEFAULT_UPLOADER,
			duration: parseFloat(file.length ?? "0"),
		};
	}

	/**
	 * Pick a random page, prefilter to a playable candidate, fetch its metadata,
	 * and build the video. Retry up to MAX_PAGE_ATTEMPTS on a degenerate page.
	 */
	private tryPages(query: string, numFound: number): Observable<Video> {
		// Cap so (page - 1) * PAGE_SIZE < DEEP_PAGING_LIMIT; deep-page errors
		// omit CORS headers and the browser blocks the response.
		const maxPage = Math.max(
			1,
			Math.min(Math.ceil(numFound / PAGE_SIZE), Math.floor(DEEP_PAGING_LIMIT / PAGE_SIZE)),
		);
		return this.tryPage(query, maxPage, 1);
	}

	/** Recursive page attempt (bounded by `attempt`). */
	private tryPage(
		query: string,
		maxPage: number,
		attempt: number,
	): Observable<Video> {
		if (attempt > MAX_PAGE_ATTEMPTS) {
			return throwError(
				() => new Error("No playable video found after maximum attempts."),
			);
		}
		const page = Math.floor(Math.random() * maxPage) + 1;
		return this.fetchPage(query, page).pipe(
			mergeMap((docs) => {
				const candidate = this.firstPlayableCandidate(docs);
				if (!candidate) {
					// Degenerate page: no candidate passes the format prefilter — re-roll.
					return this.tryPage(query, maxPage, attempt + 1);
				}
				return this.fetchMetadata(candidate.identifier).pipe(
					mergeMap((md) => {
						const file = this.firstPlayableFile(md.files);
						if (!file) {
							// Item metadata had no playable file — treat as degenerate, re-roll.
							return this.tryPage(query, maxPage, attempt + 1);
						}
						return of(this.buildVideo(candidate.identifier, file, md.metadata));
					}),
				);
			}),
		);
	}
}
