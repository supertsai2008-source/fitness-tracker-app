#!/usr/bin/env node

/**
 * Migration Test Script
 * Verifies that Supabase has been completely removed and InstantDB is properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Supabase → InstantDB Migration...\n');

// Test 1: Check package.json for dependencies
console.log('1. Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];
const hasInstantDB = packageJson.dependencies && packageJson.dependencies['@instantdb/react-native'];

if (hasSupabase) {
  console.log('❌ Supabase dependency still exists in package.json');
  process.exit(1);
} else {
  console.log('✅ Supabase dependency removed');
}

if (hasInstantDB) {
  console.log('✅ InstantDB dependency added');
} else {
  console.log('❌ InstantDB dependency missing');
  process.exit(1);
}

// Test 2: Check for Supabase imports in source files
console.log('\n2. Checking for Supabase imports...');
const srcDir = 'src';
const files = getAllFiles(srcDir);

let supabaseImports = 0;
let instantdbImports = 0;

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('@supabase/supabase-js') || content.includes('from "../lib/supabase"')) {
      supabaseImports++;
      console.log(`❌ Supabase import found in: ${file}`);
    }
    
    if (content.includes('@instantdb/react-native') || content.includes('from "../lib/instantdb"')) {
      instantdbImports++;
    }
  }
});

if (supabaseImports === 0) {
  console.log('✅ No Supabase imports found');
} else {
  console.log(`❌ Found ${supabaseImports} Supabase imports`);
  process.exit(1);
}

if (instantdbImports > 0) {
  console.log(`✅ Found ${instantdbImports} InstantDB imports`);
} else {
  console.log('❌ No InstantDB imports found');
  process.exit(1);
}

// Test 3: Check for required InstantDB files
console.log('\n3. Checking InstantDB files...');
const requiredFiles = [
  'src/lib/instantdb.ts',
  'src/lib/instantdbSync.ts',
  'instantdb-schema.json',
  'instantdb-permissions.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
});

// Test 4: Check for removed Supabase files
console.log('\n4. Checking removed Supabase files...');
const removedFiles = [
  'src/lib/supabase.ts',
  'src/lib/supabaseSync.ts'
];

removedFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`✅ ${file} removed`);
  } else {
    console.log(`❌ ${file} still exists`);
    process.exit(1);
  }
});

// Test 5: Verify InstantDB client configuration
console.log('\n5. Verifying InstantDB configuration...');
const instantdbContent = fs.readFileSync('src/lib/instantdb.ts', 'utf8');

if (instantdbContent.includes('d10db7a8-30ac-4fdb-82a1-87cc0e993acd')) {
  console.log('✅ Correct InstantDB app ID configured');
} else {
  console.log('❌ InstantDB app ID not found or incorrect');
  process.exit(1);
}

if (instantdbContent.includes('profiles') && instantdbContent.includes('entitlements')) {
  console.log('✅ Schema collections defined');
} else {
  console.log('❌ Schema collections missing');
  process.exit(1);
}

console.log('\n🎉 Migration test completed successfully!');
console.log('\nNext steps:');
console.log('1. Upload instantdb-schema.json to InstantDB dashboard');
console.log('2. Configure permissions using instantdb-permissions.md');
console.log('3. Test authentication flow');
console.log('4. Deploy to production');

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  
  return files;
}
