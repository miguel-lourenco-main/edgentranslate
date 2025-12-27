
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CurrencyFormatParams, DeleteOptions, FileExtensionInfo, InsertOrUpdateOptions, PlainFileObject } from './types';
import { UseFormReturn } from 'react-hook-form';
import { FILE_SUPPORTED_TYPES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCountryFlag(country: string): string {
  // Convert country code to uppercase for consistency
  const input = country.toUpperCase();
  
  const countryMap: Record<string, string> = {
    // European Countries
    'ENGLISH': '🇬🇧',
    'EN': '🇬🇧',
    'FRENCH': '🇫🇷',
    'FR': '🇫🇷',
    'GERMAN': '🇩🇪',
    'DE': '🇩🇪',
    'ITALIAN': '🇮🇹',
    'IT': '🇮🇹',
    'SPANISH': '🇪🇸',
    'ES': '🇪🇸',
    'PORTUGUESE': '🇵🇹',
    'PT': '🇵🇹',
    'DUTCH': '🇳🇱',
    'NL': '🇳🇱',
    'GREEK': '🇬🇷',
    'GR': '🇬🇷',
    'POLISH': '🇵🇱',
    'PL': '🇵🇱',
    'ROMANIAN': '🇷🇴',
    'RO': '🇷🇴',
    'SWEDISH': '🇸🇪',
    'SE': '🇸🇪',
    'NORWEGIAN': '🇳🇴',
    'NO': '🇳🇴',
    'DANISH': '🇩🇰',
    'DK': '🇩🇰',
    'FINNISH': '🇫🇮',
    'FI': '🇫🇮',

    // Asian Countries
    'CHINESE': '🇨🇳',
    'ZH': '🇨🇳',
    'JAPANESE': '🇯🇵',
    'JA': '🇯🇵',
    'KOREAN': '🇰🇷',
    'KO': '🇰🇷',
    'VIETNAMESE': '🇻🇳',
    'VI': '🇻🇳',
    'THAI': '🇹🇭',
    'TH': '🇹🇭',
    'INDONESIAN': '🇮🇩',
    'ID': '🇮🇩',
    'MALAY': '🇲🇾',
    'MS': '🇲🇾',
    'HINDI': '🇮🇳',
    'HI': '🇮🇳',
    'BENGALI': '🇧🇩',
    'BN': '🇧🇩',
    'URDU': '🇵🇰',
    'UR': '🇵🇰',

    // Middle Eastern Countries
    'ARABIC': '🇸🇦',
    'AR': '🇸🇦',
    'HEBREW': '🇮🇱',
    'HE': '🇮🇱',
    'TURKISH': '🇹🇷',
    'TR': '🇹🇷',
    'PERSIAN': '🇮🇷',
    'FA': '🇮🇷',

    // American Countries
    'ENGLISH_US': '🇺🇸',
    'EN_US': '🇺🇸',
    'PORTUGUESE_BR': '🇧🇷',
    'PT_BR': '🇧🇷',
    'SPANISH_MX': '🇲🇽',
    'ES_MX': '🇲🇽',
    'FRENCH_CA': '🇨🇦',
    'FR_CA': '🇨🇦',

    // Other Major Countries
    'RUSSIAN': '🇷🇺',
    'RU': '🇷🇺',
    'UKRAINIAN': '🇺🇦',
    'UK': '🇺🇦',
    'CZECH': '🇨🇿',
    'CS': '🇨🇿',
    'SLOVAK': '🇸🇰',
    'SK': '🇸🇰',
    'HUNGARIAN': '🇭🇺',
    'HU': '🇭🇺',
    'BULGARIAN': '🇧🇬',
    'BG': '🇧🇬',
    'CROATIAN': '🇭🇷',
    'HR': '🇭🇷',
    'SERBIAN': '🇷🇸',
    'SR': '🇷🇸',
    'SLOVENIAN': '🇸🇮',
    'SL': '🇸🇮'
  };

  return countryMap[input] ?? '🏳️'; // Returns white flag if country not found
}


/**
 * Check if the code is running in a browser environment.
 * @returns {boolean} True if running in browser, false otherwise
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Format a number as currency with the specified locale and currency code
 * @param {CurrencyFormatParams} params - The formatting parameters
 * @returns {string} The formatted currency string
 */
export function formatCurrency({currencyCode, locale, value}: CurrencyFormatParams): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(value));
}

