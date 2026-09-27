#!/usr/bin/env node
/**
 * Master E2E Test Suite Runner
 */
import { spawn } from "node:child_process";
import process from "node:process";

const TEST_FILES = [
  "tests/e2e/r1-video-performance.test.mjs",
  "tests/e2e/r2-image-optimization.test.mjs",
  "tests/e2e/r3-mobile-polish.test.mjs",
  "tests/e2e/r4-carousel-layout.test.mjs",
  "tests/e2e/tier2-boundaries.test.mjs",
  "tests/e2e/tier3-cross-feature.test.mjs",
  "tests/e2e/tier4-simulation.test.mjs",
];

const child = spawn(process.execPath, ["--test", ...TEST_FILES], {
  cwd: process.cwd(),
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 1);
});
