import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outputDirectory = path.join(root, "android", "app", "src", "main", "res", "raw");
const outputFile = path.join(outputDirectory, "ovo_alarm.wav");
const sampleRate = 44_100;
const durationSeconds = 5.6;
const channelCount = 1;
const bitsPerSample = 16;
const frameCount = Math.ceil(sampleRate * durationSeconds);
const dataSize = frameCount * channelCount * (bitsPerSample / 8);
const wav = Buffer.alloc(44 + dataSize);

wav.write("RIFF", 0, "ascii");
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVE", 8, "ascii");
wav.write("fmt ", 12, "ascii");
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(channelCount, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * channelCount * (bitsPerSample / 8), 28);
wav.writeUInt16LE(channelCount * (bitsPerSample / 8), 32);
wav.writeUInt16LE(bitsPerSample, 34);
wav.write("data", 36, "ascii");
wav.writeUInt32LE(dataSize, 40);

for (let index = 0; index < frameCount; index += 1) {
  const time = index / sampleRate;
  const cycle = time % 0.34;
  const cycleIndex = Math.floor(time / 0.34);
  const active = cycle < 0.22;
  let envelope = 0;

  if (active) {
    envelope = Math.min(1, cycle / 0.012, (0.22 - cycle) / 0.018);
  }

  const frequency = cycleIndex % 3 === 1 ? 880 : 660;
  const sample = active
    ? Math.sin(2 * Math.PI * frequency * time) * envelope * 0.48
    : 0;
  wav.writeInt16LE(Math.round(sample * 32_767), 44 + index * 2);
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, wav);
console.log(`Wrote ${path.relative(root, outputFile)} (${wav.length} bytes).`);
