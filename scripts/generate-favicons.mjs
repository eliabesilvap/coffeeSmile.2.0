import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const svgPath = path.join(projectRoot, 'apps', 'web', 'public', 'brand', 'icon-favicon.svg');
const publicDir = path.join(projectRoot, 'apps', 'web', 'public');

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

function getPadding(size) {
  return Math.max(1, Math.round(size * 0.04));
}

function buildPipeline(size) {
  const padding = getPadding(size);
  const inner = Math.max(1, size - padding * 2);
  let pipeline = sharp(svgPath)
    .resize({
      width: inner,
      height: inner,
      fit: 'contain',
      background: transparent,
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: transparent,
    });

  if (size <= 64) {
    pipeline = pipeline.sharpen(0.8, 0.6, 0.3);
  }

  return pipeline;
}

async function renderPng(size, filename) {
  const outputPath = path.join(publicDir, filename);
  await buildPipeline(size).png({ compressionLevel: 9 }).toFile(outputPath);
}

async function renderBuffer(size) {
  return buildPipeline(size).png({ compressionLevel: 9 }).toBuffer();
}

async function main() {
  await fs.access(svgPath);
  await fs.mkdir(publicDir, { recursive: true });

  await Promise.all([
    renderPng(16, 'favicon-16x16.png'),
    renderPng(32, 'favicon-32x32.png'),
    renderPng(180, 'apple-touch-icon.png'),
    renderPng(192, 'android-chrome-192x192.png'),
    renderPng(512, 'android-chrome-512x512.png'),
  ]);

  const icoBuffers = await Promise.all([16, 32, 48].map((size) => renderBuffer(size)));
  const ico = await pngToIco(icoBuffers);
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), ico);

  console.log('Favicons generated in', publicDir);
}

main().catch((error) => {
  console.error('Failed to generate favicons:', error);
  process.exit(1);
});
