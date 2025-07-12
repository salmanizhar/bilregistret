#!/usr/bin/env node

// 🚀 BUNDLE ANALYSIS SCRIPT - Monitor performance improvements
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Analyzing bundle performance improvements...\n');

// Configuration
const OUTPUT_DIR = '.next';
const DIST_DIR = 'out';
const TARGET_DIRS = [OUTPUT_DIR, DIST_DIR];

// File size thresholds (in KB)
const SIZE_THRESHOLDS = {
  EXCELLENT: 100,  // Under 100KB is excellent
  GOOD: 250,       // Under 250KB is good  
  WARNING: 500,    // Under 500KB is warning
  CRITICAL: 1000   // Over 1MB is critical
};

// Performance analysis
function analyzeBundle() {
  const results = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    chunks: [],
    recommendations: []
  };

  for (const dir of TARGET_DIRS) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Analyzing ${dir}/...`);
      analyzeDirc(dir, results);
    }
  }

  return results;
}

function analyzeDirc(dirPath, results) {
  const files = getAllFiles(dirPath);
  
  files.forEach(filePath => {
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const relativePath = path.relative(process.cwd(), filePath);
    const ext = path.extname(filePath);
    
    results.totalSize += size;
    
    if (ext === '.js') {
      results.jsSize += size;
      
      if (size > SIZE_THRESHOLDS.WARNING * 1024) {
        results.chunks.push({
          file: relativePath,
          size: formatSize(size),
          type: 'JavaScript',
          status: size > SIZE_THRESHOLDS.CRITICAL * 1024 ? 'CRITICAL' : 'WARNING'
        });
      }
    } else if (ext === '.css') {
      results.cssSize += size;
    }
  });
}

function getAllFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) return files;
  
  const entries = fs.readdirSync(dirPath);
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory() && !entry.startsWith('.')) {
      getAllFiles(fullPath, files);
    } else if (stats.isFile() && (entry.endsWith('.js') || entry.endsWith('.css'))) {
      files.push(fullPath);
    }
  });
  
  return files;
}

function formatSize(bytes) {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  return `${kb.toFixed(2)} KB`;
}

function getPerformanceRating(sizeKB) {
  if (sizeKB <= SIZE_THRESHOLDS.EXCELLENT) return '🚀 EXCELLENT';
  if (sizeKB <= SIZE_THRESHOLDS.GOOD) return '✅ GOOD';
  if (sizeKB <= SIZE_THRESHOLDS.WARNING) return '⚠️ WARNING';
  return '🚨 CRITICAL';
}

function generateRecommendations(results) {
  const recommendations = [];
  const jsKB = results.jsSize / 1024;
  const totalKB = results.totalSize / 1024;
  
  if (jsKB > SIZE_THRESHOLDS.WARNING) {
    recommendations.push('🔧 Consider implementing more aggressive code splitting');
    recommendations.push('🌳 Enable tree shaking for unused dependencies');
    recommendations.push('📦 Use dynamic imports for heavy components');
  }
  
  if (results.chunks.filter(c => c.status === 'CRITICAL').length > 0) {
    recommendations.push('🚨 Critical: Some chunks are over 1MB - immediate optimization needed');
    recommendations.push('🎯 Split large components into smaller lazy-loaded modules');
  }
  
  if (totalKB < SIZE_THRESHOLDS.EXCELLENT) {
    recommendations.push('🎉 Excellent! Your bundle size is optimized for perfect performance');
  } else if (totalKB < SIZE_THRESHOLDS.GOOD) {
    recommendations.push('✨ Good bundle size! Minor optimizations could improve further');
  }
  
  return recommendations;
}

// Check for webpack-bundle-analyzer
function checkBundleAnalyzer() {
  try {
    execSync('npm list webpack-bundle-analyzer', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Main execution
function main() {
  const results = analyzeBundle();
  
  if (results.totalSize === 0) {
    console.log('❌ No build output found. Run `npm run build` first.\n');
    return;
  }
  
  // Display results
  console.log('📊 BUNDLE ANALYSIS RESULTS');
  console.log('═══════════════════════════\n');
  
  console.log(`📦 Total Bundle Size: ${formatSize(results.totalSize)} ${getPerformanceRating(results.totalSize / 1024)}`);
  console.log(`📄 JavaScript Size: ${formatSize(results.jsSize)} ${getPerformanceRating(results.jsSize / 1024)}`);
  console.log(`🎨 CSS Size: ${formatSize(results.cssSize)} ${getPerformanceRating(results.cssSize / 1024)}\n`);
  
  // Show large chunks
  if (results.chunks.length > 0) {
    console.log('🔍 LARGE CHUNKS DETECTED:');
    console.log('─────────────────────────\n');
    
    results.chunks.sort((a, b) => {
      const aSize = parseFloat(a.size);
      const bSize = parseFloat(b.size);
      return bSize - aSize;
    });
    
    results.chunks.forEach(chunk => {
      const icon = chunk.status === 'CRITICAL' ? '🚨' : '⚠️';
      console.log(`${icon} ${chunk.file}`);
      console.log(`   Size: ${chunk.size} (${chunk.status})`);
      console.log('');
    });
  }
  
  // Generate recommendations
  const recommendations = generateRecommendations(results);
  
  if (recommendations.length > 0) {
    console.log('💡 PERFORMANCE RECOMMENDATIONS:');
    console.log('────────────────────────────────\n');
    
    recommendations.forEach(rec => {
      console.log(`${rec}`);
    });
    console.log('');
  }
  
  // Performance score
  const jsKB = results.jsSize / 1024;
  let score = 100;
  
  if (jsKB > SIZE_THRESHOLDS.EXCELLENT) score -= 20;
  if (jsKB > SIZE_THRESHOLDS.GOOD) score -= 30;
  if (jsKB > SIZE_THRESHOLDS.WARNING) score -= 40;
  if (jsKB > SIZE_THRESHOLDS.CRITICAL) score -= 50;
  
  score = Math.max(0, score);
  
  console.log(`🏆 PERFORMANCE SCORE: ${score}/100`);
  
  if (score >= 80) {
    console.log('🚀 Outstanding! Your app should have excellent JavaScript execution performance.');
  } else if (score >= 60) {
    console.log('✅ Good performance! Minor optimizations recommended.');
  } else if (score >= 40) {
    console.log('⚠️ Performance issues detected. Optimization needed.');
  } else {
    console.log('🚨 Critical performance issues! Immediate optimization required.');
  }
  
  console.log('\n');
  
  // Bundle analyzer suggestion
  if (!checkBundleAnalyzer()) {
    console.log('💡 TIP: Install webpack-bundle-analyzer for detailed analysis:');
    console.log('   npm install --save-dev webpack-bundle-analyzer');
    console.log('   npm run analyze\n');
  }
  
  // Exit with appropriate code
  const hasWarnings = results.chunks.some(c => c.status === 'WARNING');
  const hasCritical = results.chunks.some(c => c.status === 'CRITICAL');
  
  if (hasCritical) {
    console.log('🚨 Exiting with error due to critical performance issues');
    process.exit(1);
  } else if (hasWarnings && process.env.CI) {
    console.log('⚠️ Exiting with warning code due to performance warnings');
    process.exit(2);
  }
  
  console.log('✅ Bundle analysis complete!');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeBundle, formatSize, getPerformanceRating }; 