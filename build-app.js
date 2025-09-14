#!/usr/bin/env node

/**
 * Build App Script
 * 
 * This script builds the Expo app using EAS Build
 */

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

function buildApp(platform = 'all') {
  log(`🚀 Starting build for platform: ${platform}`, 'blue');
  log('');
  
  try {
    const command = `npx eas build --platform ${platform}`;
    log(`Running: ${command}`, 'yellow');
    log('');
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    log('');
    log('🎉 Build completed successfully!', 'green');
    log('Check your Expo dashboard for the build status and download links.', 'blue');
    
  } catch (error) {
    log('');
    log('❌ Build failed!', 'red');
    log('Error details:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'all';
  
  // Validate platform
  const validPlatforms = ['all', 'ios', 'android'];
  if (!validPlatforms.includes(platform)) {
    log(`❌ Invalid platform: ${platform}`, 'red');
    log(`Valid platforms: ${validPlatforms.join(', ')}`, 'yellow');
    process.exit(1);
  }
  
  log('📱 VibeCode Weight Loss Tracker - Build Script', 'blue');
  log('===============================================', 'blue');
  log('');
  
  buildApp(platform);
}

if (require.main === module) {
  main();
}

module.exports = { buildApp };
