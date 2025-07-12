import { carService } from '@/Services/api/services/car.service';
import { hyphensToSpaces, spacesToHyphens, convertWixImageUrl } from '@/constants/commonFunctions';
import { 
  getStaticCarBrands, 
  getStaticBrandData, 
  getStaticModelData, 
  getStaticSubModelData,
  isStaticContentAvailable,
  getAllStaticBrandPaths,
  getAllStaticModelPaths,
  getAllStaticSubModelPaths,
  transformBrandsDataForComponent,
  transformBrandDataForComponent,
  getStaticBottomItems,
  StaticBottomItemData
} from './staticContentLoader';

// Types for SSG data generation
export interface SSGBrand {
  id: string;
  merke_id: string;
  title: string;
  slug: string;
}

export interface SSGModel {
  id: string;
  modelName: string;
  c_merke: string;
  c_modell: string;
  slug: string;
}

export interface SSGSubModel {
  id: string;
  modell_id: string;
  c_merke: string;
  c_modell: string;
  c_typ: string;
  slug: string;
}

export interface SSGModelDetail {
  id: string;
  title: string;
  c_merke: string;
  c_modell: string;
  c_typ: string;
  slug: string;
}

// NEW: Interface for bottom items data
export interface SSGBottomItem {
  id: string;
  C_merke: string;
  C_modell: string;
  Fordons_ar: string;
  C_typ: string;
  C_bransle: string;
  C_kaross: string;
  C_vaxellada?: string;
  Tjanstevikt: string;
  Totalvikt: string;
  link_NYA_12: string;
  image_url?: string;
}

interface CachedPaths {
  brandPaths: { brand: string }[];
  modelPaths: { brand: string; subBrand: string }[];
  subModelPaths: { brand: string; subBrand: string; subBrandDetails: string }[];
  timestamp: string;
}

// Cache for build-time data generation
let cachedAllData: {
  brands: SSGBrand[];
  models: SSGModel[];
  subModels: SSGSubModel[];
  modelDetails: SSGModelDetail[];
} | null = null;

// Check if we're in a build environment (Node.js with access to file system)
const isBuildTime = typeof window === 'undefined' && 
                   typeof process !== 'undefined' && 
                   typeof process.cwd === 'function';

// Node.js modules (only available during build time)
let fs: any = null;
let path: any = null;
let CACHE_FILE: string | null = null;

// Initialize Node.js modules only during build time
function initializeNodeModules() {
  if (isBuildTime && !fs && !path) {
    try {
      // Use require for Node.js modules during build time
      fs = require('fs');
      path = require('path');
      CACHE_FILE = path.join(process.cwd(), '.ssg-cache', 'static-paths.json');
    } catch (error) {
      console.warn('Could not initialize Node.js modules:', error);
    }
  }
}

/**
 * Load cached SSG paths from build-time generation
 * Only works during build time
 */
