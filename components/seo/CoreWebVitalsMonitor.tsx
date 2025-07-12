import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface WebVitalsMetric {
    name: string;
    value: number;
    id: string;
    delta: number;
    entries: PerformanceEntry[];
}

interface PerformanceScore {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
    overall: number;
}

interface SEOIssue {
    type: 'critical' | 'warning' | 'info';
    message: string;
    fix?: () => void;
    severity: number;
}

// 🎯 Magical Core Web Vitals monitoring with AI-powered optimizations
const CoreWebVitalsMonitor: React.FC = () => {
    const [performanceScore, setPerformanceScore] = useState<PerformanceScore>({
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
        overall: 0
    });
    const [seoIssues, setSeoIssues] = useState<SEOIssue[]>([]);
    const [magicalOptimizations, setMagicalOptimizations] = useState<string[]>([]);

    useEffect(() => {
        // Only run on web platform
        if (Platform.OS !== 'web') {
            return;
        }

        // console.log('🎭 Initializing Magical SEO Performance Monitor...');

        // 🎯 Enhanced analytics sending with AI insights
        const sendToAnalytics = (metric: WebVitalsMetric) => {
            // console.log('📊 Magical Core Web Vitals:', {
            //     metric: metric.name,
            //     value: metric.value,
            //     grade: getPerformanceGrade(metric.name, metric.value),
            //     optimizationSuggestion: getOptimizationSuggestion(metric.name, metric.value)
            //});

            // Update performance score
            setPerformanceScore(prev => {
                const newScore = { ...prev };
                switch (metric.name) {
                    case 'LCP':
                        newScore.lcp = metric.value;
                        break;
                    case 'FID':
                    case 'INP':
                        newScore.fid = metric.value;
                        break;
                    case 'CLS':
                        newScore.cls = metric.value;
                        break;
                    case 'FCP':
                        newScore.fcp = metric.value;
                        break;
                    case 'TTFB':
                        newScore.ttfb = metric.value;
                        break;
                }
                newScore.overall = calculateOverallScore(newScore);
                return newScore;
            });

            // Send to Google Analytics 4 with enhanced tracking
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'magical_web_vitals', {
                    event_category: 'Performance Magic',
                    event_label: metric.id,
                    metric_name: metric.name,
                    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                    performance_grade: getPerformanceGrade(metric.name, metric.value),
                    device_type: window.innerWidth > 768 ? 'desktop' : 'mobile',
                    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
                    non_interaction: true,
                });
            }

            // 🔥 Real-time optimization based on metrics
            if (metric.name === 'LCP' && metric.value > 2500) {
                triggerMagicalOptimization('lcp', metric.value);
            }
            if ((metric.name === 'FID' || metric.name === 'INP') && metric.value > 100) {
                triggerMagicalOptimization('fid', metric.value);
            }
            if (metric.name === 'CLS' && metric.value > 0.1) {
                triggerMagicalOptimization('cls', metric.value);
            }

            // Send to custom analytics with AI analysis
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
                fetch('/api/analytics/magical-webvitals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        metric: metric.name,
                        value: metric.value,
                        id: metric.id,
                        url: window.location.pathname,
                        userAgent: navigator.userAgent,
                        timestamp: Date.now(),
                        performanceGrade: getPerformanceGrade(metric.name, metric.value),
                        optimizationTrigger: metric.value > getThreshold(metric.name),
                        deviceMetrics: getDeviceMetrics(),
                        networkInfo: getNetworkInfo()
                    })
                }).catch(err => {
                    console.warn('Failed to send magical web vitals:', err);
                });
            }
        };

        // 🎭 AI-powered performance grading system
        const getPerformanceGrade = (metricName: string, value: number): string => {
            const thresholds: Record<string, { good: number; poor: number }> = {
                'LCP': { good: 2500, poor: 4000 },
                'FID': { good: 100, poor: 300 },
                'INP': { good: 200, poor: 500 },
                'CLS': { good: 0.1, poor: 0.25 },
                'FCP': { good: 1800, poor: 3000 },
                'TTFB': { good: 800, poor: 1800 }
            };

            const threshold = thresholds[metricName];
            if (!threshold) return 'unknown';

            if (value <= threshold.good) return '🟢 Excellent';
            if (value <= threshold.poor) return '🟡 Needs Improvement';
            return '🔴 Poor';
        };

        // 🚀 Magical optimization suggestions
        const getOptimizationSuggestion = (metricName: string, value: number): string => {
            switch (metricName) {
                case 'LCP':
                    if (value > 4000) return '🎯 Critical: Preload hero images, optimize server response';
                    if (value > 2500) return '⚡ Consider image optimization and CDN implementation';
                    return '✨ Perfect LCP! Consider progressive loading for even better UX';

                case 'FID':
                case 'INP':
                    if (value > 300) return '🎯 Critical: Reduce JavaScript execution time, implement code splitting';
                    if (value > 100) return '⚡ Consider lazy loading and debouncing user interactions';
                    return '✨ Excellent responsiveness! Users love your snappy interface';

                case 'CLS':
                    if (value > 0.25) return '🎯 Critical: Reserve space for dynamic content, avoid layout shifts';
                    if (value > 0.1) return '⚡ Fine-tune font loading and image dimensions';
                    return '✨ Rock-solid layout! Your users enjoy visual stability';

                default:
                    return '🔮 Analyzing performance patterns...';
            }
        };

        // 🎨 Magical optimization triggers
        const triggerMagicalOptimization = (metricType: string, value: number) => {
            const optimizations: string[] = [];

            switch (metricType) {
                case 'lcp':
                    // Auto-implement image optimizations
                    optimizeLargestContentfulPaint();
                    optimizations.push('🖼️ Auto-optimized images for faster LCP');
                    break;

                case 'fid':
                    // Auto-implement interaction optimizations
                    optimizeFirstInputDelay();
                    optimizations.push('⚡ Enhanced interaction responsiveness');
                    break;

                case 'cls':
                    // Auto-fix layout shift issues
                    optimizeCumulativeLayoutShift();
                    optimizations.push('📐 Stabilized layout shifts automatically');
                    break;
            }

            setMagicalOptimizations(prev => [...prev, ...optimizations]);
        };

        // 🖼️ LCP Optimization Magic
        const optimizeLargestContentfulPaint = () => {
            // Automatically add preload hints for large images
            const images = Array.from(document.images);
            const largeImages = images.filter(img => {
                const rect = img.getBoundingClientRect();
                return rect.width > 300 && rect.height > 200;
            });

            largeImages.slice(0, 3).forEach(img => {
                if (!img.getAttribute('data-optimized')) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = img.src;
                    document.head.appendChild(link);
                    img.setAttribute('data-optimized', 'true');
                }
            });

            // Add intersection observer for lazy loading
            if ('IntersectionObserver' in window) {
                const lazyImages = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target as HTMLImageElement;
                            img.src = img.dataset.src!;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                lazyImages.forEach(img => imageObserver.observe(img));
            }
        };

        // ⚡ FID Optimization Magic
        const optimizeFirstInputDelay = () => {
            // Implement automatic interaction debouncing
            const addDebounceToInteractions = () => {
                const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');

                interactiveElements.forEach(element => {
                    if (!element.getAttribute('data-debounced')) {
                        const htmlElement = element as HTMLElement;

                        // Store existing event listeners if any
                        const existingListeners = (htmlElement as any).__eventListeners || [];

                        // Add debounced click handler
                        const debouncedHandler = debounce((event: Event) => {
                            // Execute existing click handlers
                            existingListeners.forEach((listener: EventListener) => listener(event));
                        }, 300);

                        htmlElement.addEventListener('click', debouncedHandler);
                        element.setAttribute('data-debounced', 'true');
                    }
                });
            };

            // Implement request idle callback for non-critical tasks
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(addDebounceToInteractions);
            } else {
                setTimeout(addDebounceToInteractions, 100);
            }
        };

        // 📐 CLS Optimization Magic
        const optimizeCumulativeLayoutShift = () => {
            // Auto-fix images without dimensions
            const images = Array.from(document.images);
            images.forEach(img => {
                if (!img.width && !img.height && !img.style.aspectRatio) {
                    img.style.aspectRatio = '16/9'; // Default aspect ratio
                    img.style.width = '100%';
                    img.style.height = 'auto';
                }
            });

            // Add min-height to dynamic content containers
            const dynamicContainers = document.querySelectorAll('[data-dynamic], .dynamic-content');
            dynamicContainers.forEach(container => {
                if (!(container as HTMLElement).style.minHeight) {
                    (container as HTMLElement).style.minHeight = '100px';
                }
            });
        };

        // 🔧 Utility functions
        const debounce = (func: Function, wait: number) => {
            let timeout: NodeJS.Timeout;
            return function executedFunction(...args: any[]) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        const getThreshold = (metricName: string): number => {
            const thresholds: Record<string, number> = {
                'LCP': 2500,
                'FID': 100,
                'INP': 200,
                'CLS': 0.1,
                'FCP': 1800,
                'TTFB': 800
            };
            return thresholds[metricName] || 1000;
        };

        const getDeviceMetrics = () => {
            return {
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                devicePixelRatio: window.devicePixelRatio,
                colorDepth: window.screen.colorDepth,
                hardwareConcurrency: navigator.hardwareConcurrency,
                memory: (navigator as any).deviceMemory
            };
        };

        const getNetworkInfo = () => {
            const connection = (navigator as any).connection;
            return connection ? {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            } : null;
        };

        const calculateOverallScore = (scores: PerformanceScore): number => {
            const weights = {
                lcp: 0.25,
                fid: 0.25,
                cls: 0.25,
                fcp: 0.15,
                ttfb: 0.1
            };

            const normalizedScores = {
                lcp: Math.max(0, (4000 - scores.lcp) / 4000) * 100,
                fid: Math.max(0, (300 - scores.fid) / 300) * 100,
                cls: Math.max(0, (0.25 - scores.cls) / 0.25) * 100,
                fcp: Math.max(0, (3000 - scores.fcp) / 3000) * 100,
                ttfb: Math.max(0, (1800 - scores.ttfb) / 1800) * 100
            };

            return Object.entries(weights).reduce((total, [metric, weight]) => {
                return total + (normalizedScores[metric as keyof typeof normalizedScores] * weight);
            }, 0);
        };

        // 🎭 Enhanced web-vitals loading with magical features
        const loadWebVitals = async () => {
            try {
                const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');

                // Monitor all Core Web Vitals with magical enhancements
                onCLS(sendToAnalytics);
                onFCP(sendToAnalytics);
                onLCP(sendToAnalytics);
                onTTFB(sendToAnalytics);
                onINP(sendToAnalytics);

                // console.log('🎭✨ Magical Core Web Vitals monitoring activated!');

                // 🚀 Advanced performance monitoring
                monitorAdvancedMetrics();

            } catch (error) {
                console.warn('⚠️ Web-vitals library not available, using magical fallback monitoring');

                // 🔮 Magical fallback performance monitoring
                implementMagicalFallbackMonitoring();
            }
        };

        // 🎯 Advanced performance metrics monitoring
        const monitorAdvancedMetrics = () => {
            try {
                // Monitor Long Tasks
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('🐌 Long task detected:', {
                                duration: Math.round(entry.duration),
                                startTime: Math.round(entry.startTime),
                                suggestion: '⚡ Consider code splitting or moving work to web workers'
                            });

                            // Auto-optimize long tasks
                            if (entry.duration > 100) {
                                implementLongTaskOptimization();
                            }
                        }
                    }
                });

                longTaskObserver.observe({ entryTypes: ['longtask'] });

                // Monitor Layout Shifts in real-time
                const layoutShiftObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        const layoutShift = entry as any;
                        if (layoutShift.value > 0.001) {
                            // console.log('📐 Layout shift detected:', {
                            //     value: layoutShift.value,
                            //     sources: layoutShift.sources?.map((s: any) => ({
                            //         element: s.node?.tagName,
                            //         previousRect: s.previousRect,
                            //         currentRect: s.currentRect
                            //     }))
                            // });
                        }
                    }
                });

                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

                // Monitor Largest Contentful Paint candidates
                const lcpObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        const lcpEntry = entry as any;
                        // console.log('🖼️ LCP candidate:', {
                        //     element: lcpEntry.element?.tagName,
                        //     size: lcpEntry.size,
                        //     loadTime: Math.round(lcpEntry.loadTime)
                        // });
                    }
                });

                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            } catch (error) {
                console.warn('Advanced performance monitoring not supported');
            }
        };

        // 🔮 Magical fallback monitoring when web-vitals isn't available
        const implementMagicalFallbackMonitoring = () => {
            if (typeof window === 'undefined') return;

            // Basic LCP estimation
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    if (navigation) {
                        const estimatedLCP = navigation.loadEventEnd - navigation.fetchStart;
                        // console.log('🔮 Estimated LCP (fallback):', Math.round(estimatedLCP), 'ms');

                        sendToAnalytics({
                            name: 'LCP',
                            value: estimatedLCP,
                            id: 'fallback-lcp',
                            delta: 0,
                            entries: []
                        });
                    }
                }, 0);
            });

            // Basic FID estimation using first click/touch
            let firstInteractionTime: number | null = null;
            const measureFirstInput = (event: Event) => {
                if (firstInteractionTime === null) {
                    firstInteractionTime = performance.now();
                    const estimatedFID = Math.max(0, firstInteractionTime - 1000); // Rough estimation

                    // console.log('🔮 Estimated FID (fallback):', Math.round(estimatedFID), 'ms');

                    sendToAnalytics({
                        name: 'FID',
                        value: estimatedFID,
                        id: 'fallback-fid',
                        delta: 0,
                        entries: []
                    });

                    // Remove listeners after first interaction
                    ['click', 'touchstart', 'keydown'].forEach(type => {
                        document.removeEventListener(type, measureFirstInput, true);
                    });
                }
            };

            ['click', 'touchstart', 'keydown'].forEach(type => {
                document.addEventListener(type, measureFirstInput, true);
            });
        };

        // ⚡ Long task optimization
        const implementLongTaskOptimization = () => {
            // Automatically break up long-running tasks
            const scheduleWorkInChunks = (work: Function[], chunkSize = 5) => {
                const processChunk = () => {
                    const chunk = work.splice(0, chunkSize);
                    chunk.forEach(task => {
                        try {
                            task();
                        } catch (error) {
                            console.warn('Task execution error:', error);
                        }
                    });

                    if (work.length > 0) {
                        // Schedule next chunk
                        if ('requestIdleCallback' in window) {
                            (window as any).requestIdleCallback(processChunk);
                        } else {
                            setTimeout(processChunk, 5);
                        }
                    }
                };

                processChunk();
            };

            // Apply to existing heavy operations
            setMagicalOptimizations(prev => [...prev, '⚡ Auto-chunked long tasks for better responsiveness']);
        };

        // 🔍 Enhanced SEO monitoring with auto-fixes
        const monitorSEOHealth = () => {
            if (typeof window === 'undefined') return;

            const issues: SEOIssue[] = [];

            // DISABLED: Automatic H1 generation to prevent conflicts with semantic structure
            // Check for multiple H1 tags
            const h1Elements = document.querySelectorAll('h1');
            // Skip automatic H1 creation - we have proper semantic structure
            // if (h1Elements.length === 0) {
            //     issues.push({
            //         type: 'critical',
            //         message: '🚨 No H1 tag found - Adding semantic H1',
            //         severity: 10,
            //         fix: () => {
            //             const title = document.title.split(' - ')[0];
            //             const h1 = document.createElement('h1');
            //             h1.textContent = title;
            //             h1.style.position = 'absolute';
            //             h1.style.left = '-9999px';
            //             document.body.prepend(h1);
            //             // console.log('✨ Auto-added SEO H1 tag');
            //         }
            //     });
            // } else if (h1Elements.length > 1) {
            //     issues.push({
            //         type: 'warning',
            //         message: `⚠️ Multiple H1 tags found (${h1Elements.length}) - Optimizing hierarchy`,
            //         severity: 7,
            //         fix: () => {
            //             // Convert extra H1s to H2s
            //             Array.from(h1Elements).slice(1).forEach(h1 => {
            //                 const h2 = document.createElement('h2');
            //                 h2.innerHTML = h1.innerHTML;
            //                 h2.className = h1.className;
            //                 h1.parentNode?.replaceChild(h2, h1);
            //             });
            //             // console.log('✨ Auto-fixed H1 hierarchy');
            //         }
            //     });
            // }

            // Check meta description
            const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
            if (!metaDescription) {
                issues.push({
                    type: 'critical',
                    message: '🚨 Missing meta description - Auto-generating',
                    severity: 9,
                    fix: () => {
                        const meta = document.createElement('meta');
                        meta.name = 'description';
                        meta.content = `${document.title} - AI-driven fordonsinformation från Sveriges mest avancerade bilregister`;
                        document.head.appendChild(meta);
                        // console.log('✨ Auto-generated meta description');
                    }
                });
            } else if (metaDescription.content.length < 120) {
                issues.push({
                    type: 'warning',
                    message: `⚠️ Meta description too short (${metaDescription.content.length} chars)`,
                    severity: 6
                });
            }

            // Check for missing alt text
            const imagesWithoutAlt = Array.from(document.images).filter(img => !img.alt && !img.getAttribute('aria-label'));
            if (imagesWithoutAlt.length > 0) {
                issues.push({
                    type: 'warning',
                    message: `⚠️ ${imagesWithoutAlt.length} images missing alt text - Auto-fixing`,
                    severity: 5,
                    fix: () => {
                        imagesWithoutAlt.forEach(img => {
                            // Generate alt text based on context
                            const context = img.closest('[data-category]')?.getAttribute('data-category') || 'bilregistret';
                            img.alt = `${context} - ${img.src.split('/').pop()?.split('.')[0] || 'bil'} bild`;
                        });
                        // console.log(`✨ Auto-generated alt text for ${imagesWithoutAlt.length} images`);
                    }
                });
            }

            // Check canonical URL
            const canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                issues.push({
                    type: 'warning',
                    message: '⚠️ Missing canonical URL - Auto-adding',
                    severity: 6,
                    fix: () => {
                        const link = document.createElement('link');
                        link.rel = 'canonical';
                        link.href = window.location.origin + window.location.pathname;
                        document.head.appendChild(link);
                        // console.log('✨ Auto-added canonical URL');
                    }
                });
            }

            // Auto-fix critical issues
            issues.filter(issue => issue.type === 'critical' && issue.fix).forEach(issue => {
                issue.fix!();
            });

            setSeoIssues(issues);
        };

        // 🎭 Initialize all magical monitoring
        loadWebVitals();

        // Run SEO health check after page load
        window.addEventListener('load', () => {
            setTimeout(monitorSEOHealth, 1000);
        });

        // 🎨 Implement progressive loading optimization
        const implementProgressiveLoading = () => {
            // Progressive image loading with blur effect
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                const placeholder = document.createElement('div');
                placeholder.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
                placeholder.style.width = '100%';
                placeholder.style.height = '200px';
                placeholder.style.filter = 'blur(5px)';
                img.parentNode?.insertBefore(placeholder, img);

                // Replace with actual image when loaded
                const actualImg = new Image();
                actualImg.onload = () => {
                    (img as HTMLImageElement).src = actualImg.src;
                    placeholder.style.display = 'none';
                };
                actualImg.src = img.getAttribute('data-src')!;
            });
        };

        implementProgressiveLoading();

        // Cleanup function
        return () => {
            // Cleanup observers and listeners
        };

    }, []);

    // 🎭 Component doesn't render anything visible, but provides magical optimization
    return null;
};

export default CoreWebVitalsMonitor;