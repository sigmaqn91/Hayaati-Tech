import { SupportedLanguage, LanguageBundle, TranslationSchema, ContentSchema } from './types';
import enUi from './en/ui.json';
import enContent from './en/content.json';

export const languageList: Array<{
  code: SupportedLanguage;
  name: string;
  native: string;
  rtl: boolean;
}> = [
  { code: 'en', name: 'English', native: 'English', rtl: false },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', rtl: false },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', rtl: false },
  { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'mr', name: 'Marathi', native: 'मराठी', rtl: false },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', rtl: false },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', rtl: false },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', rtl: false },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', rtl: false },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', rtl: false },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', rtl: false },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', rtl: false },
  { code: 'fr', name: 'French', native: 'Français', rtl: false },
  { code: 'de', name: 'German', native: 'Deutsch', rtl: false },
  { code: 'es', name: 'Spanish', native: 'Español', rtl: false },
  { code: 'pt', name: 'Portuguese', native: 'Português', rtl: false },
  { code: 'it', name: 'Italian', native: 'Italiano', rtl: false },
  { code: 'zh', name: 'Chinese', native: '中文', rtl: false },
  { code: 'ja', name: 'Japanese', native: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', native: '한국어', rtl: false },
  { code: 'ru', name: 'Russian', native: 'Русский', rtl: false },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', rtl: false },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', rtl: false },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', rtl: false },
  { code: 'pl', name: 'Polish', native: 'Polski', rtl: false },
  { code: 'fa', name: 'Persian', native: 'فارسی', rtl: true },
  { code: 'th', name: 'Thai', native: 'ไทย', rtl: false },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', rtl: false },
];

export const defaultBundle: LanguageBundle = {
  ui: enUi as unknown as TranslationSchema,
  content: enContent as unknown as ContentSchema,
};

// Cache dynamically loaded bundles
const bundleCache = new Map<SupportedLanguage, LanguageBundle>();
bundleCache.set('en', defaultBundle);

export async function loadLanguageBundle(code: SupportedLanguage): Promise<LanguageBundle> {
  if (bundleCache.has(code)) {
    return bundleCache.get(code)!;
  }

  if (code === 'en') {
    return defaultBundle;
  }

  try {
    const [uiMod, contentMod] = await Promise.all([
      import(`./${code}/ui.json`),
      import(`./${code}/content.json`),
    ]);

    const bundle: LanguageBundle = {
      ui: (uiMod.default || uiMod) as TranslationSchema,
      content: (contentMod.default || contentMod) as ContentSchema,
    };

    bundleCache.set(code, bundle);
    return bundle;
  } catch (err) {
    console.warn(`Failed to dynamically import bundle for ${code}, falling back to English.`, err);
    return defaultBundle;
  }
}
