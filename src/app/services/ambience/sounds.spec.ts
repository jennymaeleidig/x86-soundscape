import fs from 'node:fs';
import path from 'node:path';
import { ambienceSounds } from './sounds';

// jsdom has no filesystem and the spec bundle is built for the browser, so the
// library's folder is read through Vitest's own Node-side module registry.

/** The Angular workspace root, found above the directory Vitest runs in. */
function workspaceRoot(): string {
  for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'angular.json'))) {
      return dir;
    }
    if (path.dirname(dir) === dir) {
      throw new Error(`no angular.json above ${process.cwd()}`);
    }
  }
}

/** Every recording under a folder, as a path relative to it. */
function recordingsIn(dir: string, prefix = ''): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry) =>
      entry.isDirectory()
        ? recordingsIn(path.join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    );
}

describe('The Ambience sound library', () => {
  it('declares a path, a name and a creator for every Sound', () => {
    for (const sound of ambienceSounds) {
      expect(sound.path.trim()).not.toBe('');
      expect(sound.name.trim()).not.toBe('');
      expect(sound.creator.trim()).not.toBe('');
    }
  });

  it('credits the collection each recording came from', () => {
    // The creator is a credit, so it is written by hand and spelled for a
    // listener; the folder it sits in is still where the recording came from,
    // so the two must agree.
    const uncredited = ambienceSounds.filter((sound) => {
      const collection = sound.path.split('/').at(-2)!.replaceAll('_', ' ');
      return sound.creator !== collection;
    });

    expect(uncredited).toEqual([]);
  });

  it('declares every recording in the sounds folder, and nothing else', () => {
    const folder = path.join(
      workspaceRoot(),
      'src',
      'assets',
      'audio',
      'sounds',
    );
    const prefix = 'assets/audio/sounds/';
    const declared = ambienceSounds.map((sound) => {
      expect(sound.path.startsWith(prefix)).toBe(true);
      return sound.path.slice(prefix.length);
    });

    expect(declared.sort()).toEqual(recordingsIn(folder).sort());
  });
});
