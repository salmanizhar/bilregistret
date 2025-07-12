// Custom image loader for static export
export default function imageLoader({ src, width, quality }) {
  // For static export, return the original src
  // In production, you might want to integrate with a CDN
  return src;
} 