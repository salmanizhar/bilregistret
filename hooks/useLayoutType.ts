import { useEffect, useState } from 'react';
import {
    getBrandLayoutType,
    setBrandLayoutType,
    getModelLayoutType,
    setModelLayoutType
} from '@/utils/storage';

type LayoutType = 'brand' | 'model';

export const useLayoutType = (type: LayoutType = 'model', initialValue?: number) => {
    // Use the initialValue if provided, otherwise default based on type
    const [layoutType, setLayoutType] = useState(
        initialValue !== undefined ? initialValue : (type === 'brand' ? 0 : 1)
    );
    const [isLoading, setIsLoading] = useState(true);

    // Load saved layout type on component mount based on type
    useEffect(() => {
        const loadLayoutType = async () => {
            try {
                // If initialValue is provided, use it and save it
                if (initialValue !== undefined) {
                    // Save the initial value to storage
                    if (type === 'brand') {
                        await setBrandLayoutType(initialValue);
                    } else {
                        await setModelLayoutType(initialValue);
                    }
                    setIsLoading(false);
                    return;
                }

                // Otherwise load from storage
                let savedLayoutType = null;
                if (type === 'brand') {
                    savedLayoutType = await getBrandLayoutType();
                } else {
                    savedLayoutType = await getModelLayoutType();
                }

                if (savedLayoutType !== null) {
                    setLayoutType(savedLayoutType);
                }
            } catch (error) {
                console.error(`Error loading ${type} layout type:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLayoutType();
    }, [type, initialValue]);

    // Save layout type to AsyncStorage whenever it changes
    const updateLayoutType = async (newLayoutType: number) => {
        try {
            if (type === 'brand') {
                await setBrandLayoutType(newLayoutType);
            } else {
                await setModelLayoutType(newLayoutType);
            }
            setLayoutType(newLayoutType);
        } catch (error) {
            console.error(`Error saving ${type} layout type:`, error);
        }
    };

    return { layoutType, updateLayoutType, isLoading };
};