#!/usr/bin/env node

/**
 * Migration Test Script
 * 
 * This script verifies that the Supabase to InstantDB migration was successful
 * by checking for:
 * 1. No remaining Supabase references
 * 2. InstantDB integration is present
 * 3. Dependencies are correctly updated
 */

const fs = require('fs');
const path = require('path');

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

function checkFileForPattern(filePath, pattern, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(new RegExp(pattern, 'gi'));
    return {
      file: filePath,
      found: matches ? matches.length : 0,
      description
    };
  } catch (error) {
    return {
      file: filePath,
      found: 0,
      description,
      error: error.message
    };
  }
}

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  log('🔍 Starting Supabase to InstantDB Migration Verification...', 'blue');
  log('');

  const srcDir = path.join(__dirname, 'src');
  const allFiles = getAllFiles(srcDir);
  
  // Test 1: Check for remaining Supabase references
  log('📋 Test 1: Checking for remaining Supabase references...', 'yellow');
  const supabaseResults = [];
  
  for (const file of allFiles) {
    const result = checkFileForPattern(file, 'supabase', 'Supabase reference');
    if (result.found > 0) {
      supabaseResults.push(result);
    }
  }
  
  if (supabaseResults.length === 0) {
    log('✅ No Supabase references found in source code', 'green');
  } else {
    log('❌ Found Supabase references:', 'red');
    supabaseResults.forEach(result => {
      log(`   - ${result.file}: ${result.found} occurrences`, 'red');
    });
  }
  
  // Test 2: Check for InstantDB integration
  log('');
  log('📋 Test 2: Checking for InstantDB integration...', 'yellow');
  const instantdbResults = [];
  
  for (const file of allFiles) {
    const result = checkFileForPattern(file, 'instantdb', 'InstantDB reference');
    if (result.found > 0) {
      instantdbResults.push(result);
    }
  }
  
  if (instantdbResults.length > 0) {
    log('✅ InstantDB integration found:', 'green');
    instantdbResults.forEach(result => {
      log(`   - ${result.file}: ${result.found} occurrences`, 'green');
    });
  } else {
    log('❌ No InstantDB integration found', 'red');
  }
  
  // Test 3: Check package.json dependencies
  log('');
  log('📋 Test 3: Checking package.json dependencies...', 'yellow');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (dependencies['@supabase/supabase-js']) {
      log('❌ Supabase package still present in dependencies', 'red');
    } else {
      log('✅ Supabase package removed from dependencies', 'green');
    }
    
    if (dependencies['@instantdb/react-native']) {
      log('✅ InstantDB package found in dependencies', 'green');
    } else {
      log('❌ InstantDB package not found in dependencies', 'red');
    }
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, 'red');
  }
  
  // Test 4: Check for key migration files
  log('');
  log('📋 Test 4: Checking for migration files...', 'yellow');
  
  const requiredFiles = [
    'src/lib/instantdb.ts',
    'src/api/auth/instantdb.ts',
    'src/lib/instantdbSync.ts',
    'src/api/revenuecat-integration.ts',
    'instantdb-permissions.md',
    'instantdb-schema.json'
  ];
  
  let allFilesPresent = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file} exists`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
      allFilesPresent = false;
    }
  });
  
  // Test 5: Check for removed Supabase files
  log('');
  log('📋 Test 5: Checking for removed Supabase files...', 'yellow');
  
  const removedFiles = [
    'src/lib/supabase.ts',
    'src/lib/supabaseSync.ts'
  ];
  
  let allFilesRemoved = true;
  removedFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      log(`✅ ${file} removed`, 'green');
    } else {
      log(`❌ ${file} still exists`, 'red');
      allFilesRemoved = false;
    }
  });
  
  // Summary
  log('');
  log('📊 Migration Summary:', 'blue');
  log(`   - Supabase references: ${supabaseResults.length === 0 ? '✅ Clean' : '❌ Found'}`, supabaseResults.length === 0 ? 'green' : 'red');
  log(`   - InstantDB integration: ${instantdbResults.length > 0 ? '✅ Present' : '❌ Missing'}`, instantdbResults.length > 0 ? 'green' : 'red');
  log(`   - Migration files: ${allFilesPresent ? '✅ Complete' : '❌ Incomplete'}`, allFilesPresent ? 'green' : 'red');
  log(`   - Supabase cleanup: ${allFilesRemoved ? '✅ Complete' : '❌ Incomplete'}`, allFilesRemoved ? 'green' : 'red');
  
  const isSuccess = supabaseResults.length === 0 && instantdbResults.length > 0 && allFilesPresent && allFilesRemoved;
  
  log('');
  if (isSuccess) {
    log('🎉 Migration verification PASSED!', 'green');
    log('   The Supabase to InstantDB migration appears to be successful.', 'green');
  } else {
    log('⚠️  Migration verification FAILED!', 'red');
    log('   Please review the issues above and complete the migration.', 'red');
  }
  
  log('');
  log('📝 Next Steps:', 'blue');
  log('   1. Configure InstantDB permissions using instantdb-permissions.md', 'yellow');
  log('   2. Test multi-account isolation', 'yellow');
  log('   3. Test cold start behavior', 'yellow');
  log('   4. Test RevenueCat integration', 'yellow');
  log('   5. Deploy and verify in production', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main };
