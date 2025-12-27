/**
 * Global constants and configuration values used throughout the application.
 * Contains definitions for:
 * - Supported file types and their extensions
 * - Language configurations and regional mappings
 * - System limits and constraints
 */

import { Language } from './types';

// Mapping of MIME types to their corresponding file extensions for supported file formats
export const FILE_SUPPORTED_TYPES = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
}

// Array of supported MIME types
export const FILE_SUPPORTED_TYPES_KEYS = Object.keys(FILE_SUPPORTED_TYPES)
// Array of supported file extensions (flattened)
export const FILE_SUPPORTED_TYPES_VALUES = Object.values(FILE_SUPPORTED_TYPES).flat()

// Comma-separated string of supported file extensions
export const FILE_SUPPORTED_TYPES_VALUES_STRING = Object.values(FILE_SUPPORTED_TYPES).flat().join(",")

// Mapping of geographical regions to their supported languages with metadata
export const LANGUAGES_BY_REGION: Record<string, Language[]> = {
  "Asia": [
    { longValue: "arabic", value: "ar", label: "🇸🇦 Arabic" },
    { longValue: "armenian", value: "hy", label: "🇦🇲 Armenian" },
    { longValue: "azerbaijani", value: "az", label: "🇦🇿 Azerbaijani" },
    { longValue: "bengali", value: "bn", label: "🇧🇩 Bengali" },
    { longValue: "burmese", value: "my", label: "🇲🇲 Burmese" },
    { longValue: "cantonese", value: "zh-Hant-HK", label: "🇭🇰 Cantonese" },
    { longValue: "filipino", value: "fil", label: "🇵🇭 Filipino" },
    { longValue: "gujarati", value: "gu", label: "🇮🇳 Gujarati" },
    { longValue: "hebrew", value: "he", label: "🇮🇱 Hebrew" },
    { longValue: "hindi", value: "hi", label: "🇮🇳 Hindi" },
    { longValue: "indonesian", value: "id", label: "🇮🇩 Indonesian" },
    { longValue: "japanese", value: "ja", label: "🇯🇵 Japanese" },
    { longValue: "korean", value: "ko", label: "🇰🇷 Korean" },
    { longValue: "kazakh", value: "kk", label: "🇰🇿 Kazakh" },
    { longValue: "khmer", value: "km", label: "🇰🇭 Khmer" },
    { longValue: "kannada", value: "kn", label: "🇳 Kannada" },
    { longValue: "lao", value: "lo", label: "🇱🇦 Lao" },
    { longValue: "malay", value: "ms", label: "🇲🇾 Malay" },
    { longValue: "mongolian", value: "mn", label: "🇲🇳 Mongolian (Cyrillic)" },
    { longValue: "marathi", value: "mr", label: "🇮🇳 Marathi" },
    { longValue: "malayalam", value: "ml", label: "🇮🇳 Malayalam" },
    { longValue: "odia", value: "or", label: "🇮🇳 Odia" },
    { longValue: "persian", value: "fa", label: "🇮🇷 Persian" },
    { longValue: "punjabi", value: "pa", label: "🇮🇳 Punjabi" },
    { longValue: "russian", value: "ru", label: "🇷🇺 Russian" },
    { longValue: "chinese_simplified", value: "zh-CN", label: "🇨🇳 Simplified Chinese" },
    { longValue: "sinhala", value: "si", label: "🇱🇰 Sinhalese" },
    { longValue: "chinese_hk", value: "zh-HK", label: "🇭🇰 Traditional Chinese (Hong Kong)" },
    { longValue: "chinese_tw", value: "zh-TW", label: "🇹🇼 Traditional Chinese (Taiwan)" },
    { longValue: "chinese_traditional", value: "zh-Hant", label: "🇹🇼 Traditional Chinese" },
    { longValue: "thai", value: "th", label: "🇹🇭 Thai" },
    { longValue: "tamil", value: "ta", label: "🇮🇳 Tamil" },
    { longValue: "telugu", value: "te", label: "🇮🇳 Telugu" },
    { longValue: "uzbek", value: "uz", label: "🇺🇿 Uzbek" },
    { longValue: "urdu", value: "ur", label: "🇵🇰 Urdu" },
    { longValue: "uyghur", value: "ug", label: "🇨🇳 Uyghur" },
    { longValue: "vietnamese", value: "vi", label: "🇻🇳 Vietnamese" },
    { longValue: "yiddish", value: "yi", label: "🇮🇱 Yiddish" },
  ],

  "Europe": [
    { longValue: "albanian", value: "sq", label: "🇦🇱 Albanian" },
    { longValue: "belarusian", value: "be", label: "🇧🇾 Belarusian" },
    { longValue: "bulgarian", value: "bg", label: "🇧🇬 Bulgarian" },
    { longValue: "catalan", value: "ca", label: "🏴 Catalan" },
    { longValue: "croatian", value: "hr", label: "🇭🇷 Croatian" },
    { longValue: "czech", value: "cs", label: "🇨🇿 Czech" },
    { longValue: "danish", value: "da", label: "🇩🇰 Danish" },
    { longValue: "dutch", value: "nl", label: "🇳🇱 Dutch" },
    { longValue: "estonian", value: "et", label: "🇪🇪 Estonian" },
    { longValue: "french", value: "fr", label: "🇫🇷 French" },
    { longValue: "finnish", value: "fi", label: "🇫🇮 Finnish" },
    { longValue: "german", value: "de", label: "🇩🇪 German" },
    { longValue: "georgian", value: "ka", label: "🇬🇪 Georgian" },
    { longValue: "greek", value: "el", label: "🇬🇷 Greek" },
    { longValue: "hungarian", value: "hu", label: "🇭🇺 Hungarian" },
    { longValue: "italian", value: "it", label: "🇮🇹 Italian" },
    { longValue: "icelandic", value: "is", label: "🇮🇸 Icelandic" },
    { longValue: "irish", value: "ga", label: "🇮🇪 Irish" },
    { longValue: "latin", value: "la", label: "🏛️ Latin" },
    { longValue: "latvian", value: "lv", label: "🇱🇻 Latvian" },
    { longValue: "lithuanian", value: "lt", label: "🇱🇹 Lithuanian" },
    { longValue: "macedonian", value: "mk", label: "🇲🇰 Macedonian" },
    { longValue: "maltese", value: "mt", label: "🇲🇹 Maltese" },
    { longValue: "norwegian", value: "nb", label: "🇳🇴 Norwegian" },
    { longValue: "portuguese", value: "pt", label: "🇵🇹 Portuguese" },
    { longValue: "polish", value: "pl", label: "🇵🇱 Polish" },
    { longValue: "romanian", value: "ro", label: "🇷🇴 Romanian" },
    { longValue: "spanish", value: "es", label: "🇪🇸 Spanish" },
    { longValue: "swedish", value: "sv", label: "🇸🇪 Swedish" },
    { longValue: "serbian_cyrillic", value: "sr-Cyrl", label: "🇷🇸 Serbian (Cyrillic)" },
    { longValue: "serbian_latin", value: "sr-Latn", label: "🇷🇸 Serbian (Latin)" },
    { longValue: "slovak", value: "sk", label: "🇸🇰 Slovak" },
    { longValue: "slovenian", value: "sl", label: "🇸🇮 Slovenian" },
    { longValue: "turkish", value: "tr", label: "🇹🇷 Turkish" },
    { longValue: "ukrainian", value: "uk", label: "🇺🇦 Ukrainian" },
  ],

  "North America": [
    { longValue: "french_ca", value: "fr-CA", label: "🇨🇦 Canadian French" },
    { longValue: "english", value: "en", label: "🇺🇸 English" },
    { longValue: "haitian_creole", value: "ht", label: "🇭🇹 Haitian Creole" },
  ],

  "Africa": [
    { longValue: "amharic", value: "am", label: "🇪🇹 Amharic" },
    { longValue: "swahili", value: "sw", label: "🇹🇿 Swahili" },
    { longValue: "tigrinya", value: "ti", label: "🇪🇷 Tigrinya" },
  ],

  "South America": [
    { longValue: "portuguese_br", value: "pt-BR", label: "🇧🇷 Brazilian Portuguese" },
    { longValue: "spanish_419", value: "es-419", label: "🌎 Latin American Spanish" },
  ],
};

