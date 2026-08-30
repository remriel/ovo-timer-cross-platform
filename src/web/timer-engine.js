export const MAX_SECONDS = 60 * 60;
export const MIN_SECONDS = 10;
export const DIAL_REVOLUTION_SECONDS = 30 * 60;
const INCOMPLETE_LAP_MAX = 359 / 360;

export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function normalizeSeconds(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(clamp(value, 0, MAX_SECONDS));
}

export function secondsForAngle(degrees) {
  const normalized = ((degrees % 360) + 360) % 360;
  const seconds = Math.round((normalized / 360) * MAX_SECONDS);
  return clamp(seconds === 0 ? MAX_SECONDS : seconds, MIN_SECONDS, MAX_SECONDS);
}

export function shortestAngleDelta(previousDegrees, currentDegrees) {
  if (!Number.isFinite(previousDegrees) || !Number.isFinite(currentDegrees)) {
    return 0;
  }

  return ((currentDegrees - previousDegrees + 540) % 360) - 180;
}

export function secondsAfterDialRotation(seconds, deltaDegrees) {
  if (!Number.isFinite(seconds) || !Number.isFinite(deltaDegrees)) {
    return clamp(normalizeSeconds(seconds), MIN_SECONDS, MAX_SECONDS);
  }

  const secondsPerDegree = DIAL_REVOLUTION_SECONDS / 360;
  return clamp(seconds + deltaDegrees * secondsPerDegree, MIN_SECONDS, MAX_SECONDS);
}

export function formatClock(seconds) {
  const total = normalizeSeconds(seconds);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

export function remainingFromEndTime(endTime, now = Date.now()) {
  if (!Number.isFinite(endTime)) {
    return 0;
  }

  return Math.max(0, Math.ceil((endTime - now) / 1000));
}

export function timerProgress(totalSeconds, remainingSeconds, showRemaining) {
  if (totalSeconds <= 0) {
    return 0;
  }

  const renderedSeconds = showRemaining ? remainingSeconds : totalSeconds;
  return clamp(renderedSeconds / MAX_SECONDS, 0, 1);
}

export function doubleLapProgress(seconds) {
  const normalized = normalizeSeconds(seconds);
  const firstLap = normalized / DIAL_REVOLUTION_SECONDS;
  const secondLap = (normalized - DIAL_REVOLUTION_SECONDS) / DIAL_REVOLUTION_SECONDS;

  return {
    outer: normalized >= DIAL_REVOLUTION_SECONDS
      ? 1
      : Math.min(clamp(firstLap, 0, 1), INCOMPLETE_LAP_MAX),
    inner: normalized >= MAX_SECONDS
      ? 1
      : Math.min(clamp(secondLap, 0, 1), INCOMPLETE_LAP_MAX)
  };
}
