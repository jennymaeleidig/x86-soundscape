// SPDX-License-Identifier: CC0-1.0
/**
 * The desktop-edges final pass: the spec's assertion list run once against the
 * finished build, recording the numbers beside the earlier figures so each
 * claim is closed by the same measurement that opened it. There is no CI here,
 * so this is a run performed rather than a gate.
 *
 * Usage: node harness/run-desktop-edges-final.mjs [distDir]
 */
import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  dragPlayer,
  grabPoint,
  launchHeadless,
  listAnimations,
  machineInfo,
  measureCost,
  sampleGroupState,
  serveDist,
  sleep,
  waitForApp,
  writeResults,
} from "./harness.mjs";

const distDir = path.resolve(process.argv[2] ?? "dist/x86-soundscape/browser");
const resultsDir = ".scratch/desktop-edges/results";
const resultsPath = `${resultsDir}/${new Date()
  .toISOString()
  .replace(/[:.]/g, "-")}-desktop-edges-final.json`;

const NARROW = { width: 240, height: 600 };
const SHORT = { width: 600, height: 300 };
const ROOMY = { width: 600, height: 500 };
const AUDIO_FIXTURE =
  "src/assets/audio/sounds/SoundLonely/University_Computer_Lab_Ambience-pNHMmu400M.mp3";

function git(revArgs) {
  try {
    return execFileSync("git", revArgs, { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

/** The most recent issue-01 run, whose figures this pass quotes beside its own. */
async function priorFigures() {
  const entries = await fs.readdir(resultsDir).catch(() => []);
  const prior = entries
    .filter((name) => name.endsWith("-desktop-edges.json"))
    .sort()
    .at(-1);
  if (!prior) return null;
  const run = JSON.parse(
    await fs.readFile(path.join(resultsDir, prior), "utf8"),
  );
  return {
    resultsFile: prior,
    gitRev: run.identity?.gitRev,
    drag: run.results?.drag?.movedPx,
    idle: {
      cpuCoreShareWithWindow: run.results?.idle?.cost?.cpuCoreShare,
      cpuCoreShareWithoutWindow: run.results?.idle?.baselineCost?.cpuCoreShare,
      paintedAreaPerSecond: run.results?.idle?.cost?.paintedAreaPerSecond,
      counters: run.results?.idle?.cost?.counters,
      animationNamesWithWindow: (
        run.results?.idle?.animationsWithWindow ?? []
      ).map((a) => a.name),
    },
    // The idle-cost measurement ticket 03 opened: the per-twelve-second
    // records and the paint rate the flicker produced with a Weather Window
    // open and nothing playing. Quoted so the new figures close the same claim.
    idleCostSource: {
      file: ".scratch/deepening/ticket-15-findings.md",
      cpuCoreShareDelta: "+35-40% of one core",
      paintedAreaPerSecond: 84_120_014,
      perTwelveSeconds: {
        paintRecords: 1440,
        rasterTasks: 720,
        styleRecalcs: 720,
        layouts: 720,
      },
    },
  };
}

/** A page whose viewport is set before the app boots, at normal motion. */
async function openApp(server, viewport) {
  const browser = await launchHeadless(viewport);
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.port}/`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await waitForApp(page);
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  return { browser, page };
}

/**
 * Serves the sandbox with a real, decodable audio body so a Play gesture
 * reaches the PLAYING state and a Pause can be observed. Without this the
 * stream is unreachable and the player never leaves `none`.
 */
async function openAppWithLocalAudio(server, viewport) {
  const { browser, page } = await openApp(server, viewport);
  const body = await fs.readFile(AUDIO_FIXTURE);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = request.url();
    if (url.startsWith(`http://127.0.0.1:${server.port}`)) {
      request.continue();
      return;
    }
    request.respond({
      status: 200,
      contentType: "audio/mpeg",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
      },
      body,
    });
  });
  return { browser, page };
}

/** Opens a Window through its Applet's button, as issue 01 does. */
async function openAppletWindow(page, label) {
  await page.evaluate((label) => {
    const applets = [...document.querySelectorAll("app-applet")];
    const applet = applets.find((element) =>
      element.textContent?.includes(label),
    );
    const button = applet?.querySelector("button");
    if (!button) throw new Error(`the ${label} applet is not on the desktop`);
    button.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  }, label);
  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll("app-window")].some((w) =>
        w.textContent?.includes(label),
      ),
    { timeout: 15000 },
    label,
  );
}

