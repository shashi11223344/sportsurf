// One-off: compress already-uploaded images in public/uploads in place.
// Keeps filenames identical (DB imageUrl values still resolve) and skips
// videos/small files. Run with: node scripts/compress_existing_uploads.cjs
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const uploadDir = path.join(__dirname, "..", "public", "uploads");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MIN_SIZE_TO_COMPRESS = 150 * 1024; // skip files already small

async function main() {
  const files = fs.readdirSync(uploadDir);
  let before = 0;
  let after = 0;
  let touched = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    const fullPath = path.join(uploadDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.size < MIN_SIZE_TO_COMPRESS) continue;

    const original = fs.readFileSync(fullPath);
    try {
      const resized = sharp(original).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true });
      const compressed = ext === ".png"
        ? await resized.png({ quality: 80, compressionLevel: 9 }).toBuffer()
        : await resized.jpeg({ quality: 80 }).toBuffer();

      if (compressed.length < original.length) {
        fs.writeFileSync(fullPath, compressed);
        before += original.length;
        after += compressed.length;
        touched++;
        console.log(`${file}: ${(original.length / 1024 / 1024).toFixed(2)}MB -> ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
      }
    } catch (err) {
      console.error(`Skipping ${file}:`, err.message);
    }
  }

  console.log(`\nCompressed ${touched} files. Total: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`);
}

main();
