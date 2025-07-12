const fs = require('fs');
const path = require('path');

// This script generates COMPLETE SSG data using the NEW optimized complete-tree API
// ONE API call instead of 25,000+ individual calls! 🚀
// NOW ALSO INCLUDES: Bottom Items (@fordon dataset) + Individual Car Details (@fordon flow)

const CACHE_DIR = path.join(process.cwd(), '.ssg-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'static-paths.json');
const CONTENT_CACHE_DIR = path.join(CACHE_DIR, 'content');

// Ensure cache directories exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

if (!fs.existsSync(CONTENT_CACHE_DIR)) {
  fs.mkdirSync(CONTENT_CACHE_DIR, { recursive: true });
}

// API Configuration - using the NEW optimized endpoints
const API_BASE_URL = 'https://dev.bilregistret.ai/api';
const COMPLETE_TREE_ENDPOINT = '/cars/complete-tree';
const COMPLETE_BOTTOM_ITEMS_ENDPOINT = '/cars/complete-bottom-items'; // NEW: Bottom items for @tillverkare
const COMPLETE_FORDON_ENDPOINT = '/cars/complete-fordon-tree'; // NEW: Individual cars for @fordon flow

// Function to make the single API request to get EVERYTHING
async function fetchCompleteCarTree() {
  const url = `${API_BASE_URL}${COMPLETE_TREE_ENDPOINT}`;

  try {
    console.log(`🚀 Fetching COMPLETE car tree from: ${url}`);
    console.log('⚡ This replaces ~25,000 individual API calls with ONE optimized call!');

    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();

    console.log(`✅ SUCCESS! Fetched complete tree in ${endTime - startTime}ms`);
    console.log(`📊 Tree contains:`);
    console.log(`   - ${data.totalBrands || data.data?.length || 0} brands`);
    console.log(`   - ${data.totalModels || 0} models`);
    console.log(`   - ${data.totalSubModels || 0} sub-models`);
    console.log(`📅 Data timestamp: ${data.timestamp || 'Not provided'}`);

    return data;

  } catch (error) {
    console.error(`❌ API Error for complete tree:`, error.message);
    throw error;
  }
}

// NEW: Function to fetch ALL bottom items data in one call (eliminates slow @fordon queries!)
async function fetchCompleteBottomItems() {
  const url = `${API_BASE_URL}${COMPLETE_BOTTOM_ITEMS_ENDPOINT}`;

  try {
    console.log(`🚀 Fetching COMPLETE bottom items from: ${url}`);
    console.log('⚡ This eliminates THOUSANDS of slow @fordon API calls (1.4M dataset)!');

    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();

    console.log(`✅ SUCCESS! Fetched complete bottom items in ${endTime - startTime}ms`);
    console.log(`📊 Bottom items contains:`);
    console.log(`   - ${data.totalBottomItems || 0} bottom item sets`);
    console.log(`   - ${data.totalFordonRecords || 0} individual fordon records`);
    console.log(`   - Covering ${data.totalBrandModels || 0} brand-model combinations`);
    console.log(`📅 Data timestamp: ${data.timestamp || 'Not provided'}`);

    return data;

  } catch (error) {
    console.error(`❌ API Error for complete bottom items:`, error.message);
    console.log('⚠️ Bottom items will not be available - CarSuggestion will use API fallback');
    return { data: [] }; // Return empty but valid structure
  }
}

// Helper function to create URL-friendly slugs - ENHANCED for bulletproof slug generation
function createSlug(text) {
  if (!text) return 'unknown';

  // First, convert to string and trim
  const cleanText = String(text).trim();
  if (!cleanText) return 'unknown';

  const slug = cleanText
    .toLowerCase()
    // Replace problematic characters FIRST before other processing
    .replace(/[\/\\:*?"<>|]/g, '-') // Replace ALL problematic characters with hyphens
    .replace(/[&+]/g, '-') // Replace ampersands and plus signs
    .replace(/[^a-z0-9\s-]/g, '') // Remove ALL other special characters (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple consecutive hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();

  // Ensure we don't return empty strings
  const finalSlug = slug || 'unknown';

  // Enhanced debug logging for problematic cases
  if (text !== finalSlug && (text.includes('/') || text.includes('\\') || text.includes(':') || text.includes('*') || text.includes('?') || text.includes('"') || text.includes('<') || text.includes('>') || text.includes('|'))) {
    // console.log(`🔧 Fixed problematic slug: "${text}" → "${finalSlug}"`);
  }

  return finalSlug;
}

// Helper function to create safe filenames
function createSafeFilename(filename) {
  if (!filename) return 'unknown.json';

  // Remove any remaining problematic characters from the entire filename
  const safeFilename = filename.replace(/[\/\\:*?"<>|]/g, '-');

  // Ensure it ends with .json
  if (!safeFilename.endsWith('.json')) {
    return safeFilename + '.json';
  }

  return safeFilename;
}

// Helper function to save content data to file
function saveContentData(filename, data) {
  const safeFilename = createSafeFilename(filename);
  const filePath = path.join(CONTENT_CACHE_DIR, safeFilename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    // console.log(`💾 Saved content: ${safeFilename}`);
  } catch (error) {
    console.error(`❌ Error saving ${safeFilename}:`, error.message);
    // console.log(`🔧 Attempted path: ${filePath}`);
    // Don't throw - continue with other files
  }
}

// Process the complete tree data and generate all cache files
function processCompleteTreeData(treeData) {
  console.log('🔄 Processing complete tree data into cache files...');

  const allPaths = {
    brandPaths: [],
    modelPaths: [],
    subModelPaths: [],
    timestamp: new Date().toISOString(),
    apiSource: API_BASE_URL,
    generationMethod: 'complete-tree-single-call'
  };

  const brands = treeData.data || [];

  // Process brands array for CarBrand component
  const processedBrands = brands.map(brandData => {
    const brand = brandData.brand;
    return {
      id: brand.id?.toString() || '',
      merke_id: brand.merke_id?.toString() || '',
      title: brand.title || '',
      slug: createSlug(brand.slug || brand.title),
      brandimage: brand.brandimage || '',
      bannerimage: brand.bannerimage || '',
      country_code: brand.country_code || '',
      flags: brand.flags || '',
      originalData: brand
    };
  });

  // Save main brands file for CarBrand component
  saveContentData('car-brands.json', processedBrands);
  console.log(`✅ Saved ${processedBrands.length} brands`);

  // Process each brand with its models and sub-models
  brands.forEach(brandData => {
    const brand = brandData.brand;
    const models = brandData.models || [];

    // Ensure brand has a safe slug - ALWAYS process through createSlug
    const brandSlug = createSlug(brand.slug || brand.title);

    // Add to brand paths
    allPaths.brandPaths.push({ brand: brandSlug });

    // Process models for this brand
    const processedModels = models.map(modelData => {
      const model = modelData.model;
      const subModels = modelData.subModels || [];

      // Ensure model has a safe slug - ALWAYS process through createSlug
      const modelSlug = createSlug(model.slug || model.C_modell);

      // Add to model paths
      allPaths.modelPaths.push({
        brand: brandSlug,
        subBrand: modelSlug
      });

      // Process sub-models for this model
      const processedSubModels = subModels.map(subModel => {
        // Ensure sub-model has a safe slug - ALWAYS process through createSlug
        const subModelSlug = createSlug(subModel.slug || subModel.C_typ);

        // Skip sub-models with empty or invalid slugs to prevent Expo Router errors
        if (!subModelSlug || subModelSlug === 'unknown' || subModelSlug.trim() === '') {
          // console.log(`⚠️ Skipping sub-model with invalid slug: ${brandSlug}/${modelSlug}/${subModel.C_typ}`);
          return null; // Return null to filter out later
        }

        // Add to sub-model paths
        allPaths.subModelPaths.push({
          brand: brandSlug,
          subBrand: modelSlug,
          subBrandDetails: subModelSlug
        });

        // Save individual sub-model content file
        const subModelKey = `${brandSlug}-${modelSlug}-${subModelSlug}`;
        saveContentData(`submodel-${subModelKey}.json`, {
          brand: {
            id: brand.id?.toString() || '',
            merke_id: brand.merke_id?.toString() || '',
            title: brand.title || '',
            slug: brandSlug,
            brandimage: brand.brandimage || '',
            bannerimage: brand.bannerimage || '',
            country_code: brand.country_code || '',
            flags: brand.flags || '',
            originalData: brand
          },
          model: {
            id: model.ID || '',
            c_merke: model.C_merke || '',
            c_modell: model.C_modell || '',
            slug: modelSlug,
            yearRange: `${model.MINI_AR || ''}-${model.MAX_YEAR || ''}`,
            registeredCars: model.t_count || '0',
            seats: `${model.minSeats || '0'}-${model.maxSeats || '0'}`,
            imageUrl: model["Car Image"] || '',
            fuelTypes: (model.BRANSLE_SAMLAD || '').split(',').map(type => type.trim()).filter(Boolean),
            bodyTypes: (model.kaross_samlad || '').split(',').map(type => type.trim()).filter(Boolean),
            engineTypes: (model.HJUL_DRIFT_SAMLAD || '').split(',').map(type => type.trim()).filter(Boolean),
            minYear: parseInt(model.MINI_AR || '0', 10),
            maxYear: parseInt(model.MAX_YEAR || '0', 10),
            originalData: model
          },
          subModel: {
            id: subModel.ID || '',
            modell_id: subModel.modell_id || '',
            c_merke: subModel.C_merke || '',
            c_modell: subModel.C_modell || '',
            c_typ: subModel.C_typ || '',
            slug: subModelSlug,
            yearRange: `${subModel.ar_fra || ''} - ${subModel.ar_till || ''}`,
            registeredCars: subModel.t_count || '0',
            seats: `${subModel.minSeats || '0'}-${subModel.maxSeats || '0'}`,
            imageUrl: subModel["Car Image"] || '',
            C_chassi: subModel.C_chassi || '',
            engine: subModel.C_bransle || '',
            originalData: subModel
          }
        });

        return {
          id: subModel.ID || '',
          modell_id: subModel.modell_id || '',
          c_merke: subModel.C_merke || '',
          c_modell: subModel.C_modell || '',
          c_typ: subModel.C_typ || '',
          slug: subModelSlug,
          yearRange: `${subModel.ar_fra || ''} - ${subModel.ar_till || ''}`,
          registeredCars: subModel.t_count || '0',
          seats: `${subModel.minSeats || '0'}-${subModel.maxSeats || '0'}`,
          imageUrl: subModel["Car Image"] || '',
          C_chassi: subModel.C_chassi || '',
          engine: subModel.C_bransle || '',
          originalData: subModel
        };
      });

      // Filter out null sub-models that were skipped due to invalid slugs
      const validProcessedSubModels = processedSubModels.filter(subModel => subModel !== null);

      // Save individual model content file
      const modelKey = `${brandSlug}-${modelSlug}`;
      saveContentData(`model-${modelKey}.json`, {
        brand: {
          id: brand.id?.toString() || '',
          merke_id: brand.merke_id?.toString() || '',
          title: brand.title || '',
          slug: brandSlug,
          brandimage: brand.brandimage || '',
          bannerimage: brand.bannerimage || '',
          country_code: brand.country_code || '',
          flags: brand.flags || '',
          originalData: brand
        },
        model: {
          id: model.ID || '',
          c_merke: model.C_merke || '',
          c_modell: model.C_modell || '',
          slug: modelSlug,
          yearRange: `${model.MINI_AR || ''}-${model.MAX_YEAR || ''}`,
          registeredCars: model.t_count || '0',
          seats: `${model.minSeats || '0'}-${model.maxSeats || '0'}`,
          imageUrl: model["Car Image"] || '',
          fuelTypes: (model.BRANSLE_SAMLAD || '').split(',').map(type => type.trim()).filter(Boolean),
          bodyTypes: (model.kaross_samlad || '').split(',').map(type => type.trim()).filter(Boolean),
          engineTypes: (model.HJUL_DRIFT_SAMLAD || '').split(',').map(type => type.trim()).filter(Boolean),
          minYear: parseInt(model.MINI_AR || '0', 10),
          maxYear: parseInt(model.MAX_YEAR || '0', 10),
          originalData: model
        },
        subModels: validProcessedSubModels
      });

      return {
        id: model.ID || '',
        c_merke: model.C_merke || '',
        c_modell: model.C_modell || '',
        slug: modelSlug,
        yearRange: `${model.MINI_AR || ''}-${model.MAX_YEAR || ''}`,
        registeredCars: model.t_count || '0',
        seats: `${model.minSeats || '0'}-${model.maxSeats || '0'}`,
        imageUrl: model["Car Image"] || '',
        fuelTypes: (model.BRANSLE_SAMLAD || '').split(',').map(type => type.trim()).filter(Boolean),
        bodyTypes: (model.kaross_samlad || '').split(',').map(type => type.trim()).filter(Boolean),
        engineTypes: (model.HJUL_DRIFT_SAMLAD || '').split(',').map(type => type.trim()).filter(Boolean),
        minYear: parseInt(model.MINI_AR || '0', 10),
        maxYear: parseInt(model.MAX_YEAR || '0', 10),
        originalData: model
      };
    });

    // Save individual brand content file
    saveContentData(`brand-${brandSlug}.json`, {
      brand: {
        id: brand.id?.toString() || '',
        merke_id: brand.merke_id?.toString() || '',
        title: brand.title || '',
        slug: brandSlug,
        brandimage: brand.brandimage || '',
        bannerimage: brand.bannerimage || '',
        country_code: brand.country_code || '',
        flags: brand.flags || '',
        originalData: brand
      },
      models: processedModels
    });
  });

  return allPaths;
}

// NEW: Process bottom items data for CarSuggestion components
function processBottomItemsData(bottomItemsData) {
  // console.log('🔄 Processing bottom items data for CarSuggestion components...');

  const bottomItems = bottomItemsData.data || [];
  let processedCount = 0;

  bottomItems.forEach(bottomItemSet => {
    const { brandSlug, modelSlug, items } = bottomItemSet;

    if (!brandSlug || !modelSlug || !items || !Array.isArray(items)) {
      // console.log(`⚠️ Skipping invalid bottom item set: ${brandSlug}/${modelSlug}`);
      return;
    }

    // Process and save bottom items for this brand-model combination
    const processedBottomItems = items.map((item, index) => ({
      id: String(index + 1),
      C_merke: item.C_merke || '',
      C_modell: item.C_modell || '',
      Fordons_ar: item.Fordons_ar || '',
      C_typ: item.C_typ || '',
      C_bransle: item.C_bransle || '',
      C_kaross: item.C_kaross || '',
      C_vaxellada: item.C_vaxellada || '',
      Tjanstevikt: item.Tjanstevikt || '',
      Totalvikt: item.Totalvikt || '',
      link_NYA_12: item.link_NYA_12 || '',
      image_url: item.image_url || ''
    }));

    // Save bottom items file for this brand-model combination
    const bottomItemsKey = `${brandSlug}-${modelSlug}`;
    saveContentData(`bottom-items-${bottomItemsKey}.json`, processedBottomItems);
    processedCount++;
  });

  // console.log(`✅ Processed ${processedCount} bottom item sets (eliminating slow @fordon runtime queries!)`);
  return processedCount;
}

// Generate all static paths AND content from the new complete APIs
async function generateAllPathsAndContentFromTree() {
  // console.log('🚀 Starting ULTRA-FAST SSG generation with complete tree APIs...');
  // console.log('⚡ This replaces ~25,000+ API calls with just 2 optimized calls!');

  // Parse command line arguments
  const args = process.argv.slice(2);

  // console.log('🚀 Processing @tillverkare navigation + bottom items (skipping individual @fordon pages)');
  // console.log('⚡ This uses 2 optimized API calls for faster builds!');

  const startTime = Date.now();

  try {
    // Step 1: Fetch data sources (tree + bottom items only)
    // console.log('📡 Fetching data sources...');

    const treeDataPromise = fetchCompleteCarTree();
    const bottomItemsPromise = fetchCompleteBottomItems();

    // console.log('⏭️ Skipping @fordon individual car data (1.4M+ cars) for faster builds');
    // console.log('💡 This focuses on navigation structure + bottom items only');

    const [treeData, bottomItemsData] = await Promise.all([
      treeDataPromise,
      bottomItemsPromise
    ]);

    if (!treeData || !treeData.data || !Array.isArray(treeData.data)) {
      throw new Error('Invalid tree data structure received from API');
    }

    // console.log('🔄 Processing all data into cache structure...');
    const processingStartTime = Date.now();

    // Step 2: Process the main tree data into cache files
    const allPaths = processCompleteTreeData(treeData);

    // Step 3: Process bottom items data (eliminating slow @fordon queries!)
    let bottomItemsCount = 0;
    if (bottomItemsData && bottomItemsData.data) {
      bottomItemsCount = processBottomItemsData(bottomItemsData);
    }

    // Step 4: Skip fordon individual car data processing
    // console.log('⏭️ Skipping @fordon individual car data processing for faster builds');
    // console.log('💡 Bottom items are still processed for CarSuggestion components');

    // Empty fordon paths since we're skipping individual car pages
    allPaths.fordonPaths = [];

    // Step 5: Save paths file with navigation paths only
    fs.writeFileSync(CACHE_FILE, JSON.stringify(allPaths, null, 2));
    // console.log(`💾 Saved paths to: ${CACHE_FILE}`);

    // Step 6: Save complete data as backup
    saveContentData('complete-tree-data.json', treeData);
    if (bottomItemsData && bottomItemsData.data) {
      saveContentData('complete-bottom-items-data.json', bottomItemsData);
    }

    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    const totalPaths = allPaths.brandPaths.length + allPaths.modelPaths.length + allPaths.subModelPaths.length;

    // console.log(`\n🎉 ULTRA-FAST SSG generation completed in ${totalTime}s!`);
    // console.log(`📈 Generated ${totalPaths.toLocaleString()} navigation paths with FULL CONTENT:`);
    // console.log(`   - ${allPaths.brandPaths.length} brand pages (with models)`);
    // console.log(`   - ${allPaths.modelPaths.length} model pages (with sub-models)`);
    // console.log(`   - ${allPaths.subModelPaths.length} sub-model pages (with details)`);
    // console.log(`   - 0 fordon detail pages (skipped for faster builds)`);
    // console.log(`💾 Cache saved to: ${CACHE_FILE}`);
    // console.log(`📁 Content files saved to: ${CONTENT_CACHE_DIR}`);
    // console.log(`🌐 Data sources:`);
    // console.log(`   - @tillverkare: ${API_BASE_URL}${COMPLETE_TREE_ENDPOINT}`);
    // console.log(`   - Bottom items: ${API_BASE_URL}${COMPLETE_BOTTOM_ITEMS_ENDPOINT}`);
    // console.log(`⚡ Method: 2 optimized API calls (vs. ${totalPaths + bottomItemsCount * 10} individual calls)`);
    // console.log(`🚀 Bottom items: ${bottomItemsCount} sets generated (eliminating slow @fordon queries!)`);
    // console.log(`📊 Processing rate: ${Math.round(totalPaths / totalTime)} paths/sec`);

    // Success message
    if (totalPaths > 10000) {
      // console.log('\n🎉 SUCCESS! Navigation structure with COMPLETE CONTENT ready for deployment! 🚀');
    } else if (totalPaths > 1000) {
      // console.log('\n✅ Good navigation dataset with COMPLETE CONTENT - ready for deployment!');
    } else {
      // console.log('\n⚠️ Small dataset - verify APIs are returning all data');
    }

    return { allPaths, treeData, bottomItemsData };

  } catch (error) {
    console.error('❌ Critical error in ULTRA-FAST SSG generation:', error.message);
    // console.log('🔄 This error prevented data generation. Please check:');
    // console.log('   1. API server is running and accessible');
    // console.log('   2. Complete-tree endpoints are implemented:');
    // console.log(`      - ${COMPLETE_TREE_ENDPOINT}`);
    // console.log(`      - ${COMPLETE_BOTTOM_ITEMS_ENDPOINT}`);
    // console.log('   3. Network connectivity');
    // console.log('   4. API response structures match expected format');

    // Don't save empty data on critical errors
    process.exit(1);
  }
}

// Load cached paths if available
function loadCachedPaths() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      // console.log(`📂 Loaded cached SSG data from ${cached.timestamp}`);
      // console.log(`🌐 Data source: ${cached.apiSource || 'Unknown'}`);
      // console.log(`⚡ Generation method: ${cached.generationMethod || 'Unknown'}`);
      return cached;
    } catch (error) {
      console.error('❌ Error loading cached paths:', error);
      return null;
    }
  }
  return null;
}

// Load cached content data
function loadCachedContent(filename) {
  const filePath = path.join(CONTENT_CACHE_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`❌ Error loading cached content ${filename}:`, error);
      return null;
    }
  }
  return null;
}

