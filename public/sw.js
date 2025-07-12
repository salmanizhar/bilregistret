// 🚀 AGGRESSIVE SERVICE WORKER FOR PERFECT PERFORMANCE
// Version your service worker to force updates
const CACHE_VERSION = 'bilregistret-v1.0.3-perf';

// Cache names
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// 🎯 CRITICAL RESOURCES - Cache immediately for instant loading
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  // Critical CSS and JS will be added by webpack
];

// 🚀 STATIC RESOURCES - Cache aggressively
const STATIC_RESOURCES = [
  // Fonts
  '/assets/fonts/',
  // Icons and images
  '/assets/images/',
  '/assets/icons/',
  // CSS and JS chunks
  '/static/chunks/',
  '/static/css/',
  '/static/js/',
];

// 🎯 DYNAMIC RESOURCES - Cache with network fallback
const DYNAMIC_RESOURCES = [
  '/api/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
  'https://www.google-analytics.com/',
];

// 🚀 INSTALL: Cache critical resources immediately
self.addEventListener('install', (event) => {
  console.log('🚀 ServiceWorker: Installing for perfect performance...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url => url !== '/'));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// 🎯 ACTIVATE: Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('🎯 ServiceWorker: Activating performance optimizations...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🧹 ServiceWorker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// 🚀 FETCH: Aggressive caching strategy for perfect performance
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip extension and dev requests
  if (url.pathname.includes('chrome-extension') || 
      url.pathname.includes('__nextjs') ||
      url.pathname.includes('_next/webpack-hmr')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// 🎯 SMART CACHING STRATEGY
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 🚀 STATIC RESOURCES: Cache First (instant loading)
    if (isStaticResource(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // 🎨 IMAGES: Cache First with compression
    if (isImageResource(url)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // 📡 API CALLS: Network First with cache fallback
    if (isAPIResource(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // 📄 HTML PAGES: Stale While Revalidate for instant navigation
    if (isHTMLResource(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // 🌐 EXTERNAL RESOURCES: Network First
    if (isExternalResource(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // 🔄 DEFAULT: Network with cache fallback
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.warn('🚨 ServiceWorker fetch error:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for HTML
    if (isHTMLResource(url)) {
      return new Response(
        '<html><body><h1>Offline</h1><p>You are offline. Please check your connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// 🚀 CACHE FIRST: For static resources (instant loading)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached version immediately
    return cachedResponse;
  }
  
  // Fetch and cache if not found
  const networkResponse = await fetch(request);
  if (networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// 📡 NETWORK FIRST: For dynamic content
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 🔄 STALE WHILE REVALIDATE: For HTML pages (instant navigation)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors for background updates
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cached version
  return await fetchPromise;
}

// 🎯 RESOURCE TYPE DETECTION
function isStaticResource(url) {
  return STATIC_RESOURCES.some(pattern => url.pathname.includes(pattern)) ||
         url.pathname.match(/\.(js|css|woff2?|eot|ttf|otf)$/);
}

function isImageResource(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/);
}

function isAPIResource(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('api.') ||
         DYNAMIC_RESOURCES.some(pattern => url.href.includes(pattern));
}

function isHTMLResource(url) {
  return url.pathname === '/' || 
         url.pathname.match(/\.html?$/) ||
         (!url.pathname.includes('.') && !url.pathname.startsWith('/api/'));
}

function isExternalResource(url) {
  return url.origin !== self.location.origin;
}

// 🧹 BACKGROUND SYNC: Clean up old cache entries
function cleanupOldCaches() {
  const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  
  caches.keys().then((cacheNames) => {
    cacheNames.forEach(async (cacheName) => {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      keys.forEach(async (request) => {
        const response = await cache.match(request);
        if (response) {
          const date = response.headers.get('date');
          if (date && (now - new Date(date).getTime()) > MAX_CACHE_AGE) {
            cache.delete(request);
          }
        }
      });
    });
  });
}

// Clean up old caches periodically
setInterval(cleanupOldCaches, 60 * 60 * 1000); // Every hour

console.log('🚀 ServiceWorker: Performance optimization ready!'); 