/** Opens the Weather Window through the Applet's button, as issue 01 does. */
const openWeatherWindow = (page) => openAppletWindow(page, "Weather");

const sameBox = (a, b, tolerance = 0.5) =>
  a != null &&
  b != null &&
  Math.abs(a.x - b.x) <= tolerance &&
  Math.abs(a.y - b.y) <= tolerance &&
  Math.abs(a.width - b.width) <= tolerance &&
  Math.abs(a.height - b.height) <= tolerance;

/**
 * The Surfer's pane is checked rather than assumed: it renders through the one
 * shared CRT wrapper, and the wrapper's box is the pane's content — the video —
 * so the scanline overlay covers exactly the screen and not the frame below it.
 */
async function surferFit(server) {
  const { browser, page } = await openApp(server, ROOMY);
  await openAppletWindow(page, "Visualizer");
  await sleep(2000);
  const fit = await page.evaluate(() => {
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const surfer = document.querySelector("app-surfer");
    if (!surfer) throw new Error("the Surfer pane is not rendered");
    const container = surfer.querySelector("#video-container");
    const wrapper = surfer.querySelector("[appcrt]");
    const content = wrapper?.querySelector("video, img") ?? null;
    // The pane insets its content with padding (14% inline), so the wrapper's
    // 100% resolves against the container's content box, not its border box.
    const containerBox = container
      ? (() => {
          const r = container.getBoundingClientRect();
          const cs = getComputedStyle(container);
          const pl = parseFloat(cs.paddingLeft);
          const pt = parseFloat(cs.paddingTop);
          const pr = parseFloat(cs.paddingRight);
          const pb = parseFloat(cs.paddingBottom);
          return {
            x: r.x + parseFloat(cs.borderLeftWidth) + pl,
            y: r.y + parseFloat(cs.borderTopWidth) + pt,
            width: container.clientWidth - pl - pr,
            height: container.clientHeight - pt - pb,
          };
        })()
      : null;
    return {
      wrapperTag: wrapper?.tagName ?? null,
      contentTag: content?.tagName ?? null,
      wrapperOverflow: wrapper ? getComputedStyle(wrapper).overflow : null,
      wrapper: wrapper ? rect(wrapper) : null,
      container: container ? rect(container) : null,
      containerContentBox: containerBox,
      content: content ? rect(content) : null,
    };
  });
  await browser.close();
  const contentInsideWrapper =
    fit.content != null &&
    within(fit.content, fit.wrapper ?? { x: 0, y: 0, width: 0, height: 0 });
  return {
    ...fit,
    wrapperFitsContent: sameBox(fit.wrapper, fit.content),
    wrapperInsideContainer:
      fit.wrapper != null &&
      fit.container != null &&
      within(fit.wrapper, fit.container),
    contentHasSize:
      (fit.content?.width ?? 0) > 0 && (fit.content?.height ?? 0) > 0,
    contentInsideWrapper,
    fit:
      sameBox(fit.wrapper, fit.content) &&
      fit.wrapperOverflow === "hidden" &&
      (fit.content?.width ?? 0) > 0 &&
      (fit.content?.height ?? 0) > 0 &&
      contentInsideWrapper,
  };
}

/** Serves the Weather frame a still document, so its own animation is out of scope. */
async function serveWeatherStub(page, server) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().startsWith(`http://127.0.0.1:${server.port}`)) {
      request.continue();
      return;
    }
    request.respond({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body style='background:#000'>still</body></html>",
    });
  });
}

const within = (inner, outer, tolerance = 0.5) =>
  inner.x >= outer.x - tolerance &&
  inner.y >= outer.y - tolerance &&
  inner.x + inner.width <= outer.x + outer.width + tolerance &&
  inner.y + inner.height <= outer.y + outer.height + tolerance;

