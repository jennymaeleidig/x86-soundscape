import { TestBed } from "@angular/core/testing";
import {
	HttpTestingController,
	provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";

import { ArchiveService, type Video } from "./archive.service";
import { CHANNELS } from "./channels";

describe("ArchiveService", () => {
	let service: ArchiveService;
	let httpMock: HttpTestingController;

	const SEARCH_URL = "https://archive.org/advancedsearch.php";
	const METADATA_URL = "https://archive.org/metadata";

	/** A search doc with an item-level format array. */
	const doc = (identifier: string, formats: string[]) => ({
		identifier,
		format: formats,
	});

	/** Minimal metadata payload with a single playable file. */
	const metadataWith = (
		name: string,
		format: string,
		length: string,
		title = "A Title",
		uploader = "An Uploader",
	) => ({
		metadata: { title, uploader },
		files: [{ name, format, length }],
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				ArchiveService,
			],
		});
		service = TestBed.inject(ArchiveService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		// Any unexpected request fails the test.
		httpMock.verify();
	});

	/** Expect + flush the rows=0 count request. */
	const flushCount = (numFound: number) => {
		const req = httpMock.expectOne(
			(r) => r.url === SEARCH_URL && r.params.get("rows") === "0",
		);
		expect(req.request.method).toBe("GET");
		req.flush({ response: { numFound } });
	};

	/** Expect + flush a page request (rows=20). Returns the page number used. */
	const flushPage = (docs: ReturnType<typeof doc>[]) => {
		const req = httpMock.expectOne(
			(r) => r.url === SEARCH_URL && r.params.get("rows") === "20",
		);
		expect(req.request.method).toBe("GET");
		req.flush({ response: { docs } });
	};

	/** Expect + flush the metadata request for an identifier. */
	const flushMetadata = (identifier: string, body: object) => {
		const req = httpMock.expectOne(`${METADATA_URL}/${identifier}`);
		expect(req.request.method).toBe("GET");
		req.flush(body);
	};

	it("3.2 — playable candidate on first page → returns video with correct field mapping", (done: jest.DoneCallback) => {
		const channel = "Somewhat Commercial";
		expect(CHANNELS[channel]).toBeDefined();

		service.randomVideo(channel).subscribe({
			next: (video: Video) => {
				expect(video.title).toBe("Nick Toons UK - Adverts & Continuity (2009)");
				expect(video.uploader).toBe("powerspyinarchive@yahoo.com");
				expect(video.duration).toBeCloseTo(404.76);
				// encodeURIComponent applied to a filename with spaces and parens.
				expect(video.url).toBe(
					"https://archive.org/download/nick-toons-uk-adverts-continuity-2009/" +
						"Nick%20Toons%20UK%20Adverts%20Continuity%20(2009).mp4",
				);
				done();
			},
			error: (e) => done(e),
		});

		// count (once), then one page, then metadata — exactly 3 calls.
		flushCount(17923);
		flushPage([
			doc("nick-toons-uk-adverts-continuity-2009", [
				"MPEG4",
				"Thumbnail",
				"Metadata",
			]),
		]);
		flushMetadata(
			"nick-toons-uk-adverts-continuity-2009",
			metadataWith(
				"Nick Toons UK Adverts Continuity (2009).mp4",
				"MPEG4",
				"404.76",
				"Nick Toons UK - Adverts & Continuity (2009)",
				"powerspyinarchive@yahoo.com",
			),
		);
	});

	it("3.5 — count is fetched exactly once per subscribe across retries", (done: jest.DoneCallback) => {
		// Page 1 is degenerate (no playable format), forcing a re-roll.
		// Page 2 is playable. Count is fetched only ONCE despite two page fetches.
		service.randomVideo("VHS Vault").subscribe({
			next: (video) => {
				expect(video.url).toContain("archive.org/download/");
				// Assert exactly one count request was made by the end.
				// (If a second count existed, httpMock.verify() in afterEach would
				// catch the leftover, and this explicit check documents intent.)
				expect(video.title).toBe("Play Me");
				done();
			},
			error: (e) => done(e),
		});

		flushCount(100);
		// Page 1: only Matroska / Windows Media (not in ACCEPTED) → degenerate.
		flushPage([doc("degenerate-1", ["Matroska", "Windows Media"])]);
		// Page 2: playable.
		flushPage([doc("playable-1", ["h.264"])]);
		flushMetadata(
			"playable-1",
			metadataWith(
				"playable-1.mp4",
				"h.264",
				"12.5",
				"Play Me",
				"The Uploader",
			),
		);
	});

	it("3.3 & 3.4 — 3 degenerate pages → emits an error", (done: jest.DoneCallback) => {
		service.randomVideo("Anime All Access").subscribe({
			next: () => done(new Error("expected an error, got a video")),
			error: (err: Error) => {
				expect(err.message).toContain("No playable video found");
				done();
			},
		});

		flushCount(40);
		// Three degenerate pages in a row.
		flushPage([doc("d1", ["Cinepack"])]);
		flushPage([doc("d2", ["Animated GIF"])]);
		flushPage([doc("d3", ["Matroska"])]);
		// No metadata requests should have been made.
		httpMock.expectNone((r) => r.url.startsWith(METADATA_URL));
	});

	it("unknown channel → errors without any http calls", (done: jest.DoneCallback) => {
		service.randomVideo("Not A Real Channel").subscribe({
			next: () => done(new Error("expected an error")),
			error: (err: Error) => {
				expect(err.message).toContain("Unknown channel");
				done();
			},
		});
		httpMock.expectNone(SEARCH_URL);
	});

	it("item-level format prefilter selects only playable candidates", (done: jest.DoneCallback) => {
		service.randomVideo("Gamer Nation").subscribe({
			next: (video) => {
				// The SECOND doc is the playable one (MPEG4); the first is not.
				expect(video.url).toContain("playable-2");
				done();
			},
			error: (e) => done(e),
		});

		flushCount(10);
		flushPage([
			doc("degenerate-first", ["Matroska", "Thumbnail"]),
			doc("playable-2", ["MPEG4", "Thumbnail"]),
		]);
		flushMetadata(
			"playable-2",
			metadataWith("playable-2.mp4", "MPEG4", "99", "Gameplay", "Uploader X"),
		);
	});
});
