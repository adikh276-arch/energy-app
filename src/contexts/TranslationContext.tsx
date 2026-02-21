import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { translateTexts, LANGUAGES, type LangCode } from '@/lib/translate';

interface TranslationContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (text: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  lang: 'en',
  setLang: () => {},
  t: (text) => text,
});

export const useTranslation = () => useContext(TranslationContext);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as LangCode;
    if (urlLang && LANGUAGES.some((l) => l.code === urlLang)) return urlLang;
    return (sessionStorage.getItem('app_language') as LangCode) || 'en';
  });

  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const pendingTexts = useRef<Set<string>>(new Set());
  const batchTimer = useRef<ReturnType<typeof setTimeout>>();

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    sessionStorage.setItem('app_language', newLang);
    setTranslations(new Map()); // clear on language change
  }, []);

  const processBatch = useCallback(async () => {
    if (pendingTexts.current.size === 0 || lang === 'en') return;
    const texts = Array.from(pendingTexts.current);
    pendingTexts.current.clear();

    const results = await translateTexts(texts, lang);
    setTranslations((prev) => {
      const next = new Map(prev);
      texts.forEach((text, i) => next.set(text, results[i]));
      return next;
    });
  }, [lang]);

  const t = useCallback(
    (text: string): string => {
      if (lang === 'en') return text;
      const translated = translations.get(text);
      if (translated) return translated;

      // Queue for batch translation
      if (!pendingTexts.current.has(text)) {
        pendingTexts.current.add(text);
        clearTimeout(batchTimer.current);
        batchTimer.current = setTimeout(processBatch, 100);
      }
      return text; // return English while loading
    },
    [lang, translations, processBatch]
  );

  useEffect(() => {
    // Trigger initial batch
    const timer = setTimeout(processBatch, 200);
    return () => clearTimeout(timer);
  }, [lang, processBatch]);

  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
}
