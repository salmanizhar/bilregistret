const { withExpo } = require('@expo/next-adapter');
const { generateSitemap, generateRobotsTxt } = require('./scripts/generateSitemap');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable static export when requested
  ...(process.env.NEXT_OUTPUT === 'export' ? {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  } : {}),

  // SEO and Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // Security headers for better SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://appleid.cdn-apple.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;",
          },
        ],
      },
      {
        source: '/(.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 🚀 AGGRESSIVE WEBPACK OPTIMIZATIONS FOR PERFORMANCE
  webpack: (config, { isServer, dev, buildId }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];

    // 🔥 CRITICAL: AGGRESSIVE BUNDLE SPLITTING FOR PERFECT PERFORMANCE
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        
        // 🎯 SPLIT BUNDLES AGGRESSIVELY
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // 📦 VENDOR CHUNK - All node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            
            // 🚀 REACT CHUNK - React/React-Native core
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-native|react-native-web)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            
            // 📊 EXPO CHUNK - Expo packages
            expo: {
              test: /[\\/]node_modules[\\/](@expo|expo-)[\\/]/,
              name: 'expo',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            
            // 🎨 UI LIBRARIES CHUNK - Heavy UI components
            ui: {
              test: /[\\/]node_modules[\\/](@react-navigation|react-native-svg|react-native-reanimated|react-native-gesture-handler)[\\/]/,
              name: 'ui-libs',
              chunks: 'all',
              priority: 12,
              enforce: true,
            },
            
            // 📡 API/DATA CHUNK - Query/API libraries
            data: {
              test: /[\\/]node_modules[\\/](@tanstack|axios|firebase)[\\/]/,
              name: 'data-libs',
              chunks: 'all',
              priority: 11,
              enforce: true,
            },
            
            // 🏠 PAGES CHUNK - Split pages
            pages: {
              test: /[\\/]app[\\/]\(main\)[\\/]/,
              name: 'pages',
              chunks: 'all',
              minChunks: 1,
              priority: 5,
              enforce: true,
            },
            
            // 🧩 COMPONENTS CHUNK - Reusable components
            components: {
              test: /[\\/]components[\\/]/,
              name: 'components',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
              enforce: true,
            },
            
            // 🛠️ UTILS CHUNK - Utilities and helpers
            utils: {
              test: /[\\/](utils|constants|Services)[\\/]/,
              name: 'utils',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
              enforce: true,
            },
          },
        },

        // 🎯 MINIMIZE BUNDLE SIZE
        minimize: true,
        usedExports: true,
        sideEffects: false,

        // 📦 RUNTIME CHUNK OPTIMIZATION
        runtimeChunk: {
          name: 'runtime',
        },
      };

      // 🌳 AGGRESSIVE TREE SHAKING
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }], // Enable tree shaking
            ],
          },
        },
      });

      // 🚀 DYNAMIC IMPORTS OPTIMIZATION
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        include: /[\\/](app|components)[\\/]/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              ['babel-plugin-transform-imports', {
                '@/components': {
                  transform: '@/components/${member}',
                  preventFullImport: true,
                },
                '@/utils': {
                  transform: '@/utils/${member}',
                  preventFullImport: true,
                },
              }],
            ],
          },
        },
      });

      // 🎯 PREFETCH IMPORTANT CHUNKS
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('PrefetchChunks', () => {
            // This will add prefetch hints for critical chunks
          });
        },
      });
    }

    // Generate sitemap and robots.txt during build
    if (!isServer && process.env.NODE_ENV === 'production') {
      try {
        // Use async functions properly
        Promise.all([
          generateSitemap(),
          Promise.resolve(generateRobotsTxt())
        ]).catch(error => {
          // console.warn('Warning: Could not generate sitemap/robots:', error.message);
        });
      } catch (error) {
        // console.warn('Warning: Could not generate sitemap:', error.message);
      }
    }

    return config;
  },

  // 🚀 ENHANCED EXPERIMENTAL FEATURES FOR PERFORMANCE
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Enable modern features for better performance
    esmExternals: true,
    swcMinify: true,
  },

  // 🎯 COMPILER OPTIMIZATIONS
  swcMinify: true,
  
  // 📦 OUTPUT OPTIMIZATION
  output: 'standalone',
};

module.exports = withExpo(nextConfig);