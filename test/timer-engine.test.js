import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_SECONDS,
  doubleLapProgress,
  formatClock,
  normalizeSeconds,
  remainingFromEndTime,
  secondsForAngle,
  timerProgress
} from "../src/web/timer-engine.js";

test("formats a countdown as fixed-width minutes and seconds", () => {
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(65), "01:05");
  assert.equal(formatClock(MAX_SECONDS), "60:00");
});

test("normalizes timer values to the supported range", () => {
  assert.equal(normalizeSeconds(-10), 0);
  assert.equal(normalizeSeconds(3670), MAX_SECONDS);
  assert.equal(normalizeSeconds(30.6), 31);
});

test("maps dial positions to a 10-second through 60-minute range", () => {
  assert.equal(secondsForAngle(0), MAX_SECONDS);
  assert.equal(secondsForAngle(180), 1800);
  assert.equal(secondsForAngle(-90), 2700);
  assert.equal(secondsForAngle(1), 10);
});

test("calculates remaining seconds from a stable end timestamp", () => {
  assert.equal(remainingFromEndTime(10_500, 10_000), 1);
  assert.equal(remainingFromEndTime(10_000, 10_000), 0);
  assert.equal(remainingFromEndTime(9_999, 10_000), 0);
});

test("keeps the ring relative to the 60-minute dial while counting down", () => {
  assert.equal(timerProgress(1800, 1800, false), 0.5);
  assert.equal(timerProgress(1800, 900, true), 0.25);
  assert.equal(timerProgress(0, 0, false), 0);
});

test("maps time onto two thirty-minute duration laps", () => {
  assert.deepEqual(doubleLapProgress(0), { outer: 0, inner: 0 });
  assert.deepEqual(doubleLapProgress(15 * 60), { outer: 0.5, inner: 0 });
  assert.deepEqual(doubleLapProgress(30 * 60), { outer: 1, inner: 0 });
  assert.deepEqual(doubleLapProgress(45 * 60), { outer: 1, inner: 0.5 });
  assert.deepEqual(doubleLapProgress(MAX_SECONDS), { outer: 1, inner: 1 });
});
