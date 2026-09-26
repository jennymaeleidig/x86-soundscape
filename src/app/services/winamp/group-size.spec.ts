import { flush } from '../../../testing/flush';
import { DrivenWindows } from '../../../testing/driven-windows';
import { GroupSize, groupSize, groupSize$ } from './group-size';

/**
 * A window as the engine's store carries one: `size` is increments of the
 * skin's resize segment on top of the base 275×116 window, not pixels.
 */
const box = (
  x: number,
  y: number,
  extraWidth: number,
  extraHeight: number,
  flags: { open?: boolean; shade?: boolean; canDouble?: boolean } = {},
) => ({
  open: flags.open ?? true,
  shade: flags.shade,
  canDouble: flags.canDouble,
  size: [extraWidth, extraHeight] as [number, number],
  position: { x, y },
});

describe('groupSize', () => {
  it('reads a base window as 275×116, so a bare store box is the rendered window', () => {
    expect(groupSize({ main: box(0, 0, 0, 0) })).toEqual({
      width: 275,
      height: 116,
    });
  });

  it('is the smallest rectangle containing every open window, not the first one', () => {
    const size = groupSize({
      main: box(0, 0, 0, 0),
      equalizer: box(0, 116, 0, 0),
      playlist: box(0, 232, 0, 0),
    });
    expect(size).toEqual({ width: 275, height: 348 });
  });

  it('adds the skin segment (25×29) for each resize increment the store carries', () => {
    expect(groupSize({ playlist: box(0, 0, 2, 4) })).toEqual({
      width: 275 + 2 * 25,
      height: 116 + 4 * 29,
    });
  });

  it('spans a window that sits off the origin, so the union follows where windows were dragged', () => {
    const size = groupSize({
      main: box(-40, 10, 0, 0),
      playlist: box(100, 200, 0, 0),
    });
    expect(size).toEqual({ width: 415, height: 306 });
  });

  it('reads a shaded window as its title bar and doubles only a canDouble window', () => {
    expect(groupSize({ main: box(0, 0, 3, 3, { shade: true }) })).toEqual({
      width: 275 + 3 * 25,
      height: 14,
    });

    expect(
      groupSize(
        {
          main: box(0, 0, 0, 0, { canDouble: true }),
          playlist: box(0, 116, 0, 0, { canDouble: false }),
        },
        true,
      ),
    ).toEqual({ width: 550, height: 232 });
  });

  it('ignores closed windows and is null when nothing is open', () => {
    expect(
      groupSize({
        main: box(0, 0, 0, 0),
        milkdrop: box(0, 0, 0, 0, { open: false }),
      }),
    ).toEqual({ width: 275, height: 116 });

    expect(groupSize({ main: box(0, 0, 0, 0, { open: false }) })).toBeNull();
    expect(groupSize({})).toBeNull();
  });
});

describe('groupSize$', () => {
  it('publishes the current union immediately and follows a window that grows', async () => {
    const source = new DrivenWindows();
    source.boxes = { main: box(0, 0, 0, 0), playlist: box(0, 116, 0, 0) };

    const seen: Array<GroupSize | null> = [];
    const subscription = groupSize$(source).subscribe((size) =>
      seen.push(size),
    );
    await flush();

    // The playlist gains eight height segments: the dynamic floor case.
    source.boxes = { main: box(0, 0, 0, 0), playlist: box(0, 116, 0, 8) };
    source.notify();
    await flush();

    expect(seen).toEqual([
      { width: 275, height: 232 },
      { width: 275, height: 464 },
    ]);
    subscription.unsubscribe();
  });

  it('coalesces a burst of store notifications to one read and dedupes by value', async () => {
    const source = new DrivenWindows();
    source.boxes = { main: box(0, 0, 0, 0) };

    const seen: Array<GroupSize | null> = [];
    const subscription = groupSize$(source).subscribe((size) =>
      seen.push(size),
    );
    await flush();

    // Three notifications, no layout change: the engine's marquee step alone
    // fires this often, so nothing may be republished.
    source.notify();
    source.notify();
    source.notify();
    await flush();

    expect(seen).toEqual([{ width: 275, height: 116 }]);
    subscription.unsubscribe();
  });

  it('republishes when only double-size mode changes', async () => {
    const source = new DrivenWindows();
    source.boxes = { main: box(0, 0, 0, 0, { canDouble: true }) };

    const seen: Array<GroupSize | null> = [];
    const subscription = groupSize$(source).subscribe((size) =>
      seen.push(size),
    );
    await flush();

    source.doubledValue = true;
    source.notify();
    await flush();

    expect(seen).toEqual([
      { width: 275, height: 116 },
      { width: 550, height: 232 },
    ]);
    subscription.unsubscribe();
  });

  it('gives a late subscriber the current value over one shared subscription', async () => {
    const source = new DrivenWindows();
    source.boxes = { main: box(0, 0, 0, 0) };
    const size$ = groupSize$(source);

    const first: Array<GroupSize | null> = [];
    const a = size$.subscribe((size) => first.push(size));
    await flush();
    expect(source.subscribers).toBe(1);

    const second: Array<GroupSize | null> = [];
    const b = size$.subscribe((size) => second.push(size));
    await flush();
    expect(second).toEqual([{ width: 275, height: 116 }]);
    expect(source.subscribers).toBe(1);

    a.unsubscribe();
    b.unsubscribe();
    expect(source.subscribers).toBe(0);
  });
});
