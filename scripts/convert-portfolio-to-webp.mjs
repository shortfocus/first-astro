/**
 * Convert all portfolio images (PNG, SVG) to WebP.
 * Run: node scripts/convert-portfolio-to-webp.mjs
 */
import sharp from "sharp";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioDir = join(__dirname, "..", "public", "portfolio");

const EXT = [".png", ".svg"];
const WEBP_QUALITY = 85;

const files = await readdir(portfolioDir);
const toConvert = files.filter((f) => EXT.some((ext) => f.toLowerCase().endsWith(ext)));

console.log(`Converting ${toConvert.length} files to WebP...`);

for (const file of toConvert) {
  const base = file.replace(/\.(png|svg)$/i, "");
  const inputPath = join(portfolioDir, file);
  const outputPath = join(portfolioDir, `${base}.webp`);
  try {
    await sharp(inputPath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);
    await unlink(inputPath);
    console.log(`  ${file} → ${base}.webp`);
  } catch (err) {
    console.error(`  FAIL ${file}:`, err.message);
  }
}

console.log("Done.");
