import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en';
import hiTranslations from '../translations/hi';
import guTranslations from '../translations/gu';

const LanguageContext = createContext();

// Custom event name for language changes
const LANG_CHANGE_EVENT = 'agri-lang-change';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get language from localStorage or default to 'en'
  const getInitialLanguage = () => {
    try {
      const savedTheme = localStorage.getItem('agriTheme');
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        if (parsed.language) return parsed.language;
      }
    } catch (e) {
      console.error('Error parsing saved theme:', e);
    }
    const dataLang = document.documentElement.getAttribute('data-lang');
    if (dataLang) return dataLang;
    return 'en';
  };

  const [language, setLanguage] = useState(getInitialLanguage());

  const translations = {
    en: enTranslations,
    hi: hiTranslations,
    gu: guTranslations,
  };

  /**
   * Safe translation function: returns translated string or English fallback or the key itself.
   * Never crashes on a missing key.
   */
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const changeLanguage = (newLang) => {
    if (!translations[newLang]) {
      console.warn(`Language "${newLang}" not supported, falling back to "en"`);
      newLang = 'en';
    }
    setLanguage(newLang);

    // Persist to localStorage
    try {
      const savedTheme = localStorage.getItem('agriTheme');
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        parsed.language = newLang;
        localStorage.setItem('agriTheme', JSON.stringify(parsed));
      } else {
        localStorage.setItem('agriTheme', JSON.stringify({ language: newLang }));
      }
    } catch (e) {
      console.error('Error updating theme in localStorage:', e);
    }

    // Update data-lang attribute
    document.documentElement.setAttribute('data-lang', newLang);

    // Dispatch custom event so other tabs/windows can react
    try {
      window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: { language: newLang } }));
    } catch (e) {
      // Ignore event dispatch errors
    }
  };

  // Listen for language changes from other components / tabs
  useEffect(() => {
    const handleCustomLangChange = (e) => {
      if (e.detail?.language && e.detail.language !== language) {
        setLanguage(e.detail.language);
      }
    };

    // Cross-tab: listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'agriTheme') {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.language && parsed.language !== language) {
            setLanguage(parsed.language);
            document.documentElement.setAttribute('data-lang', parsed.language);
          }
        } catch (err) {
          console.error('Error parsing storage change:', err);
        }
      }
    };

    window.addEventListener(LANG_CHANGE_EVENT, handleCustomLangChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(LANG_CHANGE_EVENT, handleCustomLangChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  // Initialize language on mount
  useEffect(() => {
    const initialLang = getInitialLanguage();
    if (initialLang !== language) {
      setLanguage(initialLang);
      document.documentElement.setAttribute('data-lang', initialLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    language,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
