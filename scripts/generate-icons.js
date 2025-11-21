const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '..', 'public', 'logos', 'logo-oro-nacional.png');
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Icon sizes for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Apple touch icon size
const APPLE_ICON_SIZE = 180;

async function generateIcons() {
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  console.log('Starting icon generation...\n');

  // Generate PWA icons
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    try {
      await sharp(LOGO_PATH)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error.message);
    }
  }

  // Generate Apple Touch Icon
  const appleIconPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
  try {
    await sharp(LOGO_PATH)
      .resize(APPLE_ICON_SIZE, APPLE_ICON_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appleIconPath);

    console.log(`✓ Generated: apple-touch-icon.png`);
  } catch (error) {
    console.error('✗ Failed to generate apple-touch-icon.png:', error.message);
  }

  // Generate Favicon (multi-size ICO)
  const faviconSizes = [16, 32, 48];
  const faviconPath = path.join(PUBLIC_DIR, 'favicon.ico');

  try {
    // Generate 32x32 as the main favicon (ICO format can be tricky, so we'll use PNG)
    await sharp(LOGO_PATH)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));

    console.log(`✓ Generated: favicon.png (Note: You may want to convert to .ico manually)`);
  } catch (error) {
    console.error('✗ Failed to generate favicon:', error.message);
  }

  // Copy logo as SVG icon if it exists
  const logoSvgPath = path.join(__dirname, '..', 'public', 'logos', 'logo-oro-nacional.svg');
  const iconSvgPath = path.join(PUBLIC_DIR, 'icon.svg');

  if (fs.existsSync(logoSvgPath)) {
    try {
      fs.copyFileSync(logoSvgPath, iconSvgPath);
      console.log(`✓ Copied: icon.svg`);
    } catch (error) {
      console.error('✗ Failed to copy SVG icon:', error.message);
    }
  } else {
    console.log('ℹ No SVG logo found - skipping icon.svg');
  }

  console.log('\n✅ Icon generation complete!');
  console.log('\nGenerated files:');
  console.log('  - /public/icons/icon-[size].png (8 sizes)');
  console.log('  - /public/apple-touch-icon.png');
  console.log('  - /public/favicon.png');
  console.log('\nNote: The favicon is in PNG format. You may want to convert it to .ico format');
  console.log('      using an online tool like https://www.icoconverter.com/');
}

generateIcons().catch(console.error);