/**
 * Updates an existing item in an array or adds a new one if it doesn't exist
 * @template T - Type extending object with an id property
 * @param {InsertOrUpdateOptions<T>} options - The options for inserting or updating
 */
export const handleInsertOrUpdate = <T extends { id: string }>(
  options: InsertOrUpdateOptions<T>
) => {
  options.setter((prev) => {
    const index = prev.findIndex(item => item.id === options.newItem.id);
    if (index !== -1) {
      return [...prev.slice(0, index), options.newItem, ...prev.slice(index + 1)];
    }
    return [...prev, options.newItem];
  });
};

/**
 * Removes an item from an array by its ID
 * @template T - Type extending object with an id property
 * @param {DeleteOptions<T>} options - The options for deleting
 */
export const handleDelete = <T extends { id: string }>(
  options: DeleteOptions<T>
) => {
  options.setter((prev) => prev.filter(item => item.id !== options.deletedItemId));
};

/**
 * Converts a File object to a plain JavaScript object for serialization
 * @param {File} file - The File object to convert
 * @returns {Promise<PlainFileObject>} A promise that resolves to a plain object representation of the file
 */
export function fileToPlainObject(file: File): Promise<PlainFileObject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const plainObject: PlainFileObject = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        content: reader.result
      };
      resolve(plainObject);
    };

    reader.onerror = () => {
      reject(new Error(reader.error?.message ?? 'Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a plain object back to a File object
 * @param {PlainFileObject} plainObject - The plain object representation of a file
 * @returns {File} A new File object
 * @throws {Error} If the content format is invalid
 */
export function objectToFile(plainObject: PlainFileObject): File {
  const { name, type, content, lastModified } = plainObject;

  if (typeof content !== 'string') {
    throw new Error('Invalid content format');
  }

  const byteString = atob(content.split(',')[1] ?? "");
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([uint8Array], { type });
  const file = new File([blob], name, { type, lastModified });

  return file;
}

/**
 * Determines the current tier based on a page count and tier thresholds
 * @param {number} pageCount - The current number of pages
 * @param {(number | 'unlimited')[]} tiers - Array of tier thresholds
 * @returns {number} The index of the current tier
 */
export function getCurrentTier(pageCount: number, tiers: (number | 'unlimited')[] ){
  let index = 0;
  for (const tier of tiers) {
    const tierUpTo = tier === 'unlimited' ? Infinity : Number(tier);
    if (pageCount > tierUpTo) {
      index=index+1
    }else{
      break
    }
  }
  return index;
}

/**
 * Gets the keys of a react-hook-form form's values
 * @template T - Type of the form values
 * @param {UseFormReturn<T>} form - The form instance from react-hook-form
 * @returns {(keyof T)[]} Array of form value keys
 */
export function getFormKeys<T extends Record<string, unknown>>(form: UseFormReturn<T>) {
  return Object.keys(form.getValues()) as (keyof T)[];
}

/**
 * Gets the file extension and corresponding MIME type for a filename
 * @param {string} filename - The filename to analyze
 * @returns {FileExtensionInfo} Object containing the extension and MIME type
 */
export function getFileExtensionType(filename: string): FileExtensionInfo {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return {extension: '', mimeType: ''};

  for (const [mimeType, extensions] of Object.entries(FILE_SUPPORTED_TYPES)) {
    if (extensions.includes(`.${extension}`)) {
      return {extension, mimeType};
    }
  }
  
  return {extension, mimeType: ''};
}

export function calculateTieredCost(pageCountValue: number, tiers: {
  cost: number;
  upTo: number | "unlimited";
}[]) {

  const tiersUpTo = tiers.map((tier) => tier.upTo)

  // Convert pageCount to a number, defaulting to 0 if it's not a valid number
  const pageCount = Number(pageCountValue) ?? 0;

  const index = getCurrentTier(pageCount, tiersUpTo);
  
  const cost = tiers[index]?.cost ?? 0; 

  // Apply the cost of the applicable tier to all pages
  const costPerPage = Number(cost);
  return costPerPage * pageCount
}

/**
 * Generates a random 5-digit number as a string for use as a fallback ID
 * @returns {string} A random 5-digit number as a string
 */
export const generateFallbackId = () => Math.floor(10000 + Math.random() * 90000).toString();