import { ambienceSounds } from './sounds';

// jsdom has no filesystem and the spec bundle is built for the browser, so the
// library's folder is read through Jest's own Node-side module registry.
const fs = jest.requireActual('fs') as {
  existsSync(path: string): boolean;
  readdirSync(
    path: string,
    options: { withFileTypes: true },
  ): { name: string; isDirectory(): boolean }[];
};
const path = jest.requireActual('path') as {
  dirname(path: string): string;
  join(...parts: string[]): string;
};

/** The Angular workspace root, found above the directory Jest runs in. */
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
  it('declares a path and a name for every Sound', () => {
    for (const sound of ambienceSounds) {
      expect(sound.path.trim()).not.toBe('');
      expect(sound.name.trim()).not.toBe('');
    }
  });

  it('credits the collection each recording came from', () => {
    // The name is what the listener reads, so the credit lives in it: the folder
    // a recording sits in is who published it.
    const uncredited = ambienceSounds.filter((sound) => {
      const creator = sound.path.split('/').at(-2)!.replaceAll('_', ' ');
      return !sound.name.endsWith(`, from ${creator}`);
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
