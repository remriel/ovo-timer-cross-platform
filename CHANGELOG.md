# Changelog

## 1.0.3

- Added a separate two-lap duration trace around the original circular dial:
  30 minutes fills one orbit and 60 minutes fills both.
- The duration trace follows the chosen time before starting, then visibly
  empties while running or paused so it always reflects time remaining.
- Added a compact, persistent dark/light view toggle while keeping dark mode
  as the initial view.

## 1.0.2

- Increased every visible timer, caption, shortcut, and unit label by 30% for
  easier reading at a glance.

## 1.0.1

- Android now schedules a native alarm notification that can fire while the
  app is backgrounded or the screen is locked.
- Added a 5.6-second repeating alarm sound for Android and extended the
  foreground Web Audio alarm to run for more than five seconds.
- Removed the Android WebView frame and native button focus artifact so the
  dial stays clean and edge-to-edge in dark mode.
- Thickened the colored band and added an invisible outer touch cushion so
  dragging is easier to start accurately on a phone.

## 1.0.0

- First independent cross-platform release of Ovo Timer for Windows and Android.
- Centered, dark-only neo-brutalist countdown clock with the visible progress
  band as the direct time-setting gesture.
- Tap the clock face to start or pause; releasing a band drag starts the new
  countdown. Includes 1, 5, 15, 25, and 45 minute quick shortcuts.
- The clock band begins at the selected position and empties against the
  60-minute dial as time runs out, including while paused.
- Includes a Windows x64 installer, a portable Windows x64 EXE, and an
  installable Android debug APK.

## Package notes

- The Windows executables are not code-signed.
- The Android APK is debug-signed for direct installation; publishing to the
  Play Store would require a release signing key.
