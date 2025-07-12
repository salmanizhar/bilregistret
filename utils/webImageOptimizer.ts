// EXTREME WEB IMAGE OPTIMIZATION
// Platform detection
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const isNative = !isWeb;

// Image optimization settings - WEB ONLY
const WEB_IMAGE_CONFIG = {
  // Aggressive lazy loading
  lazyLoadOffset: 100, // Start loading 100px before viewport
  preloadCritical: 3, // Preload first 3 images immediately
  compressionQuality: 80, // Balance quality vs size
  
  // Image formats by priority (modern web formats first)
  preferredFormats: ['webp', 'avif', 'jpg'],
  
  // Size optimizations
  maxWidth: {
    mobile: 400,
    tablet: 600, 
    desktop: 800
  },
  
  // Caching strategy
  cacheStrategy: 'aggressive',
  prefetchNext: 5 // Prefetch next 5 images in list
};

// AGGRESSIVE image URL optimizer for web
export function optimizeImageForWeb(
  originalUrl: string, 
  context: 'brand' | 'model' | 'detail' = 'model',
  priority: 'critical' | 'high' | 'normal' | 'lazy' = 'normal'
): string {
  // Native platforms: return original URL untouched
  if (isNative) {
    return originalUrl;
  }

  if (!originalUrl || !isWeb) return originalUrl;

  try {
    const url = new URL(originalUrl);
    
    // Different optimization strategies by context
    const sizeMap = {
      brand: { w: 120, h: 80, q: 85 }, // Small brand logos
      model: { w: 400, h: 300, q: 80 }, // Model images  
      detail: { w: 800, h: 600, q: 85 } // High detail images
    };

    const config = sizeMap[context];
    
    // CDN optimization parameters
    const params = new URLSearchParams();
    params.set('w', config.w.toString());
    params.set('h', config.h.toString());
    params.set('q', config.q.toString());
    params.set('f', 'webp'); // Force WebP for web
    params.set('fit', 'cover');
    params.set('auto', 'format,compress');
    
    // Priority-based loading
    if (priority === 'critical') {
      params.set('q', '90'); // Higher quality for critical images
    } else if (priority === 'lazy') {
      params.set('q', '75'); // Lower quality for lazy images
    }

    url.search = params.toString();
    return url.toString();
    
  } catch (error) {
    console.warn('Image optimization failed:', error);
    return originalUrl;
  }
}

// WEB: Aggressive image preloader
export class WebImagePreloader {
  private static instance: WebImagePreloader;
  private preloadedImages = new Set<string>();
  private preloadQueue: string[] = [];
  private isProcessing = false;

  static getInstance(): WebImagePreloader {
    if (!this.instance) {
      this.instance = new WebImagePreloader();
    }
    return this.instance;
  }

  // Preload critical images immediately
  preloadCritical(urls: string[]): void {
    if (isNative) return; // Skip on native

    urls.slice(0, WEB_IMAGE_CONFIG.preloadCritical).forEach(url => {
      if (!this.preloadedImages.has(url)) {
        this.preloadImage(url, 'critical');
      }
    });
  }

  // Queue images for lazy preloading
  queuePreload(urls: string[]): void {
    if (isNative) return; // Skip on native

    const newUrls = urls.filter(url => !this.preloadedImages.has(url));
    this.preloadQueue.push(...newUrls);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.preloadQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    
    // Process 3 images at a time to avoid overwhelming
    const batch = this.preloadQueue.splice(0, 3);
    
    await Promise.all(
      batch.map(url => this.preloadImage(url, 'normal'))
    );

    // Small delay between batches
    setTimeout(() => this.processQueue(), 100);
  }

  private preloadImage(url: string, priority: 'critical' | 'normal'): Promise<void> {
    return new Promise((resolve) => {
      if (this.preloadedImages.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(url);
        resolve();
      };
      img.onerror = () => resolve(); // Don't block on errors
      
      // Set loading priority
      if (priority === 'critical') {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      } else {
        img.loading = 'lazy';
        img.fetchPriority = 'low';
      }
      
      img.src = optimizeImageForWeb(url, 'model', priority);
    });
  }

  // Clear cache when memory gets tight
  clearCache(): void {
    this.preloadedImages.clear();
    this.preloadQueue.length = 0;
  }
}

// WEB: Intersection Observer for lazy loading
export class WebLazyImageObserver {
  private static observer: IntersectionObserver | null = null;
  private static callbacks = new Map<Element, () => void>();

  static init(): void {
    if (isNative || this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.callbacks.delete(entry.target);
              this.observer?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: `${WEB_IMAGE_CONFIG.lazyLoadOffset}px`,
        threshold: 0.1
      }
    );
  }

  static observe(element: Element, callback: () => void): void {
    if (isNative) {
      // Native: execute callback immediately
      callback();
      return;
    }

    if (!this.observer) this.init();
    
    this.callbacks.set(element, callback);
    this.observer?.observe(element);
  }

  static disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

// WEB: Smart image component factory
export function createOptimizedImageProps(
  originalUrl: string,
  context: 'brand' | 'model' | 'detail' = 'model',
  priority: 'critical' | 'high' | 'normal' | 'lazy' = 'normal'
) {
  // Native: return basic props
  if (isNative) {
    return {
      source: { uri: originalUrl },
      priority: 'normal' as const,
      cachePolicy: 'disk' as const,
      contentFit: 'cover' as const
    };
  }

  // Web: return optimized props
  const optimizedUrl = optimizeImageForWeb(originalUrl, context, priority);
  
  return {
    source: { uri: optimizedUrl },
    priority: priority === 'critical' ? 'high' as const : 'low' as const,
    cachePolicy: 'memory-disk' as const,
    contentFit: 'cover' as const,
    transition: priority === 'critical' ? 0 : 200,
    placeholder: priority === 'lazy' ? 'blur' as const : undefined,
    loading: priority === 'critical' ? 'eager' as const : 'lazy' as const,
    // Web-specific optimizations
    ...(isWeb && {
      onLoad: () => {
        // Prefetch next images when this one loads
        WebImagePreloader.getInstance().queuePreload([optimizedUrl]);
      }
    })
  };
}

// WEB: Viewport-based image size optimizer
export function getOptimalImageSize(): { width: number; height: number } {
  if (isNative) {
    return { width: 400, height: 300 }; // Default for native
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  if (vw <= 768) {
    return { width: 400, height: 300 }; // Mobile web
  } else if (vw <= 1200) {
    return { width: 600, height: 450 }; // Tablet web
  } else {
    return { width: 800, height: 600 }; // Desktop web
  }
}

// Initialize on web only
if (isWeb) {
  WebLazyImageObserver.init();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    WebLazyImageObserver.disconnect();
    WebImagePreloader.getInstance().clearCache();
  });
} 