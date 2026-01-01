// Simple script to convert SVG logo to PNG files
// Run with: node convert-logo.js
// Note: This requires sharp package - install with: npm install --save-dev sharp

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not found. Installing...');
  console.log('Please run: npm install --save-dev sharp');
  console.log('Or use an online tool like: https://svgtopng.com/ or https://convertio.co/svg-png/');
  console.log('\nTo convert manually:');
  console.log('1. Open public/logo.svg in a browser');
  console.log('2. Use browser DevTools to take a screenshot');
  console.log('3. Or use an online SVG to PNG converter');
  console.log('4. Save as logo192.png (192x192) and logo512.png (512x512)');
  process.exit(1);
}

async function convertLogo() {
  const svgPath = path.join(__dirname, 'public', 'logo.svg');
  const output192 = path.join(__dirname, 'public', 'logo192.png');
  const output512 = path.join(__dirname, 'public', 'logo512.png');

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
    console.log('Created logo192.png');

    // Convert to 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(output512);
    console.log('Created logo512.png');

    // Create favicon.ico (16x16, 32x32, 48x48)
    const favicon16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
    const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    const favicon48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
    
    // Note: Creating .ico requires additional library
    // For now, we'll use the 32x32 PNG as favicon
    fs.writeFileSync(path.join(__dirname, 'public', 'favicon-32.png'), favicon32);
    console.log('Created favicon-32.png (use this as favicon.ico)');
    console.log('\nNote: To create favicon.ico, use an online tool like: https://favicon.io/favicon-converter/');
    
  } catch (error) {
    console.error('Error converting logo:', error);
    process.exit(1);
  }
}

convertLogo();

