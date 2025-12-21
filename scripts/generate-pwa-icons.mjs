/**
 * PWA Icon Generator
 *
 * Generates all required PWA icon sizes from a base SVG.
 * Uses sharp for high-quality PNG output.
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '../public/icons');

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Genesis medical icon SVG - Modern medical cross with gradient
const createIconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4aa"/>
      <stop offset="100%" style="stop-color:#00a8cc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)"/>

  <!-- Outer ring -->
  <circle cx="256" cy="256" r="220" fill="none" stroke="#00d4aa" stroke-width="4" opacity="0.3"/>

  <!-- Medical cross with rounded corners -->
  <g filter="url(#shadow)">
    <path d="
      M 216 120
      L 296 120
      Q 316 120 316 140
      L 316 216
      L 392 216
      Q 412 216 412 236
      L 412 276
      Q 412 296 392 296
      L 316 296
      L 316 372
      Q 316 392 296 392
      L 216 392
      Q 196 392 196 372
      L 196 296
      L 120 296
      Q 100 296 100 276
      L 100 236
      Q 100 216 120 216
      L 196 216
      L 196 140
      Q 196 120 216 120
      Z
    " fill="url(#crossGradient)"/>
  </g>

  <!-- Small decorative circles -->
  <circle cx="420" cy="92" r="12" fill="#00d4aa" opacity="0.4"/>
  <circle cx="92" cy="420" r="8" fill="#00a8cc" opacity="0.3"/>
</svg>
`;

// Apple touch icon (no transparency, white background)
const createAppleTouchIconSvg = () => `
<svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4aa"/>
      <stop offset="100%" style="stop-color:#00a8cc"/>
    </linearGradient>
  </defs>

  <!-- Solid background for Apple -->
  <rect width="512" height="512" fill="url(#bgGradient)"/>

  <!-- Medical cross -->
  <path d="
    M 216 100
    L 296 100
    Q 316 100 316 120
    L 316 216
    L 412 216
    Q 432 216 432 236
    L 432 276
    Q 432 296 412 296
    L 316 296
    L 316 392
    Q 316 412 296 412
    L 216 412
    Q 196 412 196 392
    L 196 296
    L 100 296
    Q 80 296 80 276
    L 80 236
    Q 80 216 100 216
    L 196 216
    L 196 120
    Q 196 100 216 100
    Z
  " fill="url(#crossGradient)"/>
</svg>
`;

// Favicon SVG (simpler for small sizes)
const createFaviconSvg = () => `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#bg)"/>
  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z" fill="#00d4aa"/>
</svg>
`;

/**
 * Generate all PWA icons
 */
async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // Generate standard PWA icons
  for (const size of ICON_SIZES) {
    const svgBuffer = Buffer.from(createIconSvg(size));
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`  ✓ Generated icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon
  const appleSvg = Buffer.from(createAppleTouchIconSvg());
  await sharp(appleSvg)
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(join(outputDir, '../apple-touch-icon.png'));
  console.log('  ✓ Generated apple-touch-icon.png');

  // Generate favicon
  const faviconSvg = Buffer.from(createFaviconSvg());
  await sharp(faviconSvg)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(join(outputDir, '../favicon.png'));
  console.log('  ✓ Generated favicon.png');

  // Generate favicon.ico (16x16 and 32x32)
  await sharp(faviconSvg)
    .resize(32, 32)
    .toFormat('png')
    .toFile(join(outputDir, '../favicon.ico'));
  console.log('  ✓ Generated favicon.ico');

  // Save SVG version for masked icon
  await writeFile(
    join(outputDir, '../masked-icon.svg'),
    createIconSvg(512)
  );
  console.log('  ✓ Generated masked-icon.svg');

  console.log('\n✅ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
