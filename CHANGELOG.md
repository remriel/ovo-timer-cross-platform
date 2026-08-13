# Changelog

## 1.0.6

- Replaced the five shortcut buttons with a compact three-by-three grid for
  1, 2, 3, 5, 10, 15, 20, 30, and 45 minutes.
- Removed the theme toggle, stored theme preference, and light-theme styles so
  the Windows and Android apps now stay in dark mode at all times.
- Removed the yellow duration orbits' directional shadow and render completed
  laps as solid masked rings, keeping them concentric, evenly spaced, and free
  of the tiny conic-gradient seam at a full lap.

## 1.0.5

- Removed Android's remaining blue tap rectangle from the square rim that owns
  the dial gesture, as well as from the circular clock face.
- Changed rim dragging to continuous two-lap movement: one full turn adds 30
  minutes, 60 minutes is a hard stop, and reversing immediately reduces time
  instead of wrapping back to the beginning.

## 1.0.4

- Replaced Android's standard timer notification with a dedicated native alarm
  path: an exact wake-up when Android permits it, a full-screen lock-screen
  alarm, looping alarm-volume audio, repeated vibration, and an explicit
  `STOP ALARM` action.
- The Android alarm channel now uses the highest available alarm priority,
  public lock-screen visibility, and requests access to exact alarms,
  full-screen alerts, and Do Not Disturb bypass in that order when needed.
- Removed the Android-only dial focus target and tap highlight so starting or
  pausing no longer leaves a blue selection box around the clock.

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
