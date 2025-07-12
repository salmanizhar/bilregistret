import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SectionStateOptions {
    sectionKey: string;
    defaultState?: boolean;
    dataVersion?: string; // For data invalidation
    cacheTimeout?: number; // In milliseconds
}

export const useSectionState = ({
    sectionKey,
    defaultState = false,
    dataVersion,
    cacheTimeout = 24 * 60 * 60 * 1000 // 24 hours default
}: SectionStateOptions) => {
    const [isOpen, setIsOpen] = useState(defaultState);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved state from AsyncStorage
    useEffect(() => {
        const loadSavedState = async () => {
            try {
                setIsLoading(true);
                const savedData = await AsyncStorage.getItem(sectionKey);
                if (savedData) {
                    const { state, version, timestamp } = JSON.parse(savedData);

                    // Check if cache is valid
                    const isCacheValid =
                        (!dataVersion || version === dataVersion) &&
                        (!cacheTimeout || Date.now() - timestamp < cacheTimeout);

                    if (isCacheValid) {
                        setIsOpen(state);
                    } else {
                        // Cache invalid, reset to default
                        setIsOpen(defaultState);
                        await AsyncStorage.removeItem(sectionKey);
                    }
                } else {
                    setIsOpen(defaultState);
                }
            } catch (error) {
                // console.error('Error loading section state:', error);
                setIsOpen(defaultState);
            } finally {
                setIsLoading(false);
            }
        };
        loadSavedState();
    }, [sectionKey, defaultState, dataVersion, cacheTimeout]);

    // Save state to AsyncStorage when it changes
    const toggleState = useCallback(async () => {
        const newState = !isOpen;
        setIsOpen(newState);
        try {
            const dataToSave = {
                state: newState,
                version: dataVersion,
                timestamp: Date.now()
            };
            await AsyncStorage.setItem(sectionKey, JSON.stringify(dataToSave));
        } catch (error) {
            // console.error('Error saving section state:', error);
        }
    }, [isOpen, sectionKey, dataVersion]);

    // Force reset state
    const resetState = useCallback(async () => {
        setIsOpen(defaultState);
        try {
            await AsyncStorage.removeItem(sectionKey);
        } catch (error) {
            // console.error('Error resetting section state:', error);
        }
    }, [defaultState, sectionKey]);

    return {
        isOpen,
        isLoading,
        toggleState,
        resetState
    };
};