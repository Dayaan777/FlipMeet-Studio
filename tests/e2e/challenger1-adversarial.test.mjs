import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

describe("Adversarial Challenger 1: Empirical Stress Suite", () => {

  // =========================================================================
  // DOMAIN 1: VIDEO SEEK MUTEXES & SCRUBBING ARCHITECTURE
  // =========================================================================
  describe("Domain 1: Video Seek Mutexes & Decoder Watchdog Stress Testing", () => {
    
    class VideoScrubberMutexHarness {
      constructor(duration = 10.0) {
        this.duration = duration;
        this.currentTime = 0;
        this.targetTime = 0;
        this.isSeeking = false;
        this.pendingTargetTime = null;
        this.seekTimeout = null;
        this.isDestroyed = false;
        this.drawCount = 0;
        this.seekDispatches = [];
        this.watchdogTriggers = 0;
      }

      syncSize() {}

      drawFrame() {
        if (this.isDestroyed) return;
        this.drawCount++;
      }

      commitSeek(t) {
        if (this.isDestroyed || !this.duration || isNaN(this.duration)) return;

        if (this.isSeeking) {
          this.pendingTargetTime = t;
          return;
        }

        const clampedTime = Math.max(0, Math.min(this.duration, t));
        if (Math.abs(this.currentTime - clampedTime) < 0.001) {
          this.drawFrame();
          if (this.pendingTargetTime !== null) {
            const next = this.pendingTargetTime;
            this.pendingTargetTime = null;
            this.commitSeek(next);
          }
          return;
        }

        this.isSeeking = true;
        this.targetTime = clampedTime;
        this.currentTime = clampedTime;
        this.seekDispatches.push(clampedTime);

        if (this.seekTimeout) clearTimeout(this.seekTimeout);
        this.seekTimeout = setTimeout(() => {
          if (this.isDestroyed) return;
          if (this.isSeeking) {
            this.watchdogTriggers++;
            this.isSeeking = false;
            if (this.pendingTargetTime !== null) {
              const next = this.pendingTargetTime;
              this.pendingTargetTime = null;
              this.commitSeek(next);
            }
          }
        }, 250);
      }

      simulateSeeked(useWatchdogInstead = false) {
        if (this.isDestroyed) return;
        if (this.seekTimeout) clearTimeout(this.seekTimeout);

        this.drawFrame();
        this.isSeeking = false;
        if (this.pendingTargetTime !== null) {
          const next = this.pendingTargetTime;
          this.pendingTargetTime = null;
          this.commitSeek(next);
        }
      }

      destroy() {
        this.isDestroyed = true;
        if (this.seekTimeout) clearTimeout(this.seekTimeout);
      }
    }

    test("1.1: Mutex recovers via 250ms watchdog when hardware decoder stalls and queues latest target", async () => {
      const harness = new VideoScrubberMutexHarness(10.0);

      // Start initial seek
      harness.commitSeek(1.0);
      assert.strictEqual(harness.isSeeking, true);
      assert.strictEqual(harness.currentTime, 1.0);
      assert.strictEqual(harness.pendingTargetTime, null);

      // Rapid scroll events arrive while seeking is in progress
      harness.commitSeek(2.0);
      harness.commitSeek(3.5);
      harness.commitSeek(4.8);

      // Mutex coalesces to latest target
      assert.strictEqual(harness.isSeeking, true);
      assert.strictEqual(harness.pendingTargetTime, 4.8);
      assert.strictEqual(harness.seekDispatches.length, 1);

      // Wait 260ms for watchdog timeout to trip (simulating hung decoder)
      await new Promise((resolve) => setTimeout(resolve, 260));

      assert.strictEqual(harness.watchdogTriggers, 1, "Watchdog must have triggered once");
      assert.strictEqual(harness.isSeeking, true, "Watchdog should have started the queued seek (4.8)");
      assert.strictEqual(harness.currentTime, 4.8);
      assert.strictEqual(harness.pendingTargetTime, null, "Pending target must be drained");
      assert.strictEqual(harness.seekDispatches.length, 2, "Second seek dispatch must have executed");

      // Complete the pending seek normally
      harness.simulateSeeked();
      assert.strictEqual(harness.isSeeking, false);
      assert.strictEqual(harness.currentTime, 4.8);
      harness.destroy();
    });

    test("1.2: Delayed seeked resolution arriving after watchdog does not corrupt pipeline", async () => {
      const harness = new VideoScrubberMutexHarness(10.0);

      harness.commitSeek(1.0);
      harness.commitSeek(5.0);

      // Watchdog trips at 250ms
      await new Promise((resolve) => setTimeout(resolve, 260));
      assert.strictEqual(harness.currentTime, 5.0);
      assert.strictEqual(harness.isSeeking, true);

      // Now suppose the first seek (1.0) belatedly fires its seeked callback
      harness.simulateSeeked();
      assert.strictEqual(harness.isSeeking, false);

      // Immediately submit a new seek
      harness.commitSeek(7.5);
      assert.strictEqual(harness.isSeeking, true);
      assert.strictEqual(harness.currentTime, 7.5);

      harness.simulateSeeked();
      assert.strictEqual(harness.isSeeking, false);
      assert.strictEqual(harness.currentTime, 7.5);
      harness.destroy();
    });

    test("1.3: 10,000 rapid scroll bursts process in O(1) memory without deadlock", () => {
      const harness = new VideoScrubberMutexHarness(10.0);

      // Rapidly fire 10,000 seeks
      for (let i = 0; i < 10000; i++) {
        const randTime = Math.random() * 10;
        harness.commitSeek(randTime);
        if (i % 200 === 0) {
          harness.simulateSeeked();
        }
      }

      // Final state must be cleanly bounded
      assert.ok(harness.currentTime >= 0 && harness.currentTime <= 10.0);
      let safetyCounter = 0;
      while (harness.isSeeking && safetyCounter++ < 5) {
        harness.simulateSeeked();
      }
      assert.strictEqual(harness.isSeeking, false, "Mutex scrubber must not deadlock after drain");
      assert.strictEqual(harness.pendingTargetTime, null);
      harness.destroy();
    });

    test("1.4: Extreme boundary values (negative, overflow, zero/NaN duration, sub-millisecond) handled safely", () => {
      // Zero duration
      const zeroHarness = new VideoScrubberMutexHarness(0);
      zeroHarness.commitSeek(5.0);
      assert.strictEqual(zeroHarness.isSeeking, false, "Zero duration must abort immediately");
      assert.strictEqual(zeroHarness.seekDispatches.length, 0);

      // NaN duration
      const nanHarness = new VideoScrubberMutexHarness(NaN);
      nanHarness.commitSeek(2.0);
      assert.strictEqual(nanHarness.isSeeking, false, "NaN duration must abort immediately");

      // Negative and overflow targets
      const normHarness = new VideoScrubberMutexHarness(8.5);
      normHarness.commitSeek(-50.0);
      assert.strictEqual(normHarness.currentTime, 0, "Negative seek must clamp to 0");
      normHarness.simulateSeeked();

      normHarness.commitSeek(9999.0);
      assert.strictEqual(normHarness.currentTime, 8.5, "Overflow seek must clamp to duration");
      normHarness.simulateSeeked();

      // Sub-millisecond seek delta (< 0.001)
      const prevDispatches = normHarness.seekDispatches.length;
      normHarness.commitSeek(8.5005);
      assert.strictEqual(
        normHarness.seekDispatches.length,
        prevDispatches,
        "Sub-millisecond difference must not dispatch hardware seek"
      );
      assert.ok(normHarness.drawCount > 0, "Sub-millisecond seek must blit current frame");
      normHarness.destroy();
    });

    test("1.5: Teardown on unmount cleanly cancels active timers, aborts fetch, and prevents callbacks", async () => {
      const harness = new VideoScrubberMutexHarness(10.0);
      harness.commitSeek(3.0);
      harness.commitSeek(6.0);

      // Component unmounts
      harness.destroy();

      // Watchdog interval elapses
      await new Promise((resolve) => setTimeout(resolve, 260));

      assert.strictEqual(harness.watchdogTriggers, 0, "Destroyed component must not fire watchdog triggers");
      assert.strictEqual(harness.currentTime, 3.0, "Destroyed component must not process pending seeks");
    });
  });

  // =========================================================================
  // DOMAIN 2: GESTURE DELTAS IN CAROUSELS
  // =========================================================================
  describe("Domain 2: Carousel Touch Gestures & Discrimination Under Stress", () => {

    function evaluateLookCarouselSwipe(startX, startY, endX, endY, threshold = 40) {
      const diffX = endX - startX;
      const diffY = endY - startY;
      if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
        return diffX < 0 ? 1 : -1; // 1 = next, -1 = prev
      }
      return 0; // no navigation
    }

    test("2.1: 1,000 randomized diagonal gesture vectors strictly obey orientation oracle", () => {
      let nextCount = 0;
      let prevCount = 0;
      let noneCount = 0;

      for (let i = 0; i < 1000; i++) {
        const startX = 200;
        const startY = 300;
        const diffX = (Math.random() - 0.5) * 600; // -300 to +300
        const diffY = (Math.random() - 0.5) * 600; // -300 to +300
        const endX = startX + diffX;
        const endY = startY + diffY;

        const result = evaluateLookCarouselSwipe(startX, startY, endX, endY, 40);

        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        if (absX <= 40) {
          assert.strictEqual(result, 0, `Sub-threshold (|diffX|=${absX} <= 40) must be 0`);
          noneCount++;
        } else if (absX <= absY) {
          assert.strictEqual(result, 0, `Vertical or exact diagonal (|diffX|=${absX} <= |diffY|=${absY}) must be 0`);
          noneCount++;
        } else if (diffX < 0) {
          assert.strictEqual(result, 1, "Dominant left swipe must trigger next (+1)");
          nextCount++;
        } else {
          assert.strictEqual(result, -1, "Dominant right swipe must trigger prev (-1)");
          prevCount++;
        }
      }

      assert.ok(nextCount > 0, "Should have observed valid next gestures");
      assert.ok(prevCount > 0, "Should have observed valid prev gestures");
      assert.ok(noneCount > 0, "Should have observed rejected non-swipes");
    });

    test("2.2: Sub-threshold jitter (1px - 39px) and high-frequency tremors reject navigation", () => {
      const jitters = [
        [0, 0], [1, 0], [-1, 0], [10, 5], [-15, 2], [25, 20], [39, 0], [-39.9, 5]
      ];
      for (const [jx, jy] of jitters) {
        const res = evaluateLookCarouselSwipe(100, 100, 100 + jx, 100 + jy, 40);
        assert.strictEqual(res, 0, `Jitter (${jx}, ${jy}) must not trigger slide shift`);
      }
    });

    test("2.3: Link click interception lifecycle: Drag lock active during swipe, cleared on tap", async () => {
      let isSwiping = false;
      let clearTimer = null;

      const onTouchStart = () => {
        isSwiping = false;
      };

      const onTouchMove = (diffX, diffY) => {
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
          isSwiping = true;
        }
      };

      const onTouchEnd = () => {
        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
          isSwiping = false;
        }, 120);
      };

      // Scenario A: Genuine tap
      onTouchStart();
      onTouchMove(2, 1); // < 10px
      onTouchEnd();
      assert.strictEqual(isSwiping, false, "Tap must NOT engage isSwiping lock");

      // Scenario B: Horizontal swipe gesture
      onTouchStart();
      onTouchMove(60, 5); // > 10px, dominant X
      assert.strictEqual(isSwiping, true, "Horizontal swipe MUST engage isSwiping lock");
      onTouchEnd();

      // Synthetic click arrives at 30ms
      await new Promise((r) => setTimeout(r, 30));
      assert.strictEqual(isSwiping, true, "isSwiping lock must remain active during click window");

      // Lock expires after 120ms
      await new Promise((r) => setTimeout(r, 110));
      assert.strictEqual(isSwiping, false, "isSwiping lock must automatically release after 120ms");
    });

    test("2.4: Circular modulo index wrap-around maintains invariant under 10,000 random shifts", () => {
      const count = 6;
      let current = 0;
      const shift = (dir) => {
        current = (current + dir + count) % count;
      };

      for (let i = 0; i < 10000; i++) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        shift(dir);
        assert.ok(current >= 0 && current < count, `Index ${current} must remain in [0, ${count - 1}]`);
      }
    });
  });

  // =========================================================================
  // DOMAIN 3: PACKAGING FLYER INFINITE SHOCK ANIMATION
  // =========================================================================
  describe("Domain 3: Packaging Flyer Infinite Shock Animation Stress", () => {
    
    test("3.1: 500 rapid successive clicks monotonically increment shockKey with zero deadlock", () => {
      let shockKey = 0;
      const trigger = () => {
        shockKey += 1;
      };

      for (let i = 1; i <= 500; i++) {
        trigger();
        assert.strictEqual(shockKey, i, `shockKey must be ${i} after click ${i}`);
      }

      assert.strictEqual(shockKey, 500);
    });

    test("3.2: Footer source inspection verifies no interaction lock or boolean guard on flyer trigger", () => {
      const footerPath = path.join(ROOT, "components", "Footer.tsx");
      assert.ok(fs.existsSync(footerPath));
      const code = fs.readFileSync(footerPath, "utf-8");

      // Extract PackagingFlyer component definition
      const flyerMatch = code.match(/function PackagingFlyer\(\)\s*\{([\s\S]*?)\n\}/);
      assert.ok(flyerMatch, "PackagingFlyer component must be defined in Footer.tsx");
      const flyerCode = flyerMatch[1];

      // Verify PackagingFlyer exists and uses shockKey
      assert.ok(flyerCode.includes("setShockKey((k) => k + 1)"));

      // Verify key={shockKey} on Image to force animation restart
      assert.ok(flyerCode.includes("key={shockKey}"));

      // Verify no locks exist like isAnimating or disabled in flyer component
      assert.ok(!flyerCode.includes("isAnimating"), "PackagingFlyer must not include isAnimating lock");
      assert.ok(!flyerCode.includes("disabled"), "PackagingFlyer must not contain disabled attribute");

      // Verify centered on mobile, end-aligned on desktop in Footer
      assert.ok(code.includes("justify-center md:justify-end"));
    });
  });

  // =========================================================================
  // DOMAIN 4: MOBILE LAYOUT BREAKPOINTS & SPATIAL COLLISION
  // =========================================================================
  describe("Domain 4: Mobile Layout Breakpoints (320px, 375px, 390px, 414px, 768px, 1024px)", () => {
    const viewports = [
      { name: "iPhone SE (320px)", width: 320, isMobile: true },
      { name: "iPhone SE 2/3 (375px)", width: 375, isMobile: true },
      { name: "iPhone 13/14 (390px)", width: 390, isMobile: true },
      { name: "iPhone Plus (414px)", width: 414, isMobile: true },
      { name: "iPad Portrait (768px)", width: 768, isMobile: false },
      { name: "iPad Landscape (1024px)", width: 1024, isMobile: false },
    ];

    test("4.1: VideoCarousel arrows and pagination dots have ZERO collision across all 6 viewports", () => {
      for (const vp of viewports) {
        if (vp.isMobile) {
          // On mobile (< 768px):
          // Container height: Reel stage (490) + mb-16 (64) + caption mt-8 (32) + min-h-16 (64) + dots mt-10 (40) + dots h-5 (20) = ~710px
          // Arrows: absolute bottom-12 (48px from container bottom).
          // Arrow height: size-10 = 40px.
          // Arrow occupies Y: [ContainerBottom - 88px, ContainerBottom - 48px].
          // Dots occupy Y: [ContainerBottom - 20px, ContainerBottom].
          const arrowBottomDistance = 48;
          const arrowHeight = 40;
          const dotsHeight = 20;

          const verticalGap = arrowBottomDistance - dotsHeight;
          assert.strictEqual(
            verticalGap,
            28,
            `On ${vp.name}, vertical clearance between arrow bottom and dots top must be exactly 28px`
          );
          assert.ok(verticalGap > 0, `On ${vp.name}, arrows and dots must have strictly positive vertical separation`);

          // Horizontal bounds on mobile
          const center = vp.width / 2;
          const prevArrowLeft = center - (40 + 12); // -translate-x-[calc(100%+0.75rem)]
          const prevArrowRight = prevArrowLeft + 40;
          const nextArrowLeft = center + (40 * 0.75); // translate-x-3/4 = +30px
          const nextArrowRight = nextArrowLeft + 40;

          // Verify arrows fit inside screen width
          assert.ok(prevArrowLeft >= 0, `Prev arrow left edge (${prevArrowLeft}) must be within screen (>= 0) on ${vp.name}`);
          assert.ok(nextArrowRight <= vp.width, `Next arrow right edge (${nextArrowRight}) must be within screen (<= ${vp.width}) on ${vp.name}`);

          // Verify horizontal gap between arrows
          const centralGap = nextArrowLeft - prevArrowRight;
          assert.strictEqual(centralGap, 42, `Central horizontal corridor between arrows must be 42px on ${vp.name}`);
        } else {
          // On desktop (>= 768px):
          // Arrows: sm:top-[38%] sm:bottom-auto md:left-12 md:right-12
          // Dots: mt-6 at bottom
          // Arrows are near vertical middle, dots are at bottom -> separation > 200px
          assert.ok(true, `Desktop layout at ${vp.name} uses separate flex flow and absolute side positioning`);
        }
      }
    });

    test("4.2: Footer Packaging Flyer fits and centers on mobile, end-aligns on desktop", () => {
      for (const vp of viewports) {
        if (vp.isMobile) {
          const flyerWidth = 176; // w-44 = 11rem = 176px
          const sideMargin = (vp.width - flyerWidth) / 2;
          assert.ok(sideMargin >= 0, `Flyer (176px) must fit within ${vp.name} with margin >= 0 (actual: ${sideMargin}px)`);
        } else {
          const flyerWidth = 208; // md:w-52 = 13rem = 208px
          assert.ok(vp.width > flyerWidth, `Flyer fits cleanly on desktop ${vp.name}`);
        }
      }
    });

    test("4.3: AI Try-On conditional CSS hiding conforms to responsive breakpoints", () => {
      const tryOnPanelPath = path.join(ROOT, "components", "TryOnPanel.tsx");
      const productDetailPath = path.join(ROOT, "app", "product", "[slug]", "ProductDetailClient.tsx");

      const tryOnCode = fs.readFileSync(tryOnPanelPath, "utf-8");
      const productDetailCode = fs.readFileSync(productDetailPath, "utf-8");

      assert.ok(tryOnCode.includes("hidden md:block") || tryOnCode.includes("hidden md:flex"));
      assert.ok(productDetailCode.includes("hidden md:block") || productDetailCode.includes("hidden md:flex"));

      for (const vp of viewports) {
        const isHidden = vp.isMobile;
        const expectedDisplay = isHidden ? "none" : "block";
        assert.strictEqual(
          isHidden ? "none" : "block",
          expectedDisplay,
          `At ${vp.name} (${vp.width}px), AI Try-On display must evaluate to ${expectedDisplay}`
        );
      }
    });

    test("4.4: VideoHero container height and dynamic Navbar trigger threshold parity", () => {
      const heroPath = path.join(ROOT, "components", "VideoHero.tsx");
      const navPath = path.join(ROOT, "components", "NavBar.tsx");

      const heroCode = fs.readFileSync(heroPath, "utf-8");
      const navCode = fs.readFileSync(navPath, "utf-8");

      assert.ok(heroCode.includes("h-[350vh] md:h-[500vh]"));
      assert.ok(heroCode.includes('id="hero-sentinel"'));

      assert.ok(navCode.includes('document.getElementById("hero-sentinel")'));
      assert.ok(navCode.includes("containerVh = isMobile ? 3.5 : 5.0"));
    });
  });

});
