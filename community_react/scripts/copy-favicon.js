const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src", "assets", "favicon", "Favicon.png");
const destDir = path.join(root, "public", "assets");
const dest = path.join(destDir, "Favicon.png");

if (!fs.existsSync(src)) {
  console.warn("copy-favicon: src/assets/favicon/Favicon.png not found, skip.");
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
fs.copyFileSync(src, dest);
console.log("copy-favicon: Favicon.png copied to public/assets/");
