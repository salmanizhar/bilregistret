import { ImagePath } from "@/assets/images";
import { Platform, StatusBar } from "react-native";

export function convertWixImageUrl(wixUrl: string) {
    // Extract the image ID from the wix:image:// format
    const match = wixUrl.match(/wix:image:\/\/v1\/(.*?)~/);
    if (!match) return wixUrl;

    const imageId = match[1];
    return `https://static.wixstatic.com/media/${imageId}~mv2.png`;
}

/**
 * Shortens a name to the specified length and adds ellipsis if necessary
 * @param name The name to shorten
 * @param totalCharacter Maximum number of characters before adding ellipsis
 * @returns Shortened name with ellipsis if necessary, or the original name
 */
export function shortenName(name: string | null, totalCharacter: number | null): string | null {
    if (name === "" || name === null || totalCharacter === null) return name;
    if (name?.length > totalCharacter) {
        return name?.substring(0, totalCharacter) + "...";
    } else {
        return name;
    }
}

export const formatDate = (date: Date): string => {
    try {
        // Format as a nice localized date
        return date.toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        // console.error('Error formatting date:', error);
        return ''; // Return empty string on error
    }
};

/**
 * Checks if the passed value is a valid URL
 * @param value - The value to check
 * @returns boolean indicating whether the value is a valid URL
 */
export function isUrl(value: string | null | undefined): boolean {
    // Return false if value is null or undefined
    if (value === null || value === undefined) {
        return false;
    }
    try {
        // Create a URL object to validate the string
        const url = new URL(value);
        // Check if the protocol is http or https (you can expand this as needed)
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        // If URL constructor throws an error, it's not a valid URL
        return false;
    }
}

/**
 * Checks if an image file size is valid (less than or equal to 5MB)
 * @param imageInfo - The image info object from ImagePicker
 * @returns An object with isValid boolean and message string
 */
export function isImageSizeValid(imageInfo: any): { isValid: boolean; message: string } {
    // Maximum file size in bytes (5MB = 5 * 1024 * 1024)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    // Check if we have fileSize property (available on most platforms)
    if (imageInfo && imageInfo.fileSize) {
        if (imageInfo.fileSize > MAX_FILE_SIZE) {
            return {
                isValid: false,
                message: 'Bilden är för stor. Maximal filstorlek är 5MB.'
            };
        }
    }
    // For web or platforms where fileSize might not be available
    else if (imageInfo && imageInfo.uri && Platform.OS === 'web') {
        // For web, we might not have direct access to file size
        // This is a placeholder - in real implementation you might need to
        // use FileReader or other web APIs to check file size
        console.warn('File size check not implemented for web platform');
    }

    return {
        isValid: true,
        message: ''
    };
}


// Function to convert from space format to hyphenated format
export function spacesToHyphens(text: string) {
    // return text.replace(/\s+/g, '-');
    return text.trim().split(' ').filter(Boolean).join('-');
}

// Function to convert from hyphenated format to space format
export function hyphensToSpaces(text: string) {
    // return text.replace(/-/g, ' ');
    return text.trim().split('-').filter(Boolean).join(' ');
}

export function getStatusBarHeight() {
    if (Platform.OS === 'ios') {
        return 60;
    } else if (Platform.OS === 'android') {
        return (StatusBar.currentHeight ?? 50) + 10;
    } else if (Platform.OS === 'web') {
        return 0;
    } else {
        return 0;
    }
}