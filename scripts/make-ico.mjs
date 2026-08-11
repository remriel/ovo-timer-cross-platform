import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const png = path.join(root, "assets", "ovo-icon.png");
const ico = path.join(root, "assets", "ovo-icon.ico");

const bytes = await pngToIco(png);
await writeFile(ico, bytes);
console.log("Created Windows icon asset.");