// Check if cache is fresh (less than 2 hours old for real data)
function isCacheFresh() {
  const cached = loadCachedPaths();
  if (!cached) return false;

  const cacheTime = new Date(cached.timestamp);
  const now = new Date();
  const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

  return hoursDiff < 2; // Cache is fresh if less than 2 hours old
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Ultra-Fast SSG Generator for Navigation Structure + Bottom Items

USAGE:
  node scripts/generateSSGDataReal.js [options]

OPTIONS:
  --help, -h              Show this help message
  --force                 Force regenerate even if cache is fresh

EXAMPLES:
  # Generate navigation structure + bottom items
  node scripts/generateSSGDataReal.js

  # Force regenerate
  node scripts/generateSSGDataReal.js --force

FEATURES:
  - Optimized navigation structure generation
  - Bottom items for CarSuggestion components
  - Zero runtime API calls for navigation
  - Fast builds (skips 1.4M+ individual car pages)

WHAT THIS GENERATES:
  - ~25,630 navigation pages (brands/models/sub-models)
  - ~1,131 bottom item sets for CarSuggestion components
  - Skips individual car detail pages for faster builds

SYSTEM REQUIREMENTS:
  - Node.js with basic memory requirements
  - API server running on localhost:3000

After generation, your navigation will have ZERO runtime API dependency!
`);
    return;
  }

  const forceRegenerate = args.includes('--force');

  if (!forceRegenerate && isCacheFresh()) {
    // console.log('✅ Using fresh cached navigation + bottom items data');
    const cached = loadCachedPaths();
    const totalPaths = cached.brandPaths.length + cached.modelPaths.length + cached.subModelPaths.length;
    // console.log(`📊 Cached paths: ${totalPaths.toLocaleString()} navigation paths`);
    // console.log(`   - ${cached.brandPaths.length} @tillverkare brand pages`);
    // console.log(`   - ${cached.modelPaths.length} @tillverkare model pages`);
    // console.log(`   - ${cached.subModelPaths.length} @tillverkare sub-model pages`);
    // console.log(`   - 0 @fordon individual car pages (skipped)`);
    // console.log(`🌐 Source: ${cached.apiSource || 'Unknown'}`);
    // console.log(`⚡ Method: ${cached.generationMethod || 'Unknown'}`);
    // console.log(`📁 Content files available in: ${CONTENT_CACHE_DIR}`);
    // console.log(`🚀 Bottom items: Available for CarSuggestion components`);
    // console.log('\n💡 Use --force to regenerate or --help for options');
    return;
  }

  // console.log('🔄 Generating fresh navigation structure + bottom items data...');
  // console.log(`🌐 API Endpoints:`);
  // console.log(`   - @tillverkare: ${API_BASE_URL}${COMPLETE_TREE_ENDPOINT}`);
  // console.log(`   - Bottom items: ${API_BASE_URL}${COMPLETE_BOTTOM_ITEMS_ENDPOINT}`);
  // console.log('⏭️ Skipping @fordon individual pages for faster builds');
  // console.log('⚡ This uses 2 optimized API calls for fast generation!');

  await generateAllPathsAndContentFromTree();

  // console.log('\n📋 Generated Cache Files:');
  // console.log('🗂️ Core Navigation:');
  // console.log('   - car-brands.json (CarBrand component)');
  // console.log('   - brand-{slug}.json (CarBrandSpecefic component)');
  // console.log('   - model-{brandSlug}-{modelSlug}.json (CarBrandSpeceficSubModel component)');
  // console.log('   - submodel-{brandSlug}-{modelSlug}-{subModelSlug}.json (details)');
  // console.log('🚀 Bottom Items (eliminates slow @fordon queries):');
  // console.log('   - bottom-items-{brandSlug}-{modelSlug}.json (CarSuggestion components)');
  // console.log('\n✅ Navigation components now support ZERO API CALLS at runtime!');
  // console.log('\n💡 Next steps:');
  // console.log('   1. Deploy your app - navigation works without API dependency');
  // console.log('   2. Navigation pages load instantly from static content');
  // console.log('   3. CarSuggestion components use cached bottom items!');
}

// Export functions for use in other modules
module.exports = {
  generateAllPathsAndContentFromTree,
  loadCachedPaths,
  loadCachedContent,
  isCacheFresh,
  fetchCompleteCarTree,
  fetchCompleteBottomItems,        // NEW
  processCompleteTreeData,
  processBottomItemsData,          // NEW
  CACHE_FILE,
  CONTENT_CACHE_DIR,
  // API endpoints for reference
  API_ENDPOINTS: {
    COMPLETE_TREE: COMPLETE_TREE_ENDPOINT,
    COMPLETE_BOTTOM_ITEMS: COMPLETE_BOTTOM_ITEMS_ENDPOINT
  },
  // Utility functions
  createSlug,
  createSafeFilename,
  saveContentData,
  // Processing capabilities
  FEATURES: {
    navigationStructure: true,
    bottomItemsSupport: true,
    zeroRuntimeAPICalls: true,
    fastBuilds: true,
    skipFordonPages: true
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}