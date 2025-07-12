import { Platform } from 'react-native';

// Optimized FlatList props for different use cases
export const getFlatListOptimizations = (listType: 'small' | 'medium' | 'large' | 'infinite') => {
    const baseConfig = {
        removeClippedSubviews: true,
        scrollEventThrottle: 16,
        keyboardShouldPersistTaps: 'handled' as const,
        keyboardDismissMode: 'on-drag' as const,
        disableScrollViewPanResponder: true,
        // Reduce memory footprint
        legacyImplementation: false,
    };

    switch (listType) {
        case 'small':
            return {
                ...baseConfig,
                initialNumToRender: 5,
                maxToRenderPerBatch: 3,
                windowSize: 3,
                updateCellsBatchingPeriod: 100,
                onEndReachedThreshold: 0.8,
            };

        case 'medium':
            return {
                ...baseConfig,
                initialNumToRender: 8,
                maxToRenderPerBatch: 5,
                windowSize: 5,
                updateCellsBatchingPeriod: 50,
                onEndReachedThreshold: 0.5,
            };

        case 'large':
            return {
                ...baseConfig,
                initialNumToRender: 10,
                maxToRenderPerBatch: 8,
                windowSize: 7,
                updateCellsBatchingPeriod: 30,
                onEndReachedThreshold: 0.3,
            };

        case 'infinite':
            return {
                ...baseConfig,
                initialNumToRender: 15,
                maxToRenderPerBatch: 10,
                windowSize: 10,
                updateCellsBatchingPeriod: 20,
                onEndReachedThreshold: 0.2,
                // For infinite scroll, we need more aggressive memory management
                removeClippedSubviews: Platform.OS === 'android', // iOS has issues with this
            };

        default:
            return baseConfig;
    }
};

// Memory-aware item layout calculator
export const createGetItemLayout = (itemHeight: number, hasHeader: boolean = false) => {
    const headerHeight = hasHeader ? 50 : 0;

    return (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index + headerHeight,
        index,
    });
};

// Optimized key extractor with memory considerations
export const createKeyExtractor = (keyField: string = 'id') => {
    const extractedKeys = new Set<string>();

    return (item: any, index: number) => {
        const key = item[keyField] || `item-${index}`;

        // Prevent duplicate keys which can cause memory leaks
        if (extractedKeys.has(key)) {
            return `${key}-${index}`;
        }

        extractedKeys.add(key);
        return key;
    };
};

// Viewport-based rendering optimization
export class ViewportRenderer {
    private visibleItems = new Set<number>();
    private renderBuffer = 5; // Number of items to render outside viewport

    updateVisibleItems(viewableItems: any[]) {
        this.visibleItems.clear();

        viewableItems.forEach(item => {
            const index = item.index;
            // Add buffer items
            for (let i = index - this.renderBuffer; i <= index + this.renderBuffer; i++) {
                if (i >= 0) {
                    this.visibleItems.add(i);
                }
            }
        });
    }

    shouldRenderItem(index: number): boolean {
        return this.visibleItems.has(index);
    }

    clearVisibleItems() {
        this.visibleItems.clear();
    }
}

// Memory-efficient data chunking for large lists
export const chunkData = <T>(data: T[], chunkSize: number = 50): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
};

// Debounced scroll handler to reduce memory pressure
export const createDebouncedScrollHandler = (
    callback: (event: any) => void,
    delay: number = 100
) => {
    let timeoutId: NodeJS.Timeout;

    return (event: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(event), delay);
    };
};

// List performance monitor
export class ListPerformanceMonitor {
    private renderTimes: number[] = [];
    private maxRenderTimes = 10;

    recordRenderTime(startTime: number) {
        const renderTime = Date.now() - startTime;
        this.renderTimes.push(renderTime);

        if (this.renderTimes.length > this.maxRenderTimes) {
            this.renderTimes.shift();
        }

        if (__DEV__ && renderTime > 16) { // 60fps = 16ms per frame
            console.warn(`Slow render detected: ${renderTime}ms`);
        }
    }

    getAverageRenderTime(): number {
        if (this.renderTimes.length === 0) return 0;
        return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    }

    reset() {
        this.renderTimes = [];
    }
}