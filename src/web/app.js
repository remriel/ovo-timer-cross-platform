import {
  MAX_SECONDS,
  MIN_SECONDS,
  clamp,
  formatClock,
  normalizeSeconds,
  remainingFromEndTime,
  secondsForAngle,
  timerProgress
} from "./timer-engine.js";

const storageKey = "ovo-timer-state-v1";
const gestureThreshold = 6;
const refs = {
  dial: document.querySelector("#timerDial"),
  dialRim: document.querySelector("#dialRim"),
  dialFace: document.querySelector(".dial-face"),
  timerValue: document.querySelector("#timerValue"),
  timerCaption: document.querySelector("#timerCaption"),
  liveStatus: document.querySelector("#liveStatus"),
  presetButtons: Array.from(document.querySelectorAll(".preset"))
};

let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let endTime = 0;
let intervalId = 0;
let phase = "idle";
let dialGesture = null;

function saveState() {
  const snapshot = {
    totalSeconds,
    remainingSeconds,
    endTime,
    phase
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    // The timer remains fully usable when storage is unavailable.
  }
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!saved) {
      return;
    }

    totalSeconds = normalizeSeconds(saved.totalSeconds) || totalSeconds;
    remainingSeconds = normalizeSeconds(saved.remainingSeconds);

    if (saved.phase === "running" && Number.isFinite(saved.endTime)) {
      endTime = saved.endTime;
      remainingSeconds = remainingFromEndTime(endTime);
      if (remainingSeconds > 0) {
        phase = "running";
        startInterval();
      } else {
        phase = "finished";
      }
    } else if (saved.phase === "paused" && remainingSeconds > 0) {
      phase = "paused";
    }
  } catch {
    // A corrupt prior snapshot should never prevent the timer from opening.
  }
}

function getStatusCopy() {
  if (phase === "running") {
    return {
      caption: "TIME LEFT",
      live: formatClock(remainingSeconds) + " remaining."
    };
  }

  if (phase === "paused") {
    return {
      caption: "ON HOLD",
      live: "Paused with " + formatClock(remainingSeconds) + " remaining."
    };
  }

  if (phase === "finished") {
    return {
      caption: "TIME UP",
      live: "Time is up."
    };
  }

  return {
    caption: "ON THE DIAL",
    live: formatClock(totalSeconds) + " is loaded."
  };
}

function setWindowTitle() {
  const title = phase === "running"
    ? formatClock(remainingSeconds) + " - Ovo Timer"
    : "Ovo Timer";
  document.title = title;
  window.ovoBridge?.setWindowTitle?.(title);
}

function render() {
  const activeSeconds = phase === "finished" ? 0 : remainingSeconds;
  const progress = timerProgress(totalSeconds, activeSeconds, phase !== "idle");
  const copy = getStatusCopy();

  refs.dial.style.setProperty("--progress", progress + "turn");
  refs.dial.dataset.phase = phase;
  refs.timerValue.textContent = formatClock(activeSeconds);
  refs.timerCaption.textContent = copy.caption;
  refs.liveStatus.textContent = copy.live;
  refs.dial.setAttribute("aria-valuenow", String(totalSeconds));
  refs.dial.setAttribute("aria-valuetext", formatClock(activeSeconds) + (phase === "running" ? " remaining" : " selected"));
  setWindowTitle();
}

function clearIntervalTimer() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = 0;
  }
}

function startInterval() {
  clearIntervalTimer();
  intervalId = window.setInterval(tick, 200);
}

function requestNotificationPermission() {
  if (window.ovoBridge || typeof Notification === "undefined") {
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => undefined);
  }
}

function startTimer() {
  if (totalSeconds < MIN_SECONDS) {
    totalSeconds = MIN_SECONDS;
    remainingSeconds = MIN_SECONDS;
  }

  if (phase === "finished" || remainingSeconds <= 0) {
    remainingSeconds = totalSeconds;
  }

  if (phase === "running") {
    return;
  }

  phase = "running";
  endTime = Date.now() + remainingSeconds * 1000;
  requestNotificationPermission();
  startInterval();
  saveState();
  tick();
}

function pauseTimer() {
  if (phase !== "running") {
    return;
  }

  remainingSeconds = remainingFromEndTime(endTime);
  clearIntervalTimer();
  endTime = 0;
  phase = remainingSeconds > 0 ? "paused" : "finished";
  saveState();
  render();
}

function resetTimer() {
  clearIntervalTimer();
  endTime = 0;
  remainingSeconds = totalSeconds;
  phase = "idle";
  saveState();
  render();
}

function setTimer(seconds) {
  const safeSeconds = clamp(normalizeSeconds(seconds), MIN_SECONDS, MAX_SECONDS);
  clearIntervalTimer();
  totalSeconds = safeSeconds;
  remainingSeconds = safeSeconds;
  endTime = 0;
  phase = "idle";
  saveState();
  render();
}

function toggleTimer() {
  if (phase === "running") {
    pauseTimer();
    return;
  }

  startTimer();
}

