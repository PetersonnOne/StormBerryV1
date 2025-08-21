import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
import enTranslations from './locales/en';
import esTranslations from './locales/es';
import frTranslations from './locales/fr';
import deTranslations from './locales/de';
import jaTranslations from './locales/ja';
import zhTranslations from './locales/zh';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
  fr: {
    translation: frTranslations,
  },
  de: {
    translation: deTranslations,
  },
  ja: {
    translation: jaTranslations,
  },
  zh: {
    translation: zhTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
    },
  });

export default i18n;