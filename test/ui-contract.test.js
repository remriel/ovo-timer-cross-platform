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

test("keeps the application permanently dark", () => {
  assert.doesNotMatch(html, /themeToggle|Switch to light mode/);
  assert.doesNotMatch(app, /themeStorageKey|restoreTheme|toggleTheme|applyTheme/);
  assert.doesNotMatch(styles, /data-theme=["']light["']|color-scheme:\s*light/);
  assert.match(styles, /color-scheme:\s*dark/);
});

test("renders full duration orbits without an offset shadow or conic seam", () => {
  assert.doesNotMatch(styles, /\.selection-trace\s*\{[^}]*drop-shadow/s);
  assert.match(styles, /\.dial-rim\.is-outer-full \.selection-trace-outer/);
  assert.match(styles, /\.dial-rim\.is-inner-full \.selection-trace-inner/);
  assert.match(app, /classList\.toggle\("is-outer-full", trace\.outer >= 1\)/);
  assert.match(app, /classList\.toggle\("is-inner-full", trace\.inner >= 1\)/);
});
