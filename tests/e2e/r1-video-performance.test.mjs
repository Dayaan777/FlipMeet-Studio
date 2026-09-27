import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

describe("Tier 1: R1 — Video Performance & Initialization", () => {
  const videoHeroPath = path.join(ROOT, "components", "VideoHero.tsx");
  const processScrubberPath = path.join(ROOT, "components", "ProcessVideoScrubber.tsx");
  const navBarPath = path.join(ROOT, "components", "NavBar.tsx");
  const layoutPath = path.join(ROOT, "app", "layout.tsx");

  test("R1.1: VideoHero eliminates 60Hz idle RAF canvas blit loop when stationary", () => {
    assert.ok(fs.existsSync(videoHeroPath), "components/VideoHero.tsx must exist");
    const code = fs.readFileSync(videoHeroPath, "utf-8");

    // The legacy code ran continuous requestAnimationFrame(tick) blitting frames even when stationary
    const hasContinuousTickLoop = /function\s+tick\(\)|const\s+tick\s*=\s*\(\)\s*=>/i.test(code) &&
      /rafId\s*=\s*requestAnimationFrame\(tick\)/i.test(code);
    assert.strictEqual(
      hasContinuousTickLoop,
      false,
      "VideoHero must NOT run continuous idle requestAnimationFrame tick loop when stationary"
    );

    // Must draw upon frame decode / seeked / rVFC / resize
    assert.ok(
      code.includes("drawFrame") || code.includes("drawImage"),
      "VideoHero must define an event-driven canvas frame blitting routine"
    );
  });

  test("R1.2: VideoHero eliminates video.fastSeek to prevent jarring keyframe snapping", () => {
    const code = fs.readFileSync(videoHeroPath, "utf-8");
    assert.ok(
      !code.includes("video.fastSeek"),
      "VideoHero must not use video.fastSeek() which causes 1-2s keyframe jumping on mobile"
    );
  });

  test("R1.3: VideoHero implements non-blocking mutex seeking pipeline", () => {
    const code = fs.readFileSync(videoHeroPath, "utf-8");
    assert.ok(
      code.includes("isSeeking") && (code.includes("pendingTargetTime") || code.includes("hasPendingSeek")),
      "VideoHero must implement mutex seeking with isSeeking lock and pending target time queue"
    );
    assert.ok(
      code.includes("currentTime"),
      "VideoHero must scrub via fine-grained video.currentTime assignment"
    );
  });

  test("R1.4: VideoHero integrates requestVideoFrameCallback (rVFC) with fallback", () => {
    const code = fs.readFileSync(videoHeroPath, "utf-8");
    assert.ok(
      code.includes("requestVideoFrameCallback"),
      "VideoHero must leverage requestVideoFrameCallback for compositor-synchronized rendering"
    );
    assert.ok(
      code.includes("seeked"),
      "VideoHero must maintain seeked event listener as fallback for legacy browser engines"
    );
  });

  test("R1.5: VideoHero implements in-memory Blob preloading with unmount cleanup", () => {
    const code = fs.readFileSync(videoHeroPath, "utf-8");
    assert.ok(
      code.includes("createObjectURL") && code.includes("blob"),
      "VideoHero must implement in-memory Blob preloading via URL.createObjectURL"
    );
    assert.ok(
      code.includes("revokeObjectURL"),
      "VideoHero must call URL.revokeObjectURL on unmount to prevent memory leaks"
    );
  });

  test("R1.6: VideoHero applies GPU hardware acceleration CSS classes and containment", () => {
    const code = fs.readFileSync(videoHeroPath, "utf-8");
    const hasGpuClasses = code.includes("transform-gpu") || code.includes("translateZ(0)");
    const hasContainment = code.includes("contain-paint") || code.includes("contain: \"paint\"") || code.includes("will-change");
    assert.ok(hasGpuClasses, "VideoHero canvas must include GPU transform acceleration hints");
    assert.ok(hasContainment, "VideoHero canvas must include paint containment / will-change hints");
  });

  test("R1.7: VideoHero embeds completion sentinel for dynamic Navbar synchronization", () => {
    const code = fs.readFileSync(videoHeroPath, "utf-8");
    assert.ok(
      code.includes('id="hero-sentinel"') || code.includes("hero-sentinel"),
      "VideoHero must include #hero-sentinel element at the bottom of the container"
    );
  });

  test("R1.8: ProcessVideoScrubber modernizes to Canvas 2D + rVFC + mutex seeking", () => {
    assert.ok(fs.existsSync(processScrubberPath), "components/ProcessVideoScrubber.tsx must exist");
    const code = fs.readFileSync(processScrubberPath, "utf-8");

    assert.ok(
      code.includes("<canvas") && code.includes("getContext(\"2d\""),
      "ProcessVideoScrubber must render via Canvas 2D surface instead of direct DOM video"
    );
    assert.ok(
      code.includes("requestVideoFrameCallback"),
      "ProcessVideoScrubber must use requestVideoFrameCallback for presentation timing"
    );
    assert.ok(
      code.includes("isSeeking"),
      "ProcessVideoScrubber must use mutex seeking to eliminate seek abort flooding"
    );
    assert.ok(
      code.includes("createObjectURL") && code.includes("revokeObjectURL"),
      "ProcessVideoScrubber must implement in-memory Blob preloading and URL revocation"
    );
    assert.ok(
      code.includes("process-hero-sentinel"),
      "ProcessVideoScrubber must include #process-hero-sentinel for Navbar sync"
    );
  });

  test("R1.9: app/layout.tsx includes video preloads for process page assets", () => {
    assert.ok(fs.existsSync(layoutPath), "app/layout.tsx must exist");
    const code = fs.readFileSync(layoutPath, "utf-8");
    assert.ok(
      code.includes("process-page.mp4") || code.includes("process-page-desktop.mp4"),
      "app/layout.tsx must declare <link rel=\"preload\" as=\"video\"> for process page video assets"
    );
  });

  test("R1.10: NavBar synchronizes immediately with hero sequence conclusion", () => {
    assert.ok(fs.existsSync(navBarPath), "components/NavBar.tsx must exist");
    const code = fs.readFileSync(navBarPath, "utf-8");

    // Must NOT have legacy hardcoded 600vh (6 * window.innerHeight)
    const hasHardcoded600vh = /window\.innerHeight\s*\*\s*6/i.test(code);
    assert.strictEqual(
      hasHardcoded600vh,
      false,
      "NavBar must NOT use hardcoded (window.innerHeight * 6) scroll threshold"
    );

    // Must synchronize using sentinel or container height calculation
    const hasDynamicSync = code.includes("hero-sentinel") ||
      (code.includes("pathname === \"/\"") && (code.includes("3.5") || code.includes("2.5") || code.includes("5.0")));
    assert.ok(
      hasDynamicSync,
      "NavBar must dynamically synchronize scroll threshold with hero sequence conclusion"
    );

    // Must trigger immediate appearance
    assert.ok(
      code.includes("translate-y-0 opacity-100"),
      "NavBar must transition to translate-y-0 opacity-100 when scrolled past hero"
    );

    // Process page solid backdrop blur support
    assert.ok(
      code.includes("backdrop-blur") && !code.includes("scrolled && !isProcess"),
      "NavBar must support backdrop blur transition on /process once scrolled past hero"
    );
  });
});
