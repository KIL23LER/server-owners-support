import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    supportedLngs: ["ar", "en"],
    initImmediate: false,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "sos-lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export function applyDirection(lang: string) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

i18n.on("languageChanged", applyDirection);

applyDirection(i18n.language || "ar");

export default i18n;