function loadCachedPaths(): CachedPaths | null {
  if (!isBuildTime) {
    // console.log('🚀 Skipping cache load - not in build environment');
    return null;
  }

  initializeNodeModules();
  
  try {
    if (fs && CACHE_FILE && fs.existsSync(CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      // console.log(`📂 Loaded cached SSG data from ${cached.timestamp}`);
      return cached;
    }
  } catch (error) {
    console.error('❌ Error loading cached paths:', error);
  }
  return null;
}

/**
 * Fetch all car brands for SSG
 * PRIORITIZES static content over API calls for zero-API-call serving
 */
export async function getAllCarBrands(): Promise<SSGBrand[]> {
  // First try: Use pre-generated static content (BEST OPTION - zero API calls)
  if (isStaticContentAvailable()) {
    try {
      // console.log('🎯 Using pre-generated static content for brands (ZERO API CALLS!)');
      const staticBrands = getStaticCarBrands();
      
      if (staticBrands && staticBrands.length > 0) {
        // console.log(`✅ Loaded ${staticBrands.length} brands from static content`);
        return staticBrands.map(brand => ({
          id: brand.id,
          merke_id: brand.merke_id,
          title: brand.title,
          slug: brand.slug
        }));
      }
    } catch (error) {
      console.error('❌ Error loading static content, falling back to API:', error);
    }
  }

  // Second try: API calls (only during build or when static content unavailable)
  if (isBuildTime) {
    try {
      // console.log('🚗 Static content unavailable, fetching car brands from API...');
      const brands = await carService.getCarBrands();
      
      if (brands && brands.length > 0) {
        // console.log(`✅ Successfully fetched ${brands.length} brands from API`);
        return brands.map(brand => ({
          id: brand.id.toString(),
          merke_id: brand.merke_id.toString(),
          title: brand.title,
          slug: spacesToHyphens(brand.title)
        }));
      }
      
      throw new Error('No brands returned from API');
    } catch (error) {
      console.error('❌ Error fetching car brands from API:', error);
    }
  }

  // Third try: Legacy cached data
  // console.log('🔄 Falling back to legacy cached data...');
  const cached = loadCachedPaths();
  if (cached && cached.brandPaths.length > 0) {
    // console.log(`📂 Using ${cached.brandPaths.length} brands from legacy cache`);
    return cached.brandPaths.map((path, index) => ({
      id: index.toString(),
      merke_id: index.toString(),
      title: hyphensToSpaces(path.brand),
      slug: path.brand
    }));
  }

  // Final fallback: Empty array
  console.warn('⚠️ No car brands available - returning empty array');
  return [];
}

/**
 * Fetch all car models for a specific brand
 * PRIORITIZES static content over API calls
 */
export async function getCarModelsForBrand(brandSlug: string): Promise<SSGModel[]> {
  // First try: Use pre-generated static content
  if (isStaticContentAvailable()) {
    try {
      // console.log(`🎯 Using static content for models (brand: ${brandSlug})`);
      const brandData = getStaticBrandData(brandSlug);
      
      if (brandData && brandData.models) {
        // console.log(`✅ Found ${brandData.models.length} static models for ${brandSlug}`);
        return brandData.models.map(model => ({
          id: model.id,
          modelName: model.c_modell,
          c_merke: model.c_merke,
          c_modell: model.c_modell,
          slug: model.slug
        }));
      }
    } catch (error) {
      console.error(`❌ Error loading static models for ${brandSlug}:`, error);
    }
  }

  // Fallback to API if static content unavailable and we're in build time
  if (isBuildTime) {
    try {
      // console.log(`🚗 Fetching models for brand: ${brandSlug} from API`);
      const models = await carService.getCarModels(hyphensToSpaces(brandSlug));
      
      if (models && models.length > 0) {
        // console.log(`✅ Found ${models.length} models for ${brandSlug} from API`);
        return models.map(model => ({
          id: model.ID || '',
          modelName: model.C_modell || '',
          c_merke: model.C_merke || '',
          c_modell: model.C_modell || '',
          slug: spacesToHyphens(`${model.C_merke} ${model.C_modell}`)
        }));
      }
    } catch (error) {
      console.error(`❌ Error fetching models for brand ${brandSlug}:`, error);
    }
  }

  return [];
}

/**
 * Fetch all sub-models for a specific brand and model
 * PRIORITIZES static content over API calls
 */
export async function getCarSubModelsForModel(brandSlug: string, modelSlug: string): Promise<SSGSubModel[]> {
  // First try: Use pre-generated static content
  if (isStaticContentAvailable()) {
    try {
      // console.log(`🎯 Using static content for sub-models (${brandSlug}/${modelSlug})`);
      const modelData = getStaticModelData(brandSlug, modelSlug);
      
      if (modelData && modelData.subModels) {
        // console.log(`✅ Found ${modelData.subModels.length} static sub-models for ${brandSlug}/${modelSlug}`);
        return modelData.subModels.map(subModel => ({
          id: subModel.id,
          modell_id: subModel.modell_id,
          c_merke: subModel.c_merke,
          c_modell: subModel.c_modell,
          c_typ: subModel.c_typ,
          slug: subModel.slug
        }));
      }
    } catch (error) {
      console.error(`❌ Error loading static sub-models for ${brandSlug}/${modelSlug}:`, error);
    }
  }

  // Fallback to API if static content unavailable and we're in build time
  if (isBuildTime) {
    try {
      // console.log(`🚗 Fetching sub-models for ${brandSlug}/${modelSlug} from API`);
      const subModels = await carService.getCarSubModels(
        hyphensToSpaces(brandSlug),
        hyphensToSpaces(modelSlug)
      );
      
      if (subModels && subModels.length > 0) {
        // console.log(`✅ Found ${subModels.length} sub-models for ${brandSlug}/${modelSlug} from API`);
        return subModels.map(subModel => ({
          id: subModel.ID || '',
          modell_id: subModel.modell_id || '',
          c_merke: subModel.C_merke || '',
          c_modell: subModel.C_modell || '',
          c_typ: subModel.C_typ || '',
          slug: spacesToHyphens(`${subModel.C_merke} ${subModel.C_modell} ${subModel.C_typ}`)
        }));
      }
    } catch (error) {
      console.error(`❌ Error fetching sub-models for ${brandSlug}/${modelSlug}:`, error);
    }
  }

  return [];
}

/**
 * Generate all static paths using STATIC CONTENT FIRST
 * This eliminates the need for 25k API calls!
 */
export async function generateAllStaticPaths() {
  // console.log('🚀 Generating static paths using STATIC CONTENT (zero API calls!)...');

  // Try static content first (BEST OPTION - zero API calls!)
  if (isStaticContentAvailable()) {
    try {
      // console.log('🎯 Using pre-generated static content for ALL paths');
      
      const brandPaths = getAllStaticBrandPaths();
      const modelPaths = getAllStaticModelPaths();
      const subModelPaths = getAllStaticSubModelPaths();
      
      const totalPaths = brandPaths.length + modelPaths.length + subModelPaths.length;
      // console.log(`🎉 Generated ${totalPaths} total paths from STATIC CONTENT (ZERO API CALLS!):`);
      // console.log(`   - ${brandPaths.length} brand pages`);
      // console.log(`   - ${modelPaths.length} model pages`);
      // console.log(`   - ${subModelPaths.length} sub-model pages`);
      
      return {
        brandPaths,
        modelPaths,
        subModelPaths
      };
    } catch (error) {
      console.error('❌ Error using static content, falling back to batch generation:', error);
    }
  }

  // Fallback to batch generation if static content unavailable
  // console.log('⚠️ Static content unavailable, falling back to API batch generation...');
  return generateStaticPathsBatched();
}

/**
 * Batch path generation with rate limiting (LEGACY FALLBACK)
 * Use this only when static content is unavailable
 */
export async function generateStaticPathsBatched(batchSize: number = 5, delayMs: number = 200) {
  if (!isBuildTime) {
    // console.log('⚠️ Skipping batch generation - not in build environment');
    return {
      brandPaths: [] as { brand: string }[],
      modelPaths: [] as { brand: string; subBrand: string }[],
      subModelPaths: [] as { brand: string; subBrand: string; subBrandDetails: string }[]
    };
  }

  // console.log(`🔄 Starting LEGACY batch generation (batch size: ${batchSize}, delay: ${delayMs}ms)`);
  // console.log('💡 To avoid API calls, run: node scripts/generateSSGDataReal.js');
  
  const brands = await getAllCarBrands();
  
  if (brands.length === 0) {
    console.error('❌ No brands found - cannot generate paths');
    return {
      brandPaths: [],
      modelPaths: [],
      subModelPaths: []
    };
  }

  // console.log(`🚗 Processing ${brands.length} brands for full SSG generation...`);
  
  const allPaths = {
    brandPaths: [] as { brand: string }[],
    modelPaths: [] as { brand: string; subBrand: string }[],
    subModelPaths: [] as { brand: string; subBrand: string; subBrandDetails: string }[]
  };

  // Process brands in batches to avoid overwhelming the API
  for (let i = 0; i < brands.length; i += batchSize) {
    const brandBatch = brands.slice(i, i + batchSize);
    // console.log(`📊 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(brands.length/batchSize)}`);
    
    await Promise.all(brandBatch.map(async (brand) => {
      allPaths.brandPaths.push({ brand: brand.slug });
      
      try {
        const models = await getCarModelsForBrand(brand.slug);
        
        for (const model of models) {
          allPaths.modelPaths.push({ 
            brand: brand.slug, 
            subBrand: spacesToHyphens(model.c_modell)
          });

          // Add small delay between model requests
          await new Promise(resolve => setTimeout(resolve, 50));

          const subModels = await getCarSubModelsForModel(brand.slug, spacesToHyphens(model.c_modell));
          
          for (const subModel of subModels) {
            allPaths.subModelPaths.push({
              brand: brand.slug,
              subBrand: spacesToHyphens(model.c_modell),
              subBrandDetails: spacesToHyphens(subModel.c_typ)
            });
          }
        }
      } catch (error) {
        console.error(`❌ Error processing brand ${brand.title}:`, error);
      }
    }));

    // Add delay between batches
    if (i + batchSize < brands.length) {
      // console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const totalPaths = allPaths.brandPaths.length + allPaths.modelPaths.length + allPaths.subModelPaths.length;
  // console.log(`🎉 LEGACY batch generation complete! Generated ${totalPaths} total paths`);
  // console.log(`   - ${allPaths.brandPaths.length} brand pages`);
  // console.log(`   - ${allPaths.modelPaths.length} model pages`);
  // console.log(`   - ${allPaths.subModelPaths.length} sub-model pages`);

  return allPaths;
}

/**
 * Get static props data for components using STATIC CONTENT
 * This provides complete page data without API calls
 */
export async function getStaticPropsForPath(params: {
  brand?: string;
  subBrand?: string;
  subBrandDetails?: string;
}) {
  // Use static content if available
  if (isStaticContentAvailable()) {
    try {
      if (params.subBrandDetails && params.brand && params.subBrand) {
        // Get sub-model details data
        const subModelData = getStaticSubModelData(params.brand, params.subBrand, params.subBrandDetails);
        if (subModelData) {
          // console.log(`🎯 Loaded static sub-model data for ${params.brand}/${params.subBrand}/${params.subBrandDetails}`);
          return {
            brand: subModelData.brand,
            model: subModelData.model,
            subModel: subModelData.subModel,
            // Transform for component compatibility
            brandData: subModelData.brand,
            modelData: subModelData.model,
            subModelData: subModelData.subModel
          };
        }
      } else if (params.subBrand && params.brand) {
        // Get model data with sub-models
        const modelData = getStaticModelData(params.brand, params.subBrand);
        if (modelData) {
          // console.log(`🎯 Loaded static model data for ${params.brand}/${params.subBrand}`);
          return {
            brand: modelData.brand,
            model: modelData.model,
            subModels: modelData.subModels,
            // Transform for component compatibility
            brandData: modelData.brand,
            modelData: modelData.model,
            subModelsData: modelData.subModels
          };
        }
      } else if (params.brand) {
        // Get brand data with models
        const brandData = getStaticBrandData(params.brand);
        if (brandData) {
          // console.log(`🎯 Loaded static brand data for ${params.brand}`);
          const transformedData = transformBrandDataForComponent(brandData);
          return {
            brand: brandData.brand,
            models: brandData.models,
            // Transform for component compatibility
            brandData: brandData.brand,
            modelsData: transformedData.models
          };
        }
      }
    } catch (error) {
      console.error('Error loading static props:', error);
    }
  }

  // Fallback to legacy approach
  try {
    if (params.subBrandDetails) {
      return {
        brand: hyphensToSpaces(params.brand!),
        subBrand: hyphensToSpaces(params.subBrand!),
        subBrandDetails: hyphensToSpaces(params.subBrandDetails),
      };
    } else if (params.subBrand) {
      const subModels = await getCarSubModelsForModel(params.brand!, params.subBrand);
      return {
        brand: hyphensToSpaces(params.brand!),
        subBrand: hyphensToSpaces(params.subBrand),
        subModels,
      };
    } else if (params.brand) {
      const models = await getCarModelsForBrand(params.brand);
      return {
        brand: hyphensToSpaces(params.brand),
        models,
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting static props:', error);
    return {};
  }
}

/**
 * Get all car brands data for components (with full content)
 * This replaces the need for useCarBrands() hook API calls
 */
export function getStaticCarBrandsData() {
  if (isStaticContentAvailable()) {
    try {
      const staticBrands = getStaticCarBrands();
      return transformBrandsDataForComponent(staticBrands);
    } catch (error) {
      console.error('Error loading static brands data:', error);
    }
  }
  return [];
}

/**
 * Get car models data for a brand (with full content)
 * This replaces the need for useCarModels() hook API calls
 */
export function getStaticCarModelsData(brandSlug: string) {
  if (isStaticContentAvailable()) {
    try {
      const brandData = getStaticBrandData(brandSlug);
      if (brandData) {
        const transformedData = transformBrandDataForComponent(brandData);
        return transformedData.models;
      }
    } catch (error) {
      console.error(`Error loading static models data for ${brandSlug}:`, error);
    }
  }
  return [];
}

/**
 * NEW: Fetch bottom items data for a specific brand and model from @fordon dataset
 * PRIORITIZES static content over API calls to avoid slow queries on 1.4M records
 */
export async function getCarBottomItemsForModel(brandSlug: string, modelSlug: string): Promise<SSGBottomItem[]> {
  // First try: Use pre-generated static content (BEST OPTION - eliminates slow @fordon API calls!)
  if (isStaticContentAvailable()) {
    try {
      // console.log(`🎯 Using static content for bottom items (${brandSlug}/${modelSlug}) - avoiding slow @fordon API!`);
      const bottomItems = getStaticBottomItems(brandSlug, modelSlug);
      
      if (bottomItems && bottomItems.length > 0) {
        // console.log(`✅ Found ${bottomItems.length} static bottom items for ${brandSlug}/${modelSlug} (ZERO API CALLS to 1.4M dataset!)`);
        return bottomItems.map(item => ({
          id: item.id,
          C_merke: item.C_merke,
          C_modell: item.C_modell,
          Fordons_ar: item.Fordons_ar,
          C_typ: item.C_typ,
          C_bransle: item.C_bransle,
          C_kaross: item.C_kaross,
          C_vaxellada: item.C_vaxellada,
          Tjanstevikt: item.Tjanstevikt,
          Totalvikt: item.Totalvikt,
          link_NYA_12: item.link_NYA_12,
          image_url: item.image_url
        }));
      }
    } catch (error) {
      console.error(`❌ Error loading static bottom items for ${brandSlug}/${modelSlug}:`, error);
    }
  }

  // Fallback to API if static content unavailable and we're in build time
  // WARNING: This will be SLOW due to 1.4M @fordon records!
  if (isBuildTime) {
    try {
      // console.log(`🚗 ⚠️ WARNING: Fetching bottom items for ${brandSlug}/${modelSlug} from SLOW @fordon API (1.4M records)...`);
      
      // We need to get the merke_id first from sub-models
      const subModels = await carService.getCarSubModels(
        hyphensToSpaces(brandSlug),
        hyphensToSpaces(modelSlug)
      );
      
      if (subModels && subModels.length > 0) {
        const firstSubModel = subModels[0];
        const bottomItems = await carService.getCarSubModelBottomItems(
          firstSubModel.merke_id || '',
          firstSubModel.C_modell || ''
        );
        
        if (bottomItems && bottomItems.length > 0) {
          // console.log(`✅ Found ${bottomItems.length} bottom items for ${brandSlug}/${modelSlug} from SLOW @fordon API`);
          return bottomItems.slice(0, 9).map((item: any, index: number) => ({
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
            image_url: convertWixImageUrl(firstSubModel["Car Image"] || '')
          }));
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching bottom items for ${brandSlug}/${modelSlug} from @fordon API:`, error);
    }
  }

  return [];
}

/**
 * NEW: Generate complete model data including bottom items
 * This extends the existing model generation to include CarSuggestion data
 */
export async function generateModelWithBottomItems(brandSlug: string, modelSlug: string) {
  // console.log(`🚀 Generating complete model data with bottom items for ${brandSlug}/${modelSlug}...`);

  try {
    // Get the main model data
    const subModels = await getCarSubModelsForModel(brandSlug, modelSlug);
    
    // Get the bottom items data (from @fordon dataset)
    const bottomItems = await getCarBottomItemsForModel(brandSlug, modelSlug);
    
    // Generate bottom sections
    const firstSubModel = subModels[0];
    const bottomSections = firstSubModel ? [
      {
        title: `${firstSubModel.c_merke} ${firstSubModel.c_modell}`,
        description: `${firstSubModel.c_merke} ${firstSubModel.c_modell} - Ett tekniskt mästerverk`,
      },
      {
        title: `ALLA MODELLER ${firstSubModel.c_merke} ${firstSubModel.c_modell}`,
        description: `${firstSubModel.c_merke} ${firstSubModel.c_modell} är en serie av bilar som tillverkas av ${firstSubModel.c_merke}`,
      }
    ] : [];

    const result = {
      brandSlug,
      modelSlug,
      subModels,
      bottomItems,
      bottomSections,
      generatedAt: new Date().toISOString()
    };

    // console.log(`✅ Generated complete model data for ${brandSlug}/${modelSlug}:`);
    // console.log(`   - ${subModels.length} sub-models`);
    // console.log(`   - ${bottomItems.length} bottom items`);
    // console.log(`   - ${bottomSections.length} bottom sections`);

    return result;
  } catch (error) {
    console.error(`❌ Error generating model with bottom items for ${brandSlug}/${modelSlug}:`, error);
    return null;
  }
}

/**
 * NEW: Batch generate bottom items for all models
 * This pre-generates the slow @fordon data to eliminate runtime API calls
 */
export async function generateAllBottomItems(batchSize: number = 3, delayMs: number = 500) {
  if (!isBuildTime) {
    // console.log('⚠️ Skipping bottom items generation - not in build environment');
    return [];
  }

  // console.log(`🚀 Starting bottom items generation for ALL models (avoiding 1.4M @fordon queries!)...`);
  // console.log(`⚡ Batch size: ${batchSize}, delay: ${delayMs}ms (slower due to @fordon dataset complexity)`);
  
  const brands = await getAllCarBrands();
  const allBottomItems: any[] = [];
  let totalProcessed = 0;
  
  for (const brand of brands) {
    try {
      const models = await getCarModelsForBrand(brand.slug);
      // console.log(`📊 Processing ${models.length} models for brand: ${brand.title}`);
      
      // Process models in smaller batches due to @fordon complexity
      for (let i = 0; i < models.length; i += batchSize) {
        const modelBatch = models.slice(i, i + batchSize);
        
        await Promise.all(modelBatch.map(async (model) => {
          try {
            const modelWithBottomItems = await generateModelWithBottomItems(brand.slug, spacesToHyphens(model.c_modell));
            if (modelWithBottomItems) {
              allBottomItems.push(modelWithBottomItems);
              totalProcessed++;
            }
          } catch (error) {
            console.error(`❌ Error generating bottom items for ${brand.slug}/${model.c_modell}:`, error);
          }
        }));

        // Longer delay between batches due to @fordon dataset complexity
        if (i + batchSize < models.length) {
          // console.log(`⏳ Waiting ${delayMs}ms before next model batch (avoiding @fordon overload)...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      // Additional delay between brands
      // console.log(`⏳ Completed brand ${brand.title}. Waiting 1000ms before next brand...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing brand ${brand.title}:`, error);
    }
  }

  // console.log(`🎉 Bottom items generation complete!`);
  // console.log(`   - Processed ${totalProcessed} models`);
  // console.log(`   - Generated ${allBottomItems.length} complete model datasets`);
  // console.log(`   - 🚀 This eliminates THOUSANDS of slow @fordon API calls at runtime!`);

  return allBottomItems;
} 