function ringAlarm() {
  try {
    const AudioApi = window.AudioContext || window.webkitAudioContext;
    if (!AudioApi) {
      return;
    }

    const context = new AudioApi();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.connect(context.destination);

    [0, 0.23, 0.46].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(index === 1 ? 880 : 660, context.currentTime + offset);
      oscillator.connect(gain);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.17);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + 0.19);
    });

    window.setTimeout(() => context.close(), 900);
  } catch {
    // Audio is a nice-to-have, and the visual/native notification still lands.
  }
}

async function notifyFinished() {
  const details = {
    title: "Ovo Timer",
    body: "Time is up. Your countdown is complete."
  };

  try {
    if (window.ovoBridge?.notify) {
      await window.ovoBridge.notify(details);
      return;
    }

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(details.title, { body: details.body });
    }
  } catch {
    // Notification permissions are controlled by the host operating system.
  }
}

function finishTimer() {
  clearIntervalTimer();
  remainingSeconds = 0;
  endTime = 0;
  phase = "finished";
  saveState();
  render();
  ringAlarm();
  notifyFinished();
}

function tick() {
  if (phase !== "running") {
    return;
  }

  remainingSeconds = remainingFromEndTime(endTime);
  if (remainingSeconds <= 0) {
    finishTimer();
    return;
  }

  render();
}

function movementExceedsThreshold(gesture, event) {
  return Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) >= gestureThreshold;
}

function dialPosition(event) {
  const dialRect = refs.dial.getBoundingClientRect();
  const faceRect = refs.dialFace.getBoundingClientRect();
  const centerX = dialRect.left + dialRect.width / 2;
  const centerY = dialRect.top + dialRect.height / 2;
  const x = event.clientX - centerX;
  const y = event.clientY - centerY;
  const distance = Math.hypot(x, y);
  const dialRadius = Math.min(dialRect.width, dialRect.height) / 2;
  const faceRadius = Math.min(faceRect.width, faceRect.height) / 2;

  return {
    onClockFace: distance <= faceRadius + 1,
    onProgressBand: distance > faceRadius + 1 && distance <= dialRadius + 1,
    degrees: Math.atan2(x, -y) * (180 / Math.PI)
  };
}

function handleDialPointerDown(event) {
  cancelDialGesture();
  const position = dialPosition(event);

  if (position.onClockFace) {
    event.preventDefault();
    refs.dial.focus({ preventScroll: true });
    toggleTimer();
    return;
  }

  if (!position.onProgressBand) {
    return;
  }

  event.preventDefault();
  dialGesture = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    changedTime: false
  };
  refs.dialRim.setPointerCapture?.(event.pointerId);
}

function handleDialPointerMove(event) {
  if (!dialGesture || dialGesture.pointerId !== event.pointerId) {
    return;
  }

  if (!dialGesture.changedTime && !movementExceedsThreshold(dialGesture, event)) {
    return;
  }

  dialGesture.changedTime = true;
  refs.dialRim.classList.add("is-dragging");
  setTimer(secondsForAngle(dialPosition(event).degrees));
}

function cancelDialGesture() {
  if (!dialGesture) {
    return;
  }

  const pointerId = dialGesture.pointerId;
  dialGesture = null;
  refs.dialRim.classList.remove("is-dragging");
  if (refs.dialRim.hasPointerCapture?.(pointerId)) {
    refs.dialRim.releasePointerCapture(pointerId);
  }
}

function finishDialGesture(event, cancelled = false) {
  if (!dialGesture || dialGesture.pointerId !== event.pointerId) {
    return;
  }

  const changedTime = dialGesture.changedTime;
  cancelDialGesture();

  if (!cancelled && changedTime) {
    startTimer();
  }
}

function handleDialKeyboard(event) {
  const largeStep = event.shiftKey ? 5 * 60 : 60;
  let handled = true;

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    setTimer(totalSeconds + largeStep);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    setTimer(totalSeconds - largeStep);
  } else if (event.key === "PageUp") {
    setTimer(totalSeconds + 10 * 60);
  } else if (event.key === "PageDown") {
    setTimer(totalSeconds - 10 * 60);
  } else if (event.key === "Enter" || event.key === " ") {
    toggleTimer();
  } else {
    handled = false;
  }

  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
}

refs.presetButtons.forEach((button) => {
  button.addEventListener("pointerdown", cancelDialGesture);
  button.addEventListener("click", () => {
    setTimer(Number(button.dataset.minutes) * 60);
  });
});

refs.dialRim.addEventListener("pointerdown", handleDialPointerDown);
refs.dialRim.addEventListener("pointermove", handleDialPointerMove);
refs.dialRim.addEventListener("pointerup", finishDialGesture);
refs.dialRim.addEventListener("pointercancel", (event) => finishDialGesture(event, true));
refs.dialRim.addEventListener("lostpointercapture", cancelDialGesture);
refs.dial.addEventListener("keydown", handleDialKeyboard);

window.addEventListener("blur", cancelDialGesture);

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  if (event.defaultPrevented || editing || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    toggleTimer();
  } else if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    resetTimer();
  }
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    tick();
  }
});

restoreState();
render();
