// src/lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      lng: "en", 
      fallbackLng: "en",
      interpolation: {
        escapeValue: false, 
      },
      resources: {
        en: { translation: {} } // Empty resources for now
      }
    });
}

export default i18n;