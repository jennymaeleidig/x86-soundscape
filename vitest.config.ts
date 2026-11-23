import { defineConfig } from 'vitest/config';

// The unit-test builder's Vitest config: the jsdom-globals shim that used to
// be a test polyfill runs as a setup file, before any spec module.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/testing/jsdom-globals.ts'],
  },
});
