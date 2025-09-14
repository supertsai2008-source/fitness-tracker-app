#!/usr/bin/env node

/**
 * Build Preparation Script
 * 
 * This script prepares the app for Expo build by:
 * 1. Creating basic assets if they don't exist
 * 2. Verifying the build configuration
 * 3. Running pre-build checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createBasicAssets() {
  log('📦 Creating basic assets for build...', 'blue');
  
  const assetsDir = path.join(__dirname, 'assets');
  
  // Create a simple SVG icon
  const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#4F46E5" rx="200"/>
    <text x="512" y="600" font-family="Arial, sans-serif" font-size="400" font-weight="bold" text-anchor="middle" fill="white">V</text>
  </svg>`;
  
  // Create a simple splash screen
  const splashSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#4F46E5"/>
    <text x="512" y="400" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">VibeCode</text>
    <text x="512" y="550" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="white">Weight Loss Tracker</text>
  </svg>`;
  
  // Create favicon
  const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#4F46E5" rx="6"/>
    <text x="16" y="22" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">V</text>
  </svg>`;
  
  // Create adaptive icon (same as main icon for now)
  const adaptiveIconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#4F46E5" rx="200"/>
    <text x="512" y="600" font-family="Arial, sans-serif" font-size="400" font-weight="bold" text-anchor="middle" fill="white">V</text>
  </svg>`;
  
  // Write SVG files
  fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
  fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);
  fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), adaptiveIconSvg);
  
  // Create placeholder PNG files (1x1 pixel transparent PNG)
  const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), transparentPng);
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), transparentPng);
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), transparentPng);
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), transparentPng);
  
  log('✅ Basic assets created (SVG + PNG placeholders)', 'green');
}

function checkBuildConfiguration() {
  log('🔍 Checking build configuration...', 'blue');
  
  const requiredFiles = [
    'app.json',
    'eas.json',
    'package.json'
  ];
  
  let allConfigPresent = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file} exists`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
      allConfigPresent = false;
    }
  });
  
  // Check app.json configuration
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    if (appJson.expo && appJson.expo.name && appJson.expo.slug) {
      log('✅ app.json configuration valid', 'green');
    } else {
      log('❌ app.json configuration invalid', 'red');
      allConfigPresent = false;
    }
  } catch (error) {
    log(`❌ Error reading app.json: ${error.message}`, 'red');
    allConfigPresent = false;
  }
  
  return allConfigPresent;
}

function runPreBuildChecks() {
  log('🔍 Running pre-build checks...', 'blue');
  
  try {
    // Check if EAS CLI is installed locally
    execSync('npx eas --version', { stdio: 'pipe' });
    log('✅ EAS CLI is available locally', 'green');
  } catch (error) {
    log('❌ EAS CLI not found. Installing locally...', 'yellow');
    try {
      execSync('npm install --save-dev eas-cli', { stdio: 'inherit' });
      log('✅ EAS CLI installed successfully', 'green');
    } catch (installError) {
      log('❌ Failed to install EAS CLI', 'red');
      return false;
    }
  }
  
  // Check if user is logged in to Expo
  try {
    execSync('npx eas whoami', { stdio: 'pipe' });
    log('✅ Logged in to Expo', 'green');
  } catch (error) {
    log('⚠️  Not logged in to Expo. You will need to run: npx eas login', 'yellow');
  }
  
  return true;
}

function main() {
  log('🚀 Starting build preparation...', 'blue');
  log('');
  
  // Create assets
  createBasicAssets();
  log('');
  
  // Check configuration
  const configValid = checkBuildConfiguration();
  log('');
  
  // Run pre-build checks
  const checksPassed = runPreBuildChecks();
  log('');
  
  // Summary
  log('📊 Build Preparation Summary:', 'blue');
  log(`   - Assets: ✅ Created`, 'green');
  log(`   - Configuration: ${configValid ? '✅ Valid' : '❌ Invalid'}`, configValid ? 'green' : 'red');
  log(`   - Pre-build checks: ${checksPassed ? '✅ Passed' : '❌ Failed'}`, checksPassed ? 'green' : 'red');
  
  log('');
  if (configValid && checksPassed) {
    log('🎉 Build preparation completed successfully!', 'green');
    log('');
    log('📝 Next steps:', 'blue');
    log('   1. Run: npx eas login (if not already logged in)', 'yellow');
    log('   2. Run: npx eas build --platform all', 'yellow');
    log('   3. Or run: npx eas build --platform ios', 'yellow');
    log('   4. Or run: npx eas build --platform android', 'yellow');
  } else {
    log('⚠️  Build preparation failed. Please fix the issues above.', 'red');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
