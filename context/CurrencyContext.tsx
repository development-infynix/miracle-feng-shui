'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Country, Currency, Language, translations } from '@/lib/translations';

interface LocaleContextType {
  country: Country;
  currency: Currency;
  language: Language;
  currencySymbol: string;
  isRtl: boolean;
  setCountry: (country: Country) => void;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
  formatPrice: (inrAmount: number) => string;
  convertAmount: (inrAmount: number) => number;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Conversion Rate: 1 AED ≈ 22.8 INR
const INR_PER_AED = 22.8;

const STORAGE_COUNTRY = 'mfs_country_v1';
const STORAGE_CURRENCY = 'mfs_currency_v1';
const STORAGE_LANG = 'mfs_lang_v1';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>('India');
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem(STORAGE_COUNTRY) as Country | null;
      const savedCurrency = localStorage.getItem(STORAGE_CURRENCY) as Currency | null;
      const savedLang = localStorage.getItem(STORAGE_LANG) as Language | null;

      // 1. Language is STRICTLY manual - default to 'en' unless user explicitly saved a choice
      if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
        setLanguageState(savedLang);
        if (typeof document !== 'undefined') {
          document.documentElement.dir = 'ltr';
          document.documentElement.lang = savedLang;
        }
      } else {
        setLanguageState('en');
        if (typeof document !== 'undefined') {
          document.documentElement.dir = 'ltr';
          document.documentElement.lang = 'en';
        }
      }

      // 2. If user already chose Country / Currency, respect their preference
      if (savedCountry && (savedCountry === 'India' || savedCountry === 'UAE')) {
        setCountryState(savedCountry);
        if (savedCurrency && (savedCurrency === 'INR' || savedCurrency === 'AED')) {
          setCurrencyState(savedCurrency);
        } else {
          setCurrencyState(savedCountry === 'UAE' ? 'AED' : 'INR');
        }
      } else {
        // 3. Auto-detect Country & Currency from Browser Timezone & Geolocation
        let detectedCountry: Country = 'India';
        let detectedCurrency: Currency = 'INR';

        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (
            tz.includes('Dubai') ||
            tz.includes('Gulf') ||
            tz.includes('Muscat') ||
            tz.includes('Riyadh') ||
            tz.includes('Qatar') ||
            tz.includes('Bahrain')
          ) {
            detectedCountry = 'UAE';
            detectedCurrency = 'AED';
          } else {
            detectedCountry = 'India';
            detectedCurrency = 'INR';
          }
        } catch {}

        setCountryState(detectedCountry);
        setCurrencyState(detectedCurrency);

        // Optional non-blocking IP verification for precise country if available
        if (typeof window !== 'undefined') {
          fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
            .then((res) => res.json())
            .then((data) => {
              if (data && data.country_code) {
                const code = data.country_code.toUpperCase();
                if (code === 'AE') {
                  setCountryState('UAE');
                  setCurrencyState('AED');
                } else if (code === 'IN') {
                  setCountryState('India');
                  setCurrencyState('INR');
                }
              }
            })
            .catch(() => {
              // Ignore network timeouts; timezone fallback is already active
            });
        }
      }
    } catch {
      // ignore storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setCountry = (c: Country) => {
    setCountryState(c);
    try {
      localStorage.setItem(STORAGE_COUNTRY, c);
    } catch {}

    // Auto switch currency to match country
    if (c === 'India') {
      setCurrencyState('INR');
      try {
        localStorage.setItem(STORAGE_CURRENCY, 'INR');
      } catch {}
    } else if (c === 'UAE') {
      setCurrencyState('AED');
      try {
        localStorage.setItem(STORAGE_CURRENCY, 'AED');
      } catch {}
    }
  };

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    try {
      localStorage.setItem(STORAGE_CURRENCY, cur);
    } catch {}
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG, lang);
    } catch {}
    if (typeof document !== 'undefined') {
      // Keep standard LTR alignment and UI structure per user instruction
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const convertAmount = (inrAmount: number): number => {
    if (currency === 'AED') {
      return Math.round(inrAmount / INR_PER_AED);
    }
    return inrAmount;
  };

  const formatPrice = (inrAmount: number): string => {
    if (!inrAmount && inrAmount !== 0) return '';
    if (currency === 'AED') {
      const aed = Math.round(inrAmount / INR_PER_AED);
      return language === 'ar' ? `${aed.toLocaleString('ar-AE')} د.إ` : `AED ${aed.toLocaleString('en-US')}`;
    }
    // Default INR (₹)
    return `₹ ${Math.round(inrAmount).toLocaleString('en-IN')}`;
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || fallback || key;
  };

  // Keep LTR alignment identical to English
  const isRtl = false;
  const currencySymbol = currency === 'AED' ? (language === 'ar' ? 'د.إ' : 'AED') : '₹';

  return (
    <LocaleContext.Provider
      value={{
        country,
        currency,
        language,
        currencySymbol,
        isRtl,
        setCountry,
        setCurrency,
        setLanguage,
        formatPrice,
        convertAmount,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Alias for convenience
export const useCurrency = useLocale;
