'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  toggleLanguage: () => {},
  isRTL: true,
});

export const useLanguage = () => useContext(LanguageContext);

// Module-level listener set so toggleLanguage can notify useSyncExternalStore
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

// Client snapshot: reads from localStorage
function getClientSnapshot(): Language {
  return (localStorage.getItem('moftahak-lang') as Language) || 'ar';
}

// Server snapshot: always 'ar' — must match the initial client render to avoid hydration mismatch
function getServerSnapshot(): Language {
  return 'ar';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useSyncExternalStore guarantees server ('ar') === initial client render, then
  // transitions to the actual localStorage value post-hydration without a mismatch.
  const language = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    const next: Language = language === 'ar' ? 'en' : 'ar';
    localStorage.setItem('moftahak-lang', next);
    listeners.forEach(l => l()); // notify useSyncExternalStore to re-read snapshot
  }, [language]);

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
