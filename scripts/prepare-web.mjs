import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = path.join(root, "src", "web");
const destination = path.join(root, "www");
const assets = path.join(root, "assets");
const vendor = path.join(destination, "vendor");
const capacitorCore = path.join(root, "node_modules", "@capacitor", "core", "dist", "capacitor.js");
const localNotifications = path.join(root, "node_modules", "@capacitor", "local-notifications", "dist", "plugin.js");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await cp(assets, path.join(destination, "assets"), { recursive: true });
await mkdir(vendor, { recursive: true });
await cp(capacitorCore, path.join(vendor, "capacitor.js"));
await cp(localNotifications, path.join(vendor, "local-notifications.js"));

console.log("Prepared shared web bundle in www/.");
