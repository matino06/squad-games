import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = '@mafia_language';
const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on startup
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && TRANSLATIONS[saved]) {
          setLanguageState(saved);
        }
      })
      .catch(() => {}) // silently ignore errors
      .finally(() => setIsLoaded(true));
  }, []);

  // Save language to storage whenever it changes
  const setLanguage = (code) => {
    setLanguageState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  };

  const t = (key, vars = {}) => {
    const langDict = TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE];
    let str = langDict[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
    return str;
  };

  // Don't render until language is loaded to avoid flicker
  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Shorthand hook — most screens only need t()
export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  return { t: ctx.t };
};
