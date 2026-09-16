import { HttpTestingController } from '@angular/common/http/testing';

/**
 * Test double for the ArchiveService's three-request flow (count → page →
 * metadata). Shared by the specs that drive `randomVideo`.
 */

const SEARCH_URL = 'https://archive.org/advancedsearch.php';
const METADATA_URL = 'https://archive.org/metadata';

/** Flush the rows=0 count request. */
export const flushCount = (
  httpMock: HttpTestingController,
  numFound: number,
) => {
  const req = httpMock.expectOne(
    (r) => r.url === SEARCH_URL && r.params.get('rows') === '0',
  );
  expect(req.request.method).toBe('GET');
  req.flush({ response: { numFound } });
};

/** Flush a page request (rows=20). */
export const flushPage = (
  httpMock: HttpTestingController,
  docs: { identifier: string; format: string[] }[],
) => {
  const req = httpMock.expectOne(
    (r) => r.url === SEARCH_URL && r.params.get('rows') === '20',
  );
  expect(req.request.method).toBe('GET');
  req.flush({ response: { docs } });
};

/** Flush the metadata request for an identifier. */
export const flushMetadata = (
  httpMock: HttpTestingController,
  identifier: string,
  body: object,
) => {
  const req = httpMock.expectOne(`${METADATA_URL}/${identifier}`);
  expect(req.request.method).toBe('GET');
  req.flush(body);
};

/** Flush one complete randomVideo fetch: count, a playable page, metadata. */
export const flushOneVideo = (httpMock: HttpTestingController) => {
  flushCount(httpMock, 1);
  flushPage(httpMock, [{ identifier: 'item-1', format: ['h.264'] }]);
  flushMetadata(httpMock, 'item-1', {
    metadata: {},
    files: [{ name: 'a.mp4', format: 'h.264' }],
  });
};

export { SEARCH_URL, METADATA_URL };
