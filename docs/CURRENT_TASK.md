# Current task

## Objective

Add a separate Settings screen to the Ovo Timer with three selectable
screensaver-style background animations and several persistent color themes.
The chosen artwork should drift behind the dial only while a countdown runs;
the timer and its drag surface must stay centered, symmetrical, and interactive.

## Implementation state

- Added production PNG artwork in `assets/` for Bezier, Flowerbox, and 3D Maze
  background modes plus the small settings gear.
- Added a pointer-free, requestAnimationFrame-driven sprite layer that bounces
  inside the app shell while `phase === "running"` and pauses on the Settings
  screen, so it never sits above the dial or captures input.
- Added a separate Settings screen with mode cards and a Dark, Light, Cobalt
  Night, and Sunset Ink palette picker. Choices persist in local storage.
- Kept the original dial wisps as a rim-only reduced-motion-safe accent, while
  replacing the dial's offset shadows with concentric rings for symmetry.
- Kept the nine quick-load presets, automatic preset/manual-drag start, alarm,
  Android focus suppression, and two-lap 60-minute hard stop behavior intact.

## Verification

- UI contract tests cover preset durations, auto-start behavior, separate
  settings navigation, theme options, background layering, and centered dial
  layout. Run `npm run check` after the final source sync.
- Run the browser smoke flow at desktop and mobile sizes: open Settings,
  switch each screensaver and theme, return to the timer, tap a preset, and
  confirm the sprite is visible behind the dial only while running.
- `npm run check`: 16 tests passed.
- Shared bundle was synced into the native Android WebView with
  `npm run android:sync` and the generated PNGs are present in
  `android/app/src/main/assets/public/assets/`.
- `npm run android:apk` completed with JDK 21 after the machine's default Java
  8/17 runtimes were rejected by the Gradle source target. No Android emulator
  was available in this environment for an on-device screenshot pass.
- `npm run build:windows` completed and produced the 1.0.9 installer and
  portable executable.

## Release state

- `v1.0.8` is the last published GitHub release and Drive upload.
- The current source is the pending `v1.0.9` release with Settings, themes,
  background modes, and centered dial geometry.
- Local artifacts are copied to the workspace `outputs/` folder:
  `OvoTimer-Android-1.0.9-debug.apk`, `OvoTimer-Setup-1.0.9-x64.exe`,
  `OvoTimer-Portable-1.0.9-x64.exe`, and `SHA256SUMS-1.0.9.txt`.

## Next steps

1. Run the contract suite and browser smoke checks after `npm run prepare:web`.
2. Build Android and Windows artifacts once from the 1.0.9 source, verify
   package metadata and SHA-256 hashes, publish the GitHub release, and upload
   the new APK to Google Drive.
3. Record final artifact links, Drive file ID, tests, and any build caveats
   here before handoff.