/** One drag of the player at a viewport, sampled and evaluated. */
async function confinementAt(server, viewport, direction) {
  const { browser, page } = await openApp(server, viewport);
  const before = await sampleGroupState(page);
  const grab = await grabPoint(page);
  const samples = await dragPlayer(page, {
    x: grab.x,
    y: grab.y,
    dx: direction.dx,
    dy: direction.dy,
    steps: 8,
  });
  const after = await sampleGroupState(page);
  const first = samples[0].window;
  const last = samples[samples.length - 1].window;
  const moved = Math.hypot(last.x - first.x, last.y - first.y);
  const dragged = samples.map((s) => s.window);
  const contained = dragged.every((box) => within(box, after.mount));
  // The floor must add no scroll of its own: compare the document's scroll
  // extent with the mount's minimum set and cleared, and check the page keeps
  // its vertical origin when asked to scroll. (The Menu bar already forces a
  // horizontal extent of its own at these widths; that is recorded, not ours.)
  const scroll = await page.evaluate(() => {
    const mount = document.querySelector("winamp > div");
    const floor = document.documentElement.scrollWidth;
    const minWidth = mount.style.minWidth;
    const minHeight = mount.style.minHeight;
    mount.style.minWidth = "";
    mount.style.minHeight = "";
    const floorless = document.documentElement.scrollWidth;
    mount.style.minWidth = minWidth;
    mount.style.minHeight = minHeight;
    window.scrollTo(50, 50);
    const at = { x: window.scrollX, y: window.scrollY };
    window.scrollTo(0, 0);
    return { floor, floorless, at };
  });
  const pageDoesNotScroll =
    after.bounds.overflow === "hidden" &&
    scroll.at.y === 0 &&
    scroll.floor <= scroll.floorless + 0.5;
  // The floor may not move anything else: the bounds keeps the viewport's
  // rectangle, the icon grid keeps the space it has, and the Windows' own drag
  // boundary still names the rectangle a listener can see.
  const shapes = await page.evaluate(() => {
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const bounds = document.querySelector(".desktop-bounds");
    const grid = document.querySelector("dts-select-container");
    const boundary = document.querySelector("[cdkDragBoundary]");
    const named = boundary?.getAttribute("cdkDragBoundary") ?? null;
    return {
      bounds: rect(bounds),
      boundsParent: rect(bounds.parentElement),
      grid: rect(grid),
      dragBoundary: named,
      dragBoundaryResolves: named
        ? document.querySelector(named) === bounds
        : false,
    };
  });
  const sameBox = (a, b, tolerance = 0.5) =>
    Math.abs(a.x - b.x) <= tolerance &&
    Math.abs(a.y - b.y) <= tolerance &&
    Math.abs(a.width - b.width) <= tolerance &&
    Math.abs(a.height - b.height) <= tolerance;
  const nothingElseMoved =
    sameBox(shapes.grid, shapes.bounds) &&
    Math.abs(shapes.bounds.width - shapes.boundsParent.width) <= 0.5 &&
    Math.abs(
      shapes.bounds.y +
        shapes.bounds.height -
        (shapes.boundsParent.y + shapes.boundsParent.height),
    ) <= 0.5 &&
    shapes.dragBoundary === ".desktop-bounds" &&
    shapes.dragBoundaryResolves;
  await browser.close();
  return {
    viewport,
    direction,
    before,
    after,
    movedPx: moved,
    moved: moved > 1,
    groupContainedInMount: contained,
    pageDoesNotScroll,
    scroll,
    shapes,
    nothingElseMoved,
    groupFitsDesktop:
      after.union.height <= after.bounds.height + 0.5 &&
      after.union.width <= after.bounds.width + 0.5,
    groupFullyVisibleInBounds: within(after.union, after.bounds),
    supportedMinimum: {
      menuBarPlusGroupPx: after.bounds.y + after.union.height,
      groupFitsDesktopHeight: after.union.height <= after.bounds.height + 0.5,
      groupFitsDesktopWidth: after.union.width <= after.bounds.width + 0.5,
    },
  };
}

