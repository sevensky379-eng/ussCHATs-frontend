// Simple script to convert SVG logo to PNG files
// Run with: node convert-logo.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertLogo() {
  const svgPath = path.join(__dirname, 'public', 'logo.svg');
  const output192 = path.join(__dirname, 'public', 'logo192.png');
  const output512 = path.join(__dirname, 'public', 'logo512.png');
  const outputFavicon = path.join(__dirname, 'public', 'favicon-32.png');

  if (!fs.existsSync(svgPath)) {
    console.error('SVG file not found at:', svgPath);
    process.exit(1);
  }

  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert to 192x192 PNG
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(output192);
    console.log('✓ Created logo192.png');

    // Convert to 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(output512);
    console.log('✓ Created logo512.png');

    // Create 32x32 PNG for favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(outputFavicon);
    console.log('✓ Created favicon-32.png');
    
    console.log('\nNote: To create favicon.ico, copy favicon-32.png and rename it,');
    console.log('or use an online tool like: https://favicon.io/favicon-converter/');
    
  } catch (error) {
    console.error('Error converting logo:', error);
    process.exit(1);
  }
}

convertLogo();

