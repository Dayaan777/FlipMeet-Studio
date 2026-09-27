#!/usr/bin/env node
/**
 * FlipMeet Studio Storefront Automated Verification Runner
 * Runs the comprehensive 4-Tier test suite:
 * - Tier 1: Feature Coverage (R1, R2, R3, R4)
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions & Architectural Contracts
 * - Tier 4: Real-World Scenarios & Simulations
 */

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const TEST_FILES = [
  "tests/e2e/r1-video-performance.test.mjs",
  "tests/e2e/r2-image-optimization.test.mjs",
  "tests/e2e/r3-mobile-polish.test.mjs",
  "tests/e2e/r4-carousel-layout.test.mjs",
  "tests/e2e/tier2-boundaries.test.mjs",
  "tests/e2e/tier3-cross-feature.test.mjs",
  "tests/e2e/tier4-simulation.test.mjs",
];

console.log("==================================================================");
console.log("  FLIPMEET STUDIO — STOREFRONT AUTOMATED TEST SUITE");
console.log("  Verifying Requirements R1, R2, R3, R4 across 4 Tiers");
console.log("==================================================================\n");

const startTime = Date.now();
const child = spawn(process.execPath, ["--test", ...TEST_FILES], {
  cwd: ROOT,
  stdio: "inherit",
  shell: false,
});

child.on("close", (code) => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n==================================================================");
  if (code === 0) {
    console.log(`  RESULT: ALL TESTS PASSED (100% SUCCESS) in ${elapsed}s`);
    console.log("  All Acceptance Criteria (R1, R2, R3, R4) verified.");
  } else {
    console.log(`  RESULT: TEST SUITE FAILED with exit code ${code} in ${elapsed}s`);
    console.log("  Review test failures above for non-compliant implementations.");
  }
  console.log("==================================================================\n");
  process.exit(code ?? 1);
});
