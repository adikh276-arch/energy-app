const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';

const cache = new Map<string, string>();

function cacheKey(text: string, lang: string) {
  return `${lang}::${text}`;
}

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
] as const;

export type LangCode = typeof LANGUAGES[number]['code'];

export async function translateTexts(texts: string[], targetLang: string): Promise<string[]> {
  if (targetLang === 'en' || !API_KEY) return texts;

  const results: string[] = [];
  const toTranslate: { index: number; text: string }[] = [];

  texts.forEach((text, i) => {
    const key = cacheKey(text, targetLang);
    const cached = cache.get(key);
    if (cached) {
      results[i] = cached;
    } else {
      toTranslate.push({ index: i, text });
      results[i] = text; // fallback
    }
  });

  if (toTranslate.length === 0) return results;

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: toTranslate.map((t) => t.text),
          target: targetLang,
          source: 'en',
          format: 'text',
        }),
      }
    );

    if (!res.ok) return results;

    const data = await res.json();
    const translations = data.data?.translations || [];

    toTranslate.forEach((item, idx) => {
      const translated = translations[idx]?.translatedText || item.text;
      cache.set(cacheKey(item.text, targetLang), translated);
      results[item.index] = translated;
    });
  } catch {
    // fallback to English
  }

  return results;
}
