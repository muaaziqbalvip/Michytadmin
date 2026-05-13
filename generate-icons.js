#!/usr/bin/env node
// MICH YT PROJECT - Generate placeholder PWA icons
// Run: node generate-icons.js
// Requires: npm install canvas (optional - or use manual method below)

const fs = require('fs');
const path = require('path');

// If you have canvas installed:
// const { createCanvas } = require('canvas');
// Otherwise use an online tool or Canva to generate icons

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'assets', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('='.repeat(50));
console.log('MICH YT PROJECT - Icon Generator');
console.log('='.repeat(50));
console.log('\nRequired icon sizes:');
sizes.forEach(s => console.log(`  - icon-${s}.png (${s}x${s}px)`));
console.log('\nTo generate icons:');
console.log('1. Use your logo from: https://i.ibb.co/d0xwVb2b/...');
console.log('2. Go to: https://realfavicongenerator.net');
console.log('3. Upload logo → Download package → Extract to /assets/icons/');
console.log('\nOr use Canva:');
console.log('1. Create 512x512 design with your logo');
console.log('2. Export as PNG');
console.log('3. Resize to all required sizes');
console.log('\nIcon files should be placed in: assets/icons/');

// Create a minimal SVG placeholder if needed
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0a"/>
  <rect x="10" y="10" width="492" height="492" rx="80" fill="#e50914"/>
  <text x="256" y="280" font-family="Arial Black" font-size="120" font-weight="900" text-anchor="middle" fill="white">M</text>
  <text x="256" y="370" font-family="Arial" font-size="40" text-anchor="middle" fill="white">YT</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('\n✅ Created placeholder SVG icon at assets/icons/icon.svg');
console.log('   Convert this SVG to PNG files in the required sizes.');
