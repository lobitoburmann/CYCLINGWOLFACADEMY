import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");

const files = [
  "index.html",
  "wolfseries.html",
  "styles.css",
  "adaptaciones.html",
  "curso.html",
  "nutricion.html",
];

const directories = ["js", "images"];

function removeIfPresent(target) {
  if (!existsSync(target)) return;

  if (lstatSync(target).isSymbolicLink()) {
    rmSync(target);
    return;
  }

  rmSync(target, { recursive: true, force: true });
}

mkdirSync(publicDir, { recursive: true });

for (const file of files) {
  const source = join(root, file);
  const destination = join(publicDir, file);
  removeIfPresent(destination);
  cpSync(source, destination);
}

for (const directory of directories) {
  const source = join(root, directory);
  const destination = join(publicDir, directory);
  removeIfPresent(destination);
  cpSync(source, destination, { recursive: true });
}

console.log("Static assets copied to public/");
