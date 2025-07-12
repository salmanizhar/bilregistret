// Platform detection
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Import helper functions
import { convertWixImageUrl } from '@/constants/commonFunctions';

// Conditional imports - only import Node.js modules on web/server
let fs: any = null;
let path: any = null;

// Only import Node.js modules when running on web/server
if (!isWeb && isNode) {
  try {
    fs = require('fs');
    path = require('path');
  } catch (error) {
    console.warn('Could not load Node.js modules:', error);
  }
}

// Types for static content data
export interface StaticBrandData {
  id: string;
  merke_id: string;
  title: string;
  slug: string;
  brandimage: string;
  bannerimage: string;
  country_code: string;
  flags: string;
  originalData: any;
}

export interface StaticModelData {
  id: string;
  c_merke: string;
  c_modell: string;
  slug: string;
  yearRange: string;
  registeredCars: string;
  seats: string;
  imageUrl: string;
  fuelTypes: string[];
  bodyTypes: string[];
  engineTypes: string[];
  minYear: number;
  maxYear: number;
  originalData: any;
}

export interface StaticSubModelData {
  id: string;
  modell_id: string;
  c_merke: string;
  c_modell: string;
  c_typ: string;
  slug: string;
  yearRange: string;
  registeredCars: string;
  seats: string;
  imageUrl: string;
  C_chassi: string;
  engine: string;
  originalData: any;
  high_res: string;
}

