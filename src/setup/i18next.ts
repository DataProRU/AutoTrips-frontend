import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ruTranslation from "../locales/ru/translation.json";
import enTranslation from "../locales/en/translation.json";
import geTranslation from "../locales/ge/translation.json";
import azTranslation from "../locales/az/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    ru: {
      translation: ruTranslation,
    },
    az: {
      translation: azTranslation,
    },
    ge: {
      translation: geTranslation,
    },
  },
  lng: "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
