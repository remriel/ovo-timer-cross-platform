import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const webRoot = new URL("../src/web/", import.meta.url);
const html = readFileSync(new URL("index.html", webRoot), "utf8");
const app = readFileSync(new URL("app.js", webRoot), "utf8");
const styles = readFileSync(new URL("styles.css", webRoot), "utf8");

test("offers the exact requested quick-load durations", () => {
  const minutes = Array.from(html.matchAll(/class="preset[^"]*" data-minutes="(\d+)"/g))
    .map((match) => Number(match[1]));

  assert.deepEqual(minutes, [1, 2, 3, 5, 10, 15, 20, 30, 45]);
});

test("starts a countdown immediately after a preset is selected", () => {
  assert.match(app, /function startPresetTimer\(seconds\)/);
  assert.match(app, /return startLoadedTimer\(setTimer\(seconds\)\)/);
  assert.match(app, /void startPresetTimer\(Number\(button\.dataset\.minutes\) \* 60\)/);
  assert.match(html, /aria-label="One-tap countdown shortcuts"/);
});

test("starts a manually dragged duration whenever the pointer gesture ends", () => {
  assert.match(app, /dialGesture\.cancellation = cancelNativeAlarm\(\)/);
  assert.match(app, /void startLoadedTimer\(startRequest\)/);
  assert.match(app, /addEventListener\("pointercancel", finishDialGesture\)/);
});

test("keeps settings on a separate screen with persistent color themes", () => {
  assert.match(html, /id="settingsButton"/);
  assert.match(html, /id="settingsScreen"[^>]*hidden/);
  assert.match(html, /data-theme-option="dark"/);
  assert.match(html, /data-theme-option="light"/);
  assert.match(html, /data-theme-option="cobalt"/);
  assert.match(html, /data-theme-option="sunset"/);
  assert.match(app, /const preferencesKey = "ovo-timer-preferences-v1"/);
  assert.match(app, /function applyTheme\(nextTheme, persist = true\)/);
  assert.match(app, /function showScreen\(screen\)/);
  assert.match(styles, /html\[data-theme="light"\]/);
  assert.match(styles, /html\[data-theme="cobalt"\]/);
  assert.match(styles, /html\[data-theme="sunset"\]/);
  assert.match(styles, /color-scheme:\s*dark/);
  assert.match(styles, /color-scheme:\s*light/);
});

test("renders full duration orbits without an offset shadow or conic seam", () => {
  assert.doesNotMatch(styles, /\.selection-trace\s*\{[^}]*drop-shadow/s);
  assert.match(styles, /\.dial-rim\.is-outer-full \.selection-trace-outer/);
  assert.match(styles, /\.dial-rim\.is-inner-full \.selection-trace-inner/);
  assert.match(app, /classList\.toggle\("is-outer-full", trace\.outer >= 1\)/);
  assert.match(app, /classList\.toggle\("is-inner-full", trace\.inner >= 1\)/);
});

test("runs the subtle pipe-style wisps only while the countdown is active", () => {
  assert.match(html, /class="dial-wisp dial-wisp-one" aria-hidden="true"/);
  assert.match(html, /class="dial-wisp dial-wisp-two" aria-hidden="true"/);
  assert.match(app, /classList\.toggle\("is-running", phase === "running"\)/);
  assert.match(styles, /\.dial-rim\.is-running \.dial-wisp-one/);
  assert.match(styles, /var\(--wisp-color\) 62deg/);
  assert.match(styles, /opacity: 0\.86/);
  assert.match(styles, /drop-shadow\(0 0 7px var\(--wisp-color\)\)/);
  assert.match(styles, /@keyframes dial-wisp-orbit-one/);
  assert.match(styles, /@keyframes dial-wisp-orbit-two/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("keeps the selected screensaver behind the timer and moves it only while running", () => {
  assert.match(html, /id="screensaverLayer" class="screensaver-layer"/);
  assert.match(html, /data-screensaver="bezier"/);
  assert.match(html, /data-screensaver="flowerbox"/);
  assert.match(html, /data-screensaver="maze"/);
  assert.match(app, /function startScreensaver\(\)/);
  assert.match(app, /phase !== "running" \|\| currentScreen !== "timer"/);
  assert.match(app, /requestAnimationFrame\(renderScreensaverFrame\)/);
  assert.match(styles, /\.screensaver-layer\s*\{[^}]*z-index:\s*0/s);
  assert.match(styles, /\.app-screen\s*\{[^}]*z-index:\s*2/s);
  assert.match(styles, /\.screensaver-layer\.is-active\s*\{[^}]*opacity:/s);
});

test("keeps the dial and shortcut layout centered", () => {
  assert.match(styles, /\.timer-layout\s*\{[^}]*justify-items:\s*center/s);
  assert.match(styles, /\.dial-zone\s*\{[^}]*place-items:\s*center/s);
  assert.match(styles, /\.dial-progress\s*\{[^}]*box-shadow:\s*0 0 0 10px var\(--ink\), 0 0 0 16px var\(--pink\)/s);
  assert.match(styles, /\.preset-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, 1fr\)/s);
});
