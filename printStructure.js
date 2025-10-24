// printStructure.js
// Prints folder structure (excluding node_modules) but includes key top-level files
// Diwai 2025 — for ZRP Thadam

const fs = require("fs");
const path = require("path");

const excluded = ["node_modules", ".git", ".cache", "build", "dist"];

function printTree(dir, prefix = "") {
  const items = fs.readdirSync(dir);

  // Filter out unwanted folders
  const filtered = items.filter((item) => {
    const fullPath = path.join(dir, item);
    const isDir = fs.lstatSync(fullPath).isDirectory();
    return (
      !excluded.includes(item) &&
      (isDir ||
        [
          "App.js",
          "index.js",
          "package.json",
          "truffle-config.js",
          "README.md",
        ].includes(item))
    );
  });

  for (const item of filtered) {
    const fullPath = path.join(dir, item);
    const isDir = fs.lstatSync(fullPath).isDirectory();

    console.log(`${prefix}${isDir ? "📁" : "📄"} ${item}`);

    if (isDir) {
      printTree(fullPath, prefix + "   ");
    }
  }
}

console.log("🧱 Project Structure:");
printTree(process.cwd());