/** Drags the playlist's resize target down and re-drags the player. */
async function resizeCase(server) {
  const { browser, page } = await openApp(server, ROOMY);
  const before = await sampleGroupState(page);
  // The engine's resize target takes its size from a mousedown and a series of
  // mousemoves on the window; the driver delivers those as real DOM events on
  // the target, the way issue 01 opens the Weather Applet.
  await page.evaluate(async () => {
    const target = document.querySelector("#playlist-resize-target");
    if (!target) throw new Error("the playlist resize target is missing");
    const rect = target.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const options = (clientY) => ({
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY,
      buttons: 1,
    });
    target.dispatchEvent(new MouseEvent("mousedown", options(y)));
    await new Promise((resolve) => setTimeout(resolve, 120));
    for (let i = 1; i <= 10; i++) {
      window.dispatchEvent(
        new MouseEvent("mousemove", options(y + (58 * i) / 10)),
      );
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.dispatchEvent(new MouseEvent("mouseup", options(y + 58)));
  });
  await sleep(400);
  const afterResize = await sampleGroupState(page);
  const grab = await grabPoint(page);
  const samples = await dragPlayer(page, {
    x: grab.x,
    y: grab.y,
    dx: -60,
    dy: -60,
    steps: 6,
  });
  const afterRedrag = await sampleGroupState(page);
  const first = samples[0].window;
  const last = samples[samples.length - 1].window;
  await browser.close();
  return {
    mountMinBefore: before.mountMin,
    mountMinAfterResize: afterResize.mountMin,
    groupHeightBefore: before.union.height,
    groupHeightAfterResize: afterResize.union.height,
    floorFollowed:
      parseFloat(afterResize.mountMin.height) >
      parseFloat(before.mountMin.height),
    reDragMovedPx: Math.hypot(last.x - first.x, last.y - first.y),
    reDragContained:
      within(afterRedrag.union, afterRedrag.mount) &&
      samples.every((s) => within(s.window, afterRedrag.mount)),
  };
}

/** The running animations, at normal and reduced motion, and the rows' text. */
async function motionInventory(server) {
  const { browser, page } = await openApp(server, ROOMY);
  const bareAnimations = await listAnimations(page);
  await openWeatherWindow(page);
  await sleep(3000);
  const windowAnimations = await listAnimations(page);
  const rowsAtNormal = await page.evaluate(() =>
    [...document.querySelectorAll("om-marquee .item")].map((el) => ({
      text: el.textContent.trim(),
      title: el.getAttribute("title"),
    })),
  );
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await sleep(500);
  const reducedAnimations = await listAnimations(page);
  const rowsAtReduced = await page.evaluate(() =>
    [...document.querySelectorAll("om-marquee .item")].map((el) => ({
      text: el.textContent.trim(),
      title: el.getAttribute("title"),
    })),
  );
  await browser.close();
  const onlyMarquee = (list) =>
    list.length > 0 &&
    list.every((animation) => animation.name.includes("om-marquee-row"));
  return {
    bareDesktopAnimations: bareAnimations,
    weatherWindowAnimations: windowAnimations,
    onlyMarquee: onlyMarquee(bareAnimations) && onlyMarquee(windowAnimations),
    reducedMotionAnimations: reducedAnimations,
    reducedMotionIsEmpty: reducedAnimations.length === 0,
    rowsAtNormal,
    rowsAtReduced,
    rowsStillRenderText:
      rowsAtReduced.length > 0 &&
      rowsAtReduced.every((row) => row.text.length > 0),
  };
}

/**
 * The idle cost with a Weather Window open and nothing playing, at normal
 * motion. The Weather source's own document inside the embedded frame is out
 * of scope, so the frame is served a still stub rather than left to the
 * sandbox's blocked network (whose repeated failed loads were the sandbox's
 * own style work, not the app's). The claim is the Window's own share: the
 * same twelve seconds with no Window open is the baseline both runs carry, so
 * the marquee and the harness's own forced frames cancel and the deltas answer
 * for the Window alone.
 */
async function idleCost(server) {
  const { browser, page } = await openApp(server, ROOMY);
  await serveWeatherStub(page, server);
  const baseline = await measureCost(page, { seconds: 12, baseline: true });
  await openWeatherWindow(page);
  await sleep(3000);
  const cost = await measureCost(page, { seconds: 12 });
  await browser.close();
  const delta = (pick) => Math.round(pick(cost) - pick(baseline));
  const recordDelta = {
    paintRecords: delta((r) => r.timeline.paintRecords ?? 0),
    rasterTasks: delta((r) => r.timeline.rasterTasks ?? 0),
    styleRecalcs: delta((r) => r.timeline.styleRecalcs ?? 0),
    layouts: delta((r) => r.timeline.layouts ?? 0),
    layoutCount: delta((r) => r.counters.layoutCount),
    recalcStyleCount: delta((r) => r.counters.recalcStyleCount),
  };
  const cpuCoreShareDelta = cost.cpuCoreShare - baseline.cpuCoreShare;
  const paintedAreaPerSecondDelta =
    cost.paintedAreaPerSecond - baseline.paintedAreaPerSecond;
  // A tolerance, not a tautology: twelve seconds is not an exact number of
  // captured frames, so a handful of the harness's own records can differ.
  const withinTolerance = (value, baselineValue, floor = 20) =>
    value <= Math.max(floor, baselineValue * 0.15);
  return {
    baseline,
    cost,
    recordDelta,
    cpuCoreShareDelta,
    paintedAreaPerSecondDelta,
    // The CRT's text-shadow animated a text-less element: its cost was the
    // per-frame style recalc, layout, paint and raster it forced. With it
    // deleted, the Window adds none of those over the same baseline; the
    // marquee is compositor-only and is present in both runs.
    flickerCostGone:
      withinTolerance(
        recordDelta.paintRecords,
        baseline.timeline.paintRecords,
      ) &&
      withinTolerance(recordDelta.rasterTasks, baseline.timeline.rasterTasks) &&
      withinTolerance(
        recordDelta.styleRecalcs,
        baseline.timeline.styleRecalcs,
      ) &&
      withinTolerance(recordDelta.layouts, baseline.timeline.layouts) &&
      withinTolerance(recordDelta.layoutCount, baseline.counters.layoutCount) &&
      withinTolerance(
        recordDelta.recalcStyleCount,
        baseline.counters.recalcStyleCount,
      ) &&
      cpuCoreShareDelta < 0.1 &&
      paintedAreaPerSecondDelta < 2000,
  };
}

/** A paused Station's row: dim, prefixed, and still carrying its label. */
async function pausedMark(server) {
  const { browser, page } = await openAppWithLocalAudio(server, ROOMY);
  const readRow = () =>
    page.evaluate(() => {
      const row = document.querySelector("#scroll-container");
      const item = row?.querySelector(".item");
      const animations = document.getAnimations();
      const isMarquee = (animation) => {
        const target = animation.effect?.target;
        return (
          typeof target?.className === "string" &&
          target.className.includes("om-marquee-item-wrapper")
        );
      };
      return {
        dimmed: row?.classList.contains("paused") ?? null,
        text: item?.textContent.trim() ?? null,
        title: item?.getAttribute("title") ?? null,
        marqueeAnimating: animations.some(isMarquee),
        // Everything else on the list is the player's own (webamp's blinking
        // countdown while a Station is tuned), not the app's motion.
        appAnimations: animations.filter(isMarquee).map((a) => a.animationName),
        playerAnimations: animations
          .filter((a) => !isMarquee(a))
          .map((a) => a.animationName),
      };
    });
  const clickMenuItem = (label) =>
    page.evaluate((label) => {
      const anchors = [...document.querySelectorAll('ul[role="menu"] li a')];
      const found = anchors.find((a) => a.textContent.trim() === label);
      if (!found) throw new Error(`no menu item ${label}`);
      found.click();
    }, label);

  const initial = await readRow();
  await clickMenuItem("Play");
  await sleep(2000);
  const playing = await readRow();
  await clickMenuItem("Pause");
  await sleep(1500);
  const paused = await readRow();

  // The mark alone must carry the state under reduced motion: the label
  // stops, and dim + glyph still say paused.
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await sleep(400);
  const pausedReducedMotion = await readRow();
  await browser.close();
  const glyph = "❚❚";
  return {
    initial,
    playing,
    paused,
    pausedReducedMotion,
    markOnInitial: !initial.dimmed && !initial.text.startsWith(glyph),
    markOnPlaying: !playing.dimmed && !playing.text.startsWith(glyph),
    markOnPaused: paused.dimmed && paused.text.startsWith(glyph),
    labelKeepsScrollingWhilePaused: paused.marqueeAnimating,
    markSurvivesReducedMotion:
      pausedReducedMotion.dimmed && pausedReducedMotion.text.startsWith(glyph),
    // The app's own motion stops; the remaining `blink` list is webamp's own
    // countdown blinker — the player's, not the app's, and out of ticket 05's
    // promise, which is what the app authors.
    marqueeStopsUnderReducedMotion:
      pausedReducedMotion.appAnimations.length === 0,
  };
}

async function main() {
  const server = await serveDist(distDir);
  const browser = await launchHeadless(ROOMY);
  const browserVersion = await browser.version();
  await browser.close();
  const prior = await priorFigures();

  const confinement = [
    await confinementAt(server, NARROW, { dx: -80, dy: -120 }),
    await confinementAt(server, SHORT, { dx: 80, dy: 40 }),
    await confinementAt(server, ROOMY, { dx: -80, dy: -120 }),
  ];
  const resize = await resizeCase(server);
  const motion = await motionInventory(server);
  const surfer = await surferFit(server);
  const cost = await idleCost(server);
  const paused = await pausedMark(server);
  await server.close();

  const run = {
    run: "desktop-edges-final",
    at: new Date().toISOString(),
    conditions: {
      distDir,
      viewports: { NARROW, SHORT, ROOMY },
      audioFixture: AUDIO_FIXTURE,
      note: "The headless shell reports prefers-reduced-motion: reduce by default; motion and cost runs emulate no-preference, and the reduced-motion run emulates reduce.",
    },
    identity: {
      ...machineInfo(browserVersion),
      gitRev: git(["rev-parse", "HEAD"]),
      gitDirty: git(["status", "--porcelain"]).length > 0,
      builtAt: (
        await fs.stat(path.join(distDir, "index.html"))
      ).mtime.toISOString(),
    },
    priorFigures: prior,
    results: { confinement, resize, motion, surfer, cost, pausedMark: paused },
  };
  run.assertions = {
    "confinement: the player moves at every viewport": confinement.every(
      (r) => r.moved,
    ),
    "confinement: the group stays inside the mount node": confinement.every(
      (r) => r.groupContainedInMount,
    ),
    "confinement: nothing else moves — the bounds keeps the viewport's rectangle, the icon grid its space, and the Windows' drag boundary still names it":
      confinement.every((r) => r.nothingElseMoved),
    "confinement: the page does not scroll and the bounds clip":
      confinement.every((r) => r.pageDoesNotScroll),
    "minimum: above it the group is fully visible and mobile, at or below it is clipped and still mobile":
      confinement.every((r) => r.moved) &&
      confinement
        .filter((r) => r.groupFitsDesktop)
        .every((r) => r.groupFullyVisibleInBounds) &&
      confinement
        .filter((r) => !r.groupFitsDesktop)
        .every((r) => !r.groupFullyVisibleInBounds),
    "resize: the mount floor follows a taller playlist and a re-drag contains the group":
      resize.floorFollowed && resize.reDragContained,
    "motion: the marquee is the only animation, bare and with a Window open":
      motion.onlyMarquee,
    "motion: reduced motion leaves no app animation and the rows still read":
      motion.reducedMotionIsEmpty && motion.rowsStillRenderText,
    "surfer: the pane renders through the shared wrapper, whose box is the video it carries — hidden overflow, content inside, scanlines on the screen and not the frame":
      surfer.fit,
    "cost: the Window adds no paint, raster, style or layout records over the baseline, and only the marquee costs":
      cost.flickerCostGone,
    "paused mark: dim and glyph on a paused Station, none when playing or untuned":
      paused.markOnInitial && paused.markOnPlaying && paused.markOnPaused,
    "paused mark: the label keeps scrolling, and the mark survives a stopped marquee":
      paused.labelKeepsScrollingWhilePaused &&
      paused.markSurvivesReducedMotion &&
      paused.marqueeStopsUnderReducedMotion,
  };
  await writeResults(resultsPath, run);

  for (const [name, passed] of Object.entries(run.assertions)) {
    console.log(`${passed ? "PASS" : "FAIL"}  ${name}`);
  }
  console.log(`\nprior: ${JSON.stringify(prior, null, 2)}`);
  console.log(`\nresults: ${resultsPath}`);
  if (Object.values(run.assertions).some((passed) => !passed)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
