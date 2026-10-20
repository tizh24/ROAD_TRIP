import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = path.join(projectRoot, ".next");
const standaloneRoot = path.join(buildRoot, "standalone");

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

if (!(await pathExists(standaloneRoot))) {
  console.log("No standalone output found; skipping standalone asset preparation.");
  process.exit(0);
}

const assets = [
  [path.join(buildRoot, "static"), path.join(standaloneRoot, ".next", "static")],
  [path.join(projectRoot, "public"), path.join(standaloneRoot, "public")],
];

for (const [source, destination] of assets) {
  if (!(await pathExists(source))) continue;
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

console.log("Prepared static and public assets for the standalone server.");