// NEW: Bottom items data for CarSuggestion component
export interface StaticBottomItemData {
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

export interface BrandContentData {
  brand: StaticBrandData;
  models: StaticModelData[];
}

export interface ModelContentData {
  brand: StaticBrandData;
  model: StaticModelData;
  subModels: StaticSubModelData[];
  // NEW: Include bottom items for the suggestion section
  bottomItems?: StaticBottomItemData[];
  bottomSections?: {
    title: string;
    description: string;
  }[];
}

export interface SubModelContentData {
  brand: StaticBrandData;
  model: StaticModelData;
  subModel: StaticSubModelData;
}

// Helper function to load content from cache files (WEB ONLY)
function loadContentFromFile(filename: string): any | null {
  // Only work on server/build environments (not mobile)
  if (isWeb || !fs || !path) {
    return null; // Gracefully return null for mobile
  }

  try {
    const filePath = path.join(process.cwd(), '.ssg-cache', 'content', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error loading static content from ${filename}:`, error);
  }
  return null;
}

// Load all car brands (for CarBrand component) - WEB ONLY
export function getStaticCarBrands(): StaticBrandData[] {
  if (isWeb) {
    return []; // Return empty array on mobile - will trigger API fallback
  }

  const brands = loadContentFromFile('car-brands.json');
  return brands || [];
}

// Load specific brand data with models (for CarBrandSpecefic component) - WEB ONLY
export function getStaticBrandData(brandSlug: string): BrandContentData | null {
  if (isWeb) {
    return null; // Return null on mobile - will trigger API fallback
  }

  const brandData = loadContentFromFile(`brand-${brandSlug}.json`);
  return brandData;
}

// Load specific model data with sub-models (for CarBrandSpeceficSubModel component) - WEB ONLY
export function getStaticModelData(brandSlug: string, modelSlug: string): ModelContentData | null {
  if (isWeb) {
    return null; // Return null on mobile - will trigger API fallback
  }

  const modelKey = `${brandSlug}-${modelSlug}`;
  const modelData = loadContentFromFile(`model-${modelKey}.json`);
  return modelData;
}

// Load specific sub-model detailed data (for CarBrandSpeceficModelDetails component) - WEB ONLY
export function getStaticSubModelData(brandSlug: string, modelSlug: string, subModelSlug: string): SubModelContentData | null {
  if (isWeb) {
    return null; // Return null on mobile - will trigger API fallback
  }

  const subModelKey = `${brandSlug}-${modelSlug}-${subModelSlug}`;
  const subModelData = loadContentFromFile(`submodel-${subModelKey}.json`);
  return subModelData;
}

// NEW: Load bottom items data for CarSuggestion component - WEB ONLY
export function getStaticBottomItems(brandSlug: string, modelSlug: string): StaticBottomItemData[] {
  if (isWeb) {
    return []; // Return empty array on mobile - will trigger API fallback
  }

  const bottomItemsKey = `${brandSlug}-${modelSlug}`;
  const bottomItems = loadContentFromFile(`bottom-items-${bottomItemsKey}.json`);
  return bottomItems || [];
}

// Check if static content is available (WEB ONLY)
export function isStaticContentAvailable(): boolean {
  // Never available on mobile - always use API
  if (isWeb) {
    return false; // Mobile always uses API
  }

  if (!fs || !path) {
    return false; // Can't check files without fs
  }

  try {
    const cachePath = path.join(process.cwd(), '.ssg-cache', 'content');
    const carBrandsFile = path.join(cachePath, 'car-brands.json');

    // Check if both directory and main file exist
    const hasDirectory = fs.existsSync(cachePath);
    const hasMainFile = fs.existsSync(carBrandsFile);

    if (hasDirectory && hasMainFile) {
      // console.log('🌐 SSG content available - using static files (ZERO API CALLS!)');
      return true;
    } else {
      // console.log('⚠️ SSG content not found - will use API fallback');
      return false;
    }
  } catch (error) {
    // console.log('⚠️ Error checking SSG content - will use API fallback:', error);
    return false;
  }
}

// Transform API data to component format (for backward compatibility)
export function transformBrandDataForComponent(brandData: BrandContentData): any {
  return {
    brand: brandData.brand,
    models: brandData.models.map(model => ({
      id: model.id,
      modelName: model.c_modell,
      title: `${model.c_merke} ${model.c_modell}`,
      c_merke: model.c_merke,
      yearRange: model.yearRange,
      registeredCars: model.registeredCars,
      seats: model.seats,
      imageUrl: model.imageUrl,
      fuelTypes: model.fuelTypes,
      bodyTypes: model.bodyTypes,
      engineTypes: model.engineTypes,
      minYear: model.minYear,
      maxYear: model.maxYear,
      // Include original fields for component compatibility
      ID: model.id,
      C_merke: model.c_merke,
      C_modell: model.c_modell,
      MINI_AR: model.minYear.toString(),
      MAX_YEAR: model.maxYear.toString(),
      t_count: model.registeredCars,
      "Car Image": model.imageUrl,
      BRANSLE_SAMLAD: model.fuelTypes.join(','),
      kaross_samlad: model.bodyTypes.join(','),
      HJUL_DRIFT_SAMLAD: model.engineTypes.join(','),
      minSeats: model.seats.split('-')[0],
      maxSeats: model.seats.split('-')[1] || model.seats.split('-')[0]
    }))
  };
}

// Transform brands data for CarBrand component
export function transformBrandsDataForComponent(brands: StaticBrandData[]): any[] {
  return brands.map(brand => ({
    id: parseInt(brand.id),
    merke_id: parseInt(brand.merke_id),
    title: brand.title,
    brandimage: brand.brandimage,
    bannerimage: brand.bannerimage,
    country_code: brand.country_code,
    flags: brand.flags
  }));
}

// Helper to generate static paths for Next.js/Expo Router (WEB ONLY)
export function getAllStaticBrandPaths(): { brand: string }[] {
  if (isWeb || !isStaticContentAvailable()) {
    return [];
  }

  const brands = getStaticCarBrands();
  return brands.map(brand => ({ brand: brand.slug }));
}

export function getAllStaticModelPaths(): { brand: string; subBrand: string }[] {
  if (isWeb || !isStaticContentAvailable()) {
    return [];
  }

  const brands = getStaticCarBrands();
  const paths: { brand: string; subBrand: string }[] = [];

  brands.forEach(brand => {
    const brandData = getStaticBrandData(brand.slug);
    if (brandData) {
      brandData.models.forEach(model => {
        paths.push({
          brand: brand.slug,
          subBrand: model.slug
        });
      });
    }
  });

  return paths;
}

export function getAllStaticSubModelPaths(): { brand: string; subBrand: string; subBrandDetails: string }[] {
  if (isWeb || !isStaticContentAvailable()) {
    return [];
  }

  const brands = getStaticCarBrands();
  const paths: { brand: string; subBrand: string; subBrandDetails: string }[] = [];

  brands.forEach(brand => {
    const brandData = getStaticBrandData(brand.slug);
    if (brandData) {
      brandData.models.forEach(model => {
        const modelData = getStaticModelData(brand.slug, model.slug);
        if (modelData) {
          modelData.subModels.forEach(subModel => {
            // Skip subModels with empty or invalid slugs
            if (subModel.slug && subModel.slug.trim() !== '') {
              paths.push({
                brand: brand.slug,
                subBrand: model.slug,
                subBrandDetails: subModel.slug
              });
            } else {
              // console.log(`⚠️ Skipping sub-model with empty slug: ${brand.slug}/${model.slug}/${subModel.c_typ || 'unknown'}`);
            }
          });
        }
      });
    }
  });

  return paths;
}

// NEW: Synchronous SSG data functions (ZERO loading states!)
export function getSSGCarBrands(): any[] {
  if (isWeb) {
    return []; // Mobile fallback
  }

  try {
    const staticBrands = getStaticCarBrands();
    if (staticBrands && staticBrands.length > 0) {
      // console.log('🚀 SSG: Loaded brands synchronously (ZERO loading time!)');
      return transformBrandsDataForComponent(staticBrands);
    }
  } catch (error) {
    console.error('SSG brands loading error:', error);
  }

  return [];
}

export function getSSGBrandModels(brandSlug: string): any[] {
  if (isWeb) {
    return []; // Mobile fallback
  }

  try {
    const brandData = getStaticBrandData(brandSlug);
    if (brandData && brandData.models) {
      // console.log(`🚀 SSG: Loaded ${brandData.models.length} models synchronously for ${brandSlug}`);
      const transformedData = transformBrandDataForComponent(brandData);
      return transformedData.models;
    }
  } catch (error) {
    console.error(`SSG models loading error for ${brandSlug}:`, error);
  }

  return [];
}

export function getSSGModelSubModels(brandSlug: string, modelSlug: string): any[] {
  if (isWeb) {
    return []; // Mobile fallback
  }

  try {
    const modelData = getStaticModelData(brandSlug, modelSlug);
    if (modelData && modelData.subModels) {
      // console.log(`🚀 SSG: Loaded ${modelData.subModels.length} sub-models synchronously for ${brandSlug}/${modelSlug}`);
      return modelData.subModels.map(subModel => ({
        // Transform to match expected component format
        ID: subModel.id,
        modell_id: subModel.modell_id,
        C_merke: subModel.c_merke,
        C_modell: subModel.c_modell,
        C_typ: subModel.c_typ,
        ar_fra: subModel.yearRange.split(' - ')[0] || '',
        ar_till: subModel.yearRange.split(' - ')[1] || '',
        t_count: subModel.registeredCars,
        "Car Image": subModel.imageUrl,
        "high_res": subModel.high_res,
        C_chassi: subModel.C_chassi,
        C_bransle: subModel.engine,
        minSeats: subModel.seats.split('-')[0] || '0',
        maxSeats: subModel.seats.split('-')[1] || subModel.seats.split('-')[0] || '0'
      }));
    }
  } catch (error) {
    console.error(`SSG sub-models loading error for ${brandSlug}/${modelSlug}:`, error);
  }

  return [];
}

export function getSSGSubModelDetails(brandSlug: string, modelSlug: string, subModelSlug: string): any | null {
  if (isWeb) {
    return null; // Mobile fallback
  }

  try {
    const subModelData = getStaticSubModelData(brandSlug, modelSlug, subModelSlug);
    if (subModelData) {
      // console.log(`🚀 SSG: Loaded sub-model details synchronously for ${brandSlug}/${modelSlug}/${subModelSlug}`);
      return {
        brand: subModelData.brand,
        model: subModelData.model,
        subModel: {
          // Transform to match expected format
          ID: subModelData.subModel.id,
          modell_id: subModelData.subModel.modell_id,
          C_merke: subModelData.subModel.c_merke,
          C_modell: subModelData.subModel.c_modell,
          C_typ: subModelData.subModel.c_typ,
          ar_fra: subModelData.subModel.yearRange.split(' - ')[0] || '',
          ar_till: subModelData.subModel.yearRange.split(' - ')[1] || '',
          t_count: subModelData.subModel.registeredCars,
          "Car Image": subModelData.subModel.imageUrl,
          C_chassi: subModelData.subModel.C_chassi,
          C_bransle: subModelData.subModel.engine,
          minSeats: subModelData.subModel.seats.split('-')[0] || '0',
          maxSeats: subModelData.subModel.seats.split('-')[1] || subModelData.subModel.seats.split('-')[0] || '0'
        }
      };
    }
  } catch (error) {
    console.error(`SSG sub-model details loading error for ${brandSlug}/${modelSlug}/${subModelSlug}:`, error);
  }

  return null;
}

// NEW: SSG function for bottom items data (INSTANT loading!)
export function getSSGBottomItems(brandSlug: string, modelSlug: string): StaticBottomItemData[] {
  if (isWeb) {
    return []; // Mobile fallback
  }

  try {
    const bottomItems = getStaticBottomItems(brandSlug, modelSlug);
    if (bottomItems && bottomItems.length > 0) {
      // console.log(`🚀 SSG: Loaded ${bottomItems.length} bottom items synchronously for ${brandSlug}/${modelSlug} (ZERO API CALLS!)`);
      return bottomItems;
    }
  } catch (error) {
    console.error(`SSG bottom items loading error for ${brandSlug}/${modelSlug}:`, error);
  }

  return [];
}

// NEW: Transform bottom items to CarSuggestion format
export function transformBottomItemsForCarSuggestion(
  bottomItems: StaticBottomItemData[],
  mainSubModel?: any
): any[] {
  if (!bottomItems || bottomItems.length === 0) {
    return [];
  }

  // Limit to max 9 items as per current implementation
  const maxItems = Math.min(bottomItems.length, 9);

  return bottomItems.slice(0, maxItems).map((bottomItem, index) => ({
    id: String(index + 1),
    image_url: bottomItem.image_url || (mainSubModel?.["Car Image"] ? convertWixImageUrl(mainSubModel["Car Image"]) : ''),
    title: `${bottomItem.C_merke} ${bottomItem.C_modell} ${bottomItem.Fordons_ar}`,
    description: `${bottomItem.C_merke} ${bottomItem.C_modell} ${bottomItem.Fordons_ar} ${bottomItem.C_typ} med ${bottomItem.C_bransle.toLowerCase()} motor ${bottomItem.C_kaross.toLowerCase()} med ${bottomItem?.C_vaxellada?.toLowerCase() || ''} växellåda som har en tjänstevikt på ${bottomItem.Tjanstevikt} kg och totalvikt ${bottomItem.Totalvikt} kg.`.trim(),
    slug: bottomItem.link_NYA_12
  }));
}

// NEW: Generate bottom sections for CarSuggestion
export function generateBottomSections(
  brandSlug: string,
  modelSlug: string,
  subModel?: any
): any[] {
  if (!subModel) {
    return [];
  }

  const brandName = subModel.C_merke || '';
  const modelName = subModel.C_modell || '';
  const fullTitle = `${brandName} ${modelName}`;

  return [
    {
      title: fullTitle,
      description: subModel["model description"] || `${fullTitle} - Ett tekniskt mästerverk`,
    },
    {
      title: `ALLA MODELLER ${brandName} ${modelName}`,
      description: subModel["all model description"] || `${brandName} ${modelName} är en serie av bilar som tillverkas av ${brandName}`,
    }
  ];
}

// Helper to detect if we're in SSG mode
export function isSSGMode(): boolean {
  // SSG mode is ONLY available on desktop web with static content
  if (isWeb) {
    return false; // Mobile never has SSG mode
  }

  // Desktop web: Check if we have static content AND we're not in development
  const hasStaticContent = isStaticContentAvailable();
  const isProduction = process.env.NODE_ENV === 'production';
  // Enable SSG even in development when SSG_TEST=1 is set.
  const isTestOverride = process.env.SSG_TEST === '1';

  const ssgMode = hasStaticContent && (isProduction || isTestOverride);

  if (ssgMode) {
    // console.log('🚀 SSG MODE: Using pre-rendered static content (ZERO API calls!)');
  }

  return ssgMode;
}

// Helper to detect if we should completely avoid API logic
export function shouldAvoidAPILogic(): boolean {
  return isSSGMode(); // In SSG mode, completely avoid API instantiation
}

// Performance logging for SSG optimization
export function logSSGPerformance(componentName: string, dataCount: number) {
  if (isSSGMode()) {
    // console.log(`⚡ SSG PERFORMANCE: ${componentName} loaded ${dataCount} items instantly (0ms API time)`);
  }
}