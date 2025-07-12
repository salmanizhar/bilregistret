import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SectionStateData {
  state: boolean;
  version: string;
  timestamp: number;
  hasContent?: boolean;
}

interface SectionStateOptions {
  sectionKey: string;
  defaultState?: boolean;
  dataVersion?: string;
  cacheTimeout?: number;
  hasContent?: boolean;
  isSearching?: boolean;
}

interface SectionStateResult {
  isOpen: boolean;
  isLoading: boolean;
  isVisible: boolean;
  toggleState: () => Promise<void>;
  resetState: () => Promise<void>;
  updateContentState: (hasContent: boolean) => Promise<void>;
}

/**
 * Hook for managing section states with caching
 * @param options Configuration options for the section state
 * @returns Object containing state and methods to manage it
 */
export function useSectionState({
  sectionKey,
  defaultState = false,
  dataVersion,
  cacheTimeout = 24 * 60 * 60 * 1000, // 24 hours default
  hasContent = false,
  isSearching = false
}: SectionStateOptions): SectionStateResult {
  const [isOpen, setIsOpen] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [currentHasContent, setCurrentHasContent] = useState(hasContent);
  const [currentIsSearching, setCurrentIsSearching] = useState(isSearching);

  // Update visibility and state based on search state and content
  useEffect(() => {
    if (isSearching) {
      // During search, only show sections with content and keep them open
      setIsVisible(hasContent);
      setIsOpen(hasContent);
    } else {
      // When not searching, show all sections and use cache
      setIsVisible(true);
      loadSavedState();
    }
  }, [isSearching, hasContent]);

  // Load saved state from AsyncStorage
  const loadSavedState = async () => {
    try {
      setIsLoading(true);
      const savedData = await AsyncStorage.getItem(sectionKey);

      if (savedData) {
        const parsedData: SectionStateData = JSON.parse(savedData);

        // Check if cache is valid
        const isCacheValid =
          (!dataVersion || parsedData.version === dataVersion) &&
          (!cacheTimeout || Date.now() - parsedData.timestamp < cacheTimeout);

        if (isCacheValid) {
          // When not searching, use cached state
          if (!isSearching) {
            setIsOpen(parsedData.state);
          }
          setCurrentHasContent(parsedData.hasContent || false);
        } else {
          // Cache invalid, use default state
          setIsOpen(defaultState);
          setCurrentHasContent(hasContent);
          await AsyncStorage.removeItem(sectionKey);
        }
      } else {
        // No cache exists, use default state
        setIsOpen(defaultState);
        setCurrentHasContent(hasContent);
      }
    } catch (error) {
      // // console.log('Error loading section state:', error);
      setIsOpen(defaultState);
      setCurrentHasContent(hasContent);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of saved state
  useEffect(() => {
    if (!isSearching) {
      loadSavedState();
    }
  }, [sectionKey, defaultState, dataVersion, cacheTimeout, hasContent, isSearching]);

  // Update content state and potentially open section
  const updateContentState = useCallback(async (newHasContent: boolean) => {
    // Early exit if content became empty – we keep the current open/close state to prevent flicker
    if (!newHasContent) {
      setCurrentHasContent(false);
      // Keep visibility unchanged but ensure we never hide an already visible section
      if (isSearching) {
        setIsVisible(false);
      }
      return;
    }

    // Content exists from here onwards
    setCurrentHasContent(true);

    try {
      if (isSearching) {
        // During search, show & open when we have content
        setIsVisible(true);
        setIsOpen(true);
      } else {
        // When not searching, simply ensure the section stays visible; keep the current open/close state untouched
        setIsVisible(true);
        // Do NOT touch setIsOpen here – preventing flicker when content count changes.
      }
    } catch (error) {
      // // console.log('Error updating content state:', error);
      setIsVisible(!isSearching);
      setIsOpen(isSearching ? true : defaultState);
    }
  }, [sectionKey, isSearching, defaultState]);

  // Save state to AsyncStorage when it changes
  const toggleState = useCallback(async () => {
    // Don't allow toggling during search
    // if (isSearching) return; //comment out by sani as alen want sections to be closed during search.

    const newState = !isOpen;
    setIsOpen(newState);

    try {
      const dataToSave: SectionStateData = {
        state: newState,
        version: dataVersion || '1.0',
        timestamp: Date.now(),
        hasContent: currentHasContent
      };
      await AsyncStorage.setItem(sectionKey, JSON.stringify(dataToSave));
    } catch (error) {
      // // console.log('Error saving section state:', error);
    }
  }, [isOpen, sectionKey, dataVersion, currentHasContent, isSearching]);

  // Force reset state
  const resetState = useCallback(async () => {
    setIsOpen(defaultState);
    setIsVisible(true);
    setCurrentHasContent(false);
    try {
      await AsyncStorage.removeItem(sectionKey);
    } catch (error) {
      // // console.log('Error resetting section state:', error);
    }
  }, [defaultState, sectionKey]);

  return {
    isOpen,
    isLoading,
    isVisible,
    toggleState,
    resetState,
    updateContentState
  };
}