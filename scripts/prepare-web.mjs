import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = path.join(root, "src", "web");
const destination = path.join(root, "www");
const assets = path.join(root, "assets");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await cp(assets, path.join(destination, "assets"), { recursive: true });

console.log("Prepared shared web bundle in www/.");
