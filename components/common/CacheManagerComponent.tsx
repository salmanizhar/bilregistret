import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useCacheManager, useMemoryPressure } from '@/Services/api/hooks/useCacheManager';
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';

interface CacheStats {
    totalQueries: number;
    successfulQueries: number;
    errorQueries: number;
    loadingQueries: number;
    staleQueries: number;
    oldestQuery: number | null;
    newestQuery: number | null;
}

interface CacheManagerComponentProps {
    showStats?: boolean;
    showControls?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

const CacheManagerComponent: React.FC<CacheManagerComponentProps> = ({
    showStats = true,
    showControls = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
}) => {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        getStats,
        logStats,
        quickCleanup,
        aggressiveCleanup,
        emergencyClean,
        clearCache,
        cleanVehicleData,
        cleanProductData,
        cleanCarData,
    } = useCacheManager();

    const { handleMemoryPressure } = useMemoryPressure();

    // Update stats
    const updateStats = () => {
        const currentStats = getStats();
        setStats(currentStats);
    };

    // Auto refresh stats
    useEffect(() => {
        updateStats();

        if (autoRefresh) {
            const interval = setInterval(updateStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    // Handle cleanup operations
    const handleCleanup = async (type: string) => {
        setIsLoading(true);
        try {
            switch (type) {
                case 'quick':
                    await quickCleanup();
                    break;
                case 'aggressive':
                    await aggressiveCleanup();
                    break;
                case 'emergency':
                    await emergencyClean();
                    break;
                case 'clear':
                    await clearCache({ clearPersisted: true });
                    break;
                case 'vehicle':
                    cleanVehicleData();
                    break;
                case 'product':
                    cleanProductData();
                    break;
                case 'car':
                    cleanCarData();
                    break;
                case 'memory-low':
                    await handleMemoryPressure('low');
                    break;
                case 'memory-medium':
                    await handleMemoryPressure('medium');
                    break;
                case 'memory-high':
                    await handleMemoryPressure('high');
                    break;
            }
            updateStats();
        } catch (error) {
            // console.error('Cache cleanup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Confirm dangerous operations
    const confirmCleanup = (type: string, title: string, message: string) => {
        Alert.alert(
            title,
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: () => handleCleanup(type)
                }
            ]
        );
    };

    const formatAge = (timestamp: number | null) => {
        if (!timestamp) return 'N/A';
        const minutes = Math.round((Date.now() - timestamp) / 1000 / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.round(hours / 24);
        return `${days}d`;
    };

    return (
        <View style={styles.container}>
            {showStats && stats && (
                <View style={styles.statsContainer}>
                    <MyText style={styles.title}>Cache Statistics</MyText>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <MyText style={styles.statLabel}>Total Queries</MyText>
                            <MyText style={styles.statValue}>{stats.totalQueries}</MyText>
                        </View>

                        <View style={styles.statItem}>
                            <MyText style={styles.statLabel}>Successful</MyText>
                            <MyText style={StyleSheet.flatten([styles.statValue, { color: myColors.lightGreen }])}>
                                {stats.successfulQueries}
                            </MyText>
                        </View>

                        <View style={styles.statItem}>
                            <MyText style={styles.statLabel}>Errors</MyText>
                            <MyText style={StyleSheet.flatten([styles.statValue, { color: myColors.didNotFindRed }])}>
                                {stats.errorQueries}
                            </MyText>
                        </View>

                        <View style={styles.statItem}>
                            <MyText style={styles.statLabel}>Loading</MyText>
                            <MyText style={StyleSheet.flatten([styles.statValue, { color: myColors.primary.main }])}>
                                {stats.loadingQueries}
                            </MyText>
                        </View>

                        <View style={styles.statItem}>
                            <MyText style={styles.statLabel}>Stale</MyText>
                            <MyText style={StyleSheet.flatten([styles.statValue, { color: myColors.baseColors.light3 }])}>
                                {stats.staleQueries}
                            </MyText>
                        </View>

                        <View style={styles.statItem}>
                            <MyText style={styles.statLabel}>Oldest</MyText>
                            <MyText style={styles.statValue}>{formatAge(stats.oldestQuery)}</MyText>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={updateStats}
                    >
                        <MyText style={styles.refreshButtonText}>Refresh Stats</MyText>
                    </TouchableOpacity>
                </View>
            )}

            {showControls && (
                <View style={styles.controlsContainer}>
                    <MyText style={styles.title}>Cache Controls</MyText>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <MyText style={styles.sectionTitle}>Quick Actions</MyText>

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={() => handleCleanup('quick')}
                            disabled={isLoading}
                        >
                            <MyText style={styles.buttonText}>Quick Cleanup</MyText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.warningButton]}
                            onPress={() => handleCleanup('aggressive')}
                            disabled={isLoading}
                        >
                            <MyText style={styles.buttonText}>Aggressive Cleanup</MyText>
                        </TouchableOpacity>
                    </View>

                    {/* Data-Specific Cleanup */}
                    <View style={styles.section}>
                        <MyText style={styles.sectionTitle}>Data-Specific Cleanup</MyText>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton, styles.smallButton]}
                                onPress={() => handleCleanup('vehicle')}
                                disabled={isLoading}
                            >
                                <MyText style={styles.smallButtonText}>Vehicle Data</MyText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton, styles.smallButton]}
                                onPress={() => handleCleanup('product')}
                                disabled={isLoading}
                            >
                                <MyText style={styles.smallButtonText}>Product Data</MyText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton, styles.smallButton]}
                                onPress={() => handleCleanup('car')}
                                disabled={isLoading}
                            >
                                <MyText style={styles.smallButtonText}>Car Data</MyText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Memory Pressure */}
                    <View style={styles.section}>
                        <MyText style={styles.sectionTitle}>Memory Pressure</MyText>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.memoryButton, styles.smallButton]}
                                onPress={() => handleCleanup('memory-low')}
                                disabled={isLoading}
                            >
                                <MyText style={styles.smallButtonText}>Low</MyText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.memoryButton, styles.smallButton]}
                                onPress={() => handleCleanup('memory-medium')}
                                disabled={isLoading}
                            >
                                <MyText style={styles.smallButtonText}>Medium</MyText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.memoryButton, styles.smallButton]}
                                onPress={() => handleCleanup('memory-high')}
                                disabled={isLoading}
                            >
                                <MyText style={styles.smallButtonText}>High</MyText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dangerous Actions */}
                    <View style={styles.section}>
                        <MyText style={styles.sectionTitle}>Dangerous Actions</MyText>

                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={() => confirmCleanup(
                                'emergency',
                                'Emergency Cleanup',
                                'This will clear all cache data. Are you sure?'
                            )}
                            disabled={isLoading}
                        >
                            <MyText style={styles.buttonText}>Emergency Cleanup</MyText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={() => confirmCleanup(
                                'clear',
                                'Clear All Cache',
                                'This will clear all cache data including persisted data. Are you sure?'
                            )}
                            disabled={isLoading}
                        >
                            <MyText style={styles.buttonText}>Clear All Cache</MyText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: myColors.white,
    },
    statsContainer: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 8,
    },
    controlsContainer: {
        padding: 16,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: myColors.text.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        width: '48%',
        marginBottom: 8,
        padding: 8,
        backgroundColor: myColors.white,
        borderRadius: 4,
    },
    statLabel: {
        fontSize: 12,
        color: myColors.text.secondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text.primary,
    },
    refreshButton: {
        backgroundColor: myColors.primary.main,
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
    },
    refreshButtonText: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: myColors.text.primary,
    },
    button: {
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallButton: {
        flex: 1,
        marginHorizontal: 2,
        padding: 8,
    },
    primaryButton: {
        backgroundColor: myColors.primary.main,
    },
    secondaryButton: {
        backgroundColor: myColors.baseColors.light3,
    },
    warningButton: {
        backgroundColor: '#FF9500',
    },
    dangerButton: {
        backgroundColor: myColors.didNotFindRed,
    },
    memoryButton: {
        backgroundColor: '#8E44AD',
    },
    buttonText: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    smallButtonText: {
        color: myColors.white,
        fontSize: 12,
        fontWeight: '500',
    },
});

export default CacheManagerComponent;