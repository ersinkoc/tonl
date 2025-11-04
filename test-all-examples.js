#!/usr/bin/env node
/**
 * Test all example files to ensure they work
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findTsFiles(dir) {
  const files = [];
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...findTsFiles(fullPath));
      } else if (item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
  return files;
}

console.log('🧪 Testing ALL Example Files\n');

const exampleFiles = findTsFiles('examples');
console.log(`Found ${exampleFiles.length} example files\n`);

let passed = 0;
let failed = 0;

for (const file of exampleFiles) {
  process.stdout.write(`Testing ${file}... `);

  try {
    execSync(`node "${file}"`, {
      stdio: 'pipe',
      timeout: 10000
    });
    console.log('✅ PASS');
    passed++;
  } catch (error) {
    console.log('❌ FAIL');
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

console.log(`\n📊 Results:`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL EXAMPLES WORKING PERFECTLY!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some examples need fixing');
  process.exit(1);
}
