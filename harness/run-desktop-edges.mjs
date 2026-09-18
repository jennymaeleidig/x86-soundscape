// SPDX-License-Identifier: CC0-1.0
/**
 * The desktop-edges run: drives the production build in the headless shell at
 * the earlier runs' small viewport and reproduces both defects — a drag at a
 * small viewport that moves the player nowhere, and an idle page with one
 * Window open and nothing playing paying a large share of a core. The run's
 * numbers, conditions and identity are written to a results file a later
 * ticket can diff.
 *
 * Usage: node harness/run-desktop-edges.mjs [distDir] [width] [height]
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
  samplePlayerBoxes,
  serveDist,
  sleep,
  waitForApp,
  writeResults,
} from "./harness.mjs";

const distDir = path.resolve(process.argv[2] ?? "dist/x86-soundscape/browser");
const width = Number(process.argv[3] ?? 240);
const height = Number(process.argv[4] ?? 400);
const resultsPath = `.scratch/desktop-edges/results/${new Date()
  .toISOString()
  .replace(/[:.]/g, "-")}-desktop-edges.json`;

function git(revArgs) {
  try {
    return execFileSync("git", revArgs, { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

/** Opens the Weather Window. The Applet sits partly outside the desktop at
 * the measurement viewport, so the double click is delivered as a real DOM
 * event on its button rather than through the pointer's coordinates; the
 * defect under test is the drag, not the opening. */
async function openWeatherWindow(page) {
  await page.evaluate(() => {
    const applets = [...document.querySelectorAll("app-applet")];
    const weather = applets.find((applet) =>
      applet.textContent?.includes("Weather"),
    );
    const button = weather?.querySelector("button");
    if (!button) {
      throw new Error("the Weather applet is not on the desktop");
    }
    button.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  });
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("app-window")].some((w) =>
        w.textContent?.includes("Weather"),
      ),
    { timeout: 15000 },
  );
}

async function main() {
  const server = await serveDist(distDir);
  const url = `http://127.0.0.1:${server.port}/`;
  const browser = await launchHeadless({ width, height });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await waitForApp(page);
  const browserVersion = await browser.version();

  // Defect 1: the player's drag at a deliberately small viewport.
  const grab = await grabPoint(page);
  const playerBefore = (await samplePlayerBoxes(page)).window;
  const dragSamples = await dragPlayer(page, {
    x: grab.x,
    y: grab.y,
    dx: -80,
    dy: -120,
    steps: 8,
  });
  const first = dragSamples[0].window;
  const last = dragSamples[dragSamples.length - 1].window;
  const dragged = Math.hypot(last.x - first.x, last.y - first.y);
  const playerAfter = (await samplePlayerBoxes(page)).window;
  const movedAfterRelease = Math.hypot(
    playerAfter.x - playerBefore.x,
    playerAfter.y - playerBefore.y,
  );
  // The defect: the drag produces almost none of its intended travel — the
  // axes lock and the pointer's moves move the player nowhere. The one-time
  // snap to the clamp at the drag's start is part of the lock, not a response
  // to the moves, and is reported separately as the release offset.
  const intendedTravel = Math.hypot(80, 120);
  const confinementReproduced = dragged < intendedTravel * 0.25;

  // Defect 2: the idle cost with one Window open and nothing playing —
  // measured against a no-Window baseline taken first, under the same probe.
  const idleAnimations = await listAnimations(page);
  const baselineCost = await measureCost(page, { seconds: 6, baseline: true });
  await openWeatherWindow(page);
  // Nothing is playing: no gesture has tuned anything, and this run makes
  // none. Give the Window's own boot a moment before the window opens.
  await sleep(3000);
  const windowAnimations = await listAnimations(page);
  const cost = await measureCost(page, { seconds: 12 });
  // The earlier finding's "+35–40 % of a core" is an absolute share of one
  // core; the no-Window baseline and the delta ride along in the results file
  // so a later ticket can diff either form.
  const idleCostReproduced = cost.cpuCoreShare >= 0.35;

  await browser.close();
  await server.close();

  const run = {
    run: "desktop-edges",
    at: new Date().toISOString(),
    conditions: {
      url,
      distDir,
      viewport: { width, height },
      windowOpen: "Weather",
      playing: false,
    },
    identity: {
      ...machineInfo(browserVersion),
      gitRev: git(["rev-parse", "HEAD"]),
      gitDirty: git(["status", "--porcelain"]).length > 0,
      builtAt: (
        await fs.stat(path.join(distDir, "index.html"))
      ).mtime.toISOString(),
    },
    results: {
      drag: {
        grab,
        intended: { dx: -80, dy: -120 },
        intendedTravel,
        playerBefore,
        playerAfterPointerRelease: playerAfter,
        movedPx: { duringDrag: dragged, afterRelease: movedAfterRelease },
        samples: dragSamples,
        defectReproduced: confinementReproduced,
      },
      idle: {
        animationsWithoutWindow: idleAnimations,
        animationsWithWindow: windowAnimations,
        cost,
        baselineCost,
        defectReproduced: idleCostReproduced,
      },
    },
  };
  await writeResults(resultsPath, run);

  console.log(
    `drag at ${width}x${height}: moved ${dragged.toFixed(2)} px of ${intendedTravel.toFixed(0)} intended during the drag, ${movedAfterRelease.toFixed(2)} px release offset — defect ${confinementReproduced ? "REPRODUCED" : "NOT reproduced"}`,
  );
  console.log(
    `idle: ${(baselineCost.cpuCoreShare * 100).toFixed(1)}% of a core without a Window, ${(cost.cpuCoreShare * 100).toFixed(1)}% with one Window open (+${((cost.cpuCoreShare - baselineCost.cpuCoreShare) * 100).toFixed(1)}), ${(cost.paintedAreaPerSecond / 1e3).toFixed(1)}k px/s changed (${cost.method}) — defect ${idleCostReproduced ? "REPRODUCED" : "NOT reproduced"}`,
  );
  console.log(`results: ${resultsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