// Commonly used languages for quick access
export const POPULAR_LANGUAGES = [
  { longValue: "english", value: "en", label: "🇺🇸 English" },
  { longValue: "spanish", value: "es", label: "🇪🇸 Spanish" },
  { longValue: "french", value: "fr", label: "🇫🇷 French" },
  { longValue: "chinese_simplified", value: "zh-CN", label: "🇨🇳 Simplified Chinese" },
];

// Default target language code (falls back to 'en' if POPULAR_LANGUAGES is empty)
export const DEFAULT_TARGET_LANGUAGE = POPULAR_LANGUAGES[0]?.value ?? 'en'

// Alphabetically sorted array of all supported languages
export const LANGUAGES: Language[] = Object.values(LANGUAGES_BY_REGION)
  .flat()
  .sort((a, b) => {
    // Extract the text part of the label (after the flag emoji and space)
    const nameA = a.label.split(' ').slice(1).join(' ').toLowerCase();
    const nameB = b.label.split(' ').slice(1).join(' ').toLowerCase();
    return nameA.localeCompare(nameB);
  });

// Maximum number of pages allowed for subscription tier
export const MAX_PAGES_SUBSCRIPTION = 10000;

// Maximum file size limit in bytes (256MB)
export const MAX_FILE_SIZE_MB = 256 * 1024 * 1024;

// Human-readable string representation of the maximum file size
export const MAX_FILE_SIZE_STRING = `${MAX_FILE_SIZE_MB / 1024 / 1024}MB`;

/**
 * Groups of supported file formats, used by UI components (marketing pages, selectors, etc).
 * Keep these in sync with `getFileIcon()` in `lib/icons.tsx`.
 */
export const FILE_FORMAT_GROUPS = [
  {
    name: 'Documents',
    formats: ['Pdf', 'Docx', 'Pptx'],
  },
] as const;

export const DUMMY_ACCOUNT = {
  id: '1',
  name: 'John Doe',
  picture_url: '/avatar.jpeg',
  email: 'john.doe@example.com',
}