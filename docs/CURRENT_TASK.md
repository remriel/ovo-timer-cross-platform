# Current task

## Objective

Add a subtle, colorful orbit animation around the running Ovo Timer dial with
the feel of the classic Windows pipe screensaver.

## Implementation state

- Added two decorative `dial-wisp` rings with short gradient segments and
  squared moving caps in `src/web/index.html` and `src/web/styles.css`.
- `src/web/app.js` toggles `dial-rim.is-running` from the existing timer phase,
  so the effect is visible only during `TIME LEFT`.
- The layer is `aria-hidden`, pointer-free, outside the clock face, and has a
  still reduced-motion fallback.
- Added a UI contract test for the two wisps, running-state hook, keyframes, and
  reduced-motion rule.

## Verification

- `npm run check`: 14 tests passed.
- Browser smoke test at desktop and 640x1280 mobile sizes confirmed the
  running state enables both animations and the idle/finished states hide them.
- Temporary browser captures were written to `output/playwright/` and should
  not be committed.

## Release state

- Android debug APK built with the installed Java 21 runtime; package metadata
  is `com.remriel.ovotimer`, version code `8`, version name `1.0.8`, target SDK
  `35`, and APK v1/v2 signature verification passed.
- Windows x64 NSIS installer and portable executable built successfully.
- Checksums are recorded in the sibling `outputs/SHA256SUMS-1.0.8.txt` file.
- GitHub `v1.0.8` is published from commit `83e0db3`.
- The APK was uploaded to Google Drive as file ID
  `1XuvIkMfa0JB6R-tTe9yZ17-KDf0D8-V2`; Drive reports it as owner-only.
