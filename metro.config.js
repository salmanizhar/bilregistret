// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add CSS support for web
const { resolver: { sourceExts, assetExts } } = config;

// Add support for CSS/SCSS files
config.resolver.sourceExts = [...sourceExts, 'css', 'scss', 'sass'];

// Make sure CSS files are handled as assets
config.resolver.assetExts = assetExts.filter(ext => ext !== 'css');

// Add web-specific resolver for better CSS handling
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ignore problematic CSS font imports during build
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
