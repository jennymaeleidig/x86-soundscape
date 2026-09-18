// SPDX-License-Identifier: CC0-1.0
/**
 * The measurement harness for the desktop's edges.
 *
 * Serves the built output, launches the installed chrome-headless-shell with
 * the flag set the earlier measurements used (--no-sandbox --disable-gpu
 * --single-process) and offers three capabilities: an arbitrary viewport set
 * before the app boots, a real stepped pointer drag on the player sampled
 * after every move, and a measured window reporting the document's running
 * animations, the changed-pixels and counter figures and the share of one
 * core.
 */
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

/** The installed shell the earlier measurements ran on, overridable. */
const HEADLESS_SHELL =
  process.env.CHROME_HEADLESS_SHELL ??
  path.join(
    process.env.HOME ?? "",
    "Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell",
  );

/** The flag set behind every measurement this effort rests on. */
export const BROWSER_FLAGS = [
  "--no-sandbox",
  "--disable-gpu",
  "--single-process",
];

/** The player main window, the only app-internal selector the harness knows. */
export const PLAYER_WINDOW_SELECTOR = "#webamp #main-window";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A static file server over a built output directory. */
export function serveDist(dir) {
  const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".wsz": "application/octet-stream",
    ".mp3": "audio/mpeg",
  };
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let filePath = path.join(dir, decodeURIComponent(url.pathname));
    if (filePath.endsWith("/") || filePath.endsWith(path.sep)) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath)
      .then((body) => {
        res.writeHead(200, {
          "content-type":
            contentTypes[path.extname(filePath)] ?? "application/octet-stream",
        });
        res.end(body);
      })
      .catch(() => {
        res.writeHead(404);
        res.end("not found");
      });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({
        port: server.address().port,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

/**
 * Launches the installed headless shell with the measurement flag set, at the
 * given viewport. The viewport is set at page creation, before any navigation,
 * so the app boots inside the size under test rather than being resized into
 * it.
 */
export async function launchHeadless({ width, height }) {
  const browser = await puppeteer.launch({
    executablePath: HEADLESS_SHELL,
    headless: true,
    args: [...BROWSER_FLAGS, `--window-size=${width},${height}`],
    defaultViewport: { width, height },
  });
  return browser;
}

/** What ran and where: the browser build and the machine, beside every number.
 * `browserVersion` is the string `browser.version()` returns, taken while the
 * browser is still open. */
export function machineInfo(browserVersion = null) {
  const cpus = os.cpus();
  return {
    node: process.version,
    platform: `${os.platform()} ${os.arch()} ${os.release()}`,
    cpu: cpus.length > 0 ? cpus[0].model : "unknown",
    cores: cpus.length,
    headlessShell: HEADLESS_SHELL,
    browserFlags: BROWSER_FLAGS,
    browserVersion,
  };
}

/**
 * Cumulative CPU seconds across the browser's processes, from the browser's
 * own accounting (SystemInfo.getProcessInfo) — no machine-side sampling.
 */
async function cumulativeCpuSeconds(browser) {
  const cdp = await browser.target().createCDPSession();
  try {
    const { processInfo } = await cdp.send("SystemInfo.getProcessInfo");
    return processInfo.reduce((sum, proc) => sum + proc.cpuTime, 0);
  } finally {
    await cdp.detach();
  }
}

/** Waits one frame, so a synthesized input event's effect is on screen. */
export async function nextFrame(page) {
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

/**
 * Boxes read from the live document: the player main window's box, its
 * positioned wrapper (the group the engine moves when the window is dragged,
 * whose own box is 0×0), and the mount node the engine was mounted into.
 */
export async function samplePlayerBoxes(page) {
  return page.evaluate((windowSelector) => {
    const mount = document.querySelector("winamp > div");
    const mainWindow = document.querySelector(windowSelector);
    const group = mainWindow?.parentElement ?? null;
    if (!mount) {
      throw new Error(
        "the player mount node (winamp > div) is not in the document",
      );
    }
    if (!group || !mainWindow) {
      throw new Error(
        `the player group (${windowSelector} wrapper) is not in the document`,
      );
    }
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return { mount: box(mount), group: box(group), window: box(mainWindow) };
  }, PLAYER_WINDOW_SELECTOR);
}

/** The player main window's title bar centre, in viewport coordinates. */
export async function grabPoint(page) {
  const { window: playerWindow } = await samplePlayerBoxes(page);
  // The grab offset sits one title-bar row into the window's top edge.
  return { x: playerWindow.x + playerWindow.width / 2, y: playerWindow.y + 8 };
}

/**
 * A real pointer drag, synthesized through the browser's input pipeline —
 * not a synthetic DOM event — moved in `steps` and sampled after every move.
 * Coordinates are viewport coordinates of the grab point; the drag ends
 * before the pointer is released, so `dx`/`dy` are the intended travel.
 */
export async function dragPlayer(page, { x, y, dx, dy, steps = 8 }) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  const samples = [];
  for (let i = 1; i <= steps; i++) {
    const sx = x + (dx * i) / steps;
    const sy = y + (dy * i) / steps;
    await page.mouse.move(sx, sy);
    await nextFrame(page);
    const boxes = await samplePlayerBoxes(page);
    samples.push({ step: i, pointer: { x: sx, y: sy }, ...boxes });
  }
  await page.mouse.up();
  return samples;
}

/** The document's running animations, listed without reading a stylesheet. */
export async function listAnimations(page) {
  return page.evaluate(() =>
    document.getAnimations().map((animation) => {
      const effect = animation.effect;
      const target = effect?.target;
      return {
        name:
          animation.animationName ?? animation.constructor.name ?? "animation",
        playState: animation.playState,
        target: target
          ? `${target.tagName.toLowerCase()}${
              target.className && typeof target.className === "string"
                ? `.${target.className.trim().split(/\s+/).join(".")}`
                : ""
            }`
          : null,
      };
    }),
  );
}

/**
 * A measured window: changed pixels per second, style/layout counters and the
 * share of one core — and, when `baseline` is given, the same figures taken
 * without the Window open, so the Window's own cost is a delta.
 *
 * Changed pixels are measured by diffing raw frames sampled at a fixed
 * interval: the headless shell produces no compositor frames of its own and
 * emits no paint-rect notifications, so each sample forces a frame and counts
 * the pixels that changed since the previous one. The figure is a lower bound
 * on the true repaint rate, and the forced frames themselves cost CPU — the
 * same cost is in the baseline, so the delta answers the Window's share.
 * Counters and CPU come from the browser's own accounting (Performance
 * metrics and SystemInfo.getProcessInfo) over the same wall-clock span.
 */
export async function measureCost(
  page,
  { seconds = 12, intervalMs = 100, settle = 2000, baseline = false } = {},
) {
  await sleep(settle);
  const browser = page.browser();
  const cdp = await page.createCDPSession();
  const readCounters = async () => {
    const { metrics } = await cdp
      .send("Performance.enable")
      .then(() => cdp.send("Performance.getMetrics"));
    return Object.fromEntries(metrics.map((m) => [m.name, m.value]));
  };
  const countersBefore = await readCounters();
  const cpuBefore = await cumulativeCpuSeconds(browser);
  const wallBefore = performance.now();
  const { PNG } = await import("pngjs");
  const changedPixels = (a, b) => {
    let changed = 0;
    const n = Math.min(a.data.length, b.data.length);
    for (let i = 0; i < n; i += 4) {
      if (
        a.data[i] !== b.data[i] ||
        a.data[i + 1] !== b.data[i + 1] ||
        a.data[i + 2] !== b.data[i + 2]
      ) {
        changed++;
      }
    }
    return changed;
  };
  const capture = () =>
    page
      .screenshot({ type: "png", optimizeForSpeed: true })
      .then((buf) => PNG.sync.read(Buffer.from(buf)));
  let previous = await capture();
  let changedTotal = 0;
  const deadline = performance.now() + seconds * 1000;
  while (performance.now() < deadline) {
    await sleep(intervalMs);
    const frame = await capture();
    changedTotal += changedPixels(previous, frame);
    previous = frame;
  }
  const wallSeconds = (performance.now() - wallBefore) / 1000;
  const cpuSeconds = (await cumulativeCpuSeconds(browser)) - cpuBefore;
  const countersAfter = await readCounters();
  await cdp.send("Performance.disable");
  await cdp.detach();
  const counterDelta = (name) =>
    Math.round((countersAfter[name] ?? 0) - (countersBefore[name] ?? 0));
  return {
    conditions: baseline ? "no Window open" : "one Window open",
    method: "forced-frame pixel diff at the sampling interval",
    windowSeconds: wallSeconds,
    intervalMs,
    paintedAreaPerSecond: changedTotal / wallSeconds,
    cpuCoreShare: cpuSeconds / wallSeconds,
    counters: {
      layoutCount: counterDelta("LayoutCount"),
      recalcStyleCount: counterDelta("RecalcStyleCount"),
      taskDurationMs: Math.round(
        (countersAfter["TaskDuration"] - countersBefore["TaskDuration"]) * 1000,
      ),
    },
  };
}

/** Waits for the app to be interactive: the player mounted and rendered. */
export async function waitForApp(page) {
  await page.waitForSelector(PLAYER_WINDOW_SELECTOR, { timeout: 30000 });
  await sleep(2000);
}

/** Writes one run's results file: the numbers, the conditions, the identity. */
export async function writeResults(resultsPath, run) {
  await fs.mkdir(path.dirname(resultsPath), { recursive: true });
  await fs.writeFile(resultsPath, `${JSON.stringify(run, null, 2)}\n`);
}
