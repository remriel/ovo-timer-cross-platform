import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const resources = path.join(root, "resources");
const assets = path.join(root, "assets");

await mkdir(resources, { recursive: true });
await cp(path.join(root, "assets", "ovo-icon.png"), path.join(resources, "icon.png"));
await cp(path.join(root, "assets", "ovo-backdrop.png"), path.join(resources, "splash.png"));
await cp(path.join(root, "assets", "ovo-icon.png"), path.join(assets, "icon.png"));

console.log("Prepared the Capacitor source icon and local resource copies.");
