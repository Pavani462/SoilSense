import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import { en } from '../translations/en';
import { te } from '../translations/te';
import { hi } from '../translations/hi';

export type Lang = 'en' | 'te' | 'hi';

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;

  // Existing static translation system
  t: (key: string) => string;

  // Dynamic translation system
  translate: (text: string) => Promise<string>;
};

const dictionaries = {
  en,
  te,
  hi,
} as any;

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',

  setLang: () => {},

  t: (key) => key,

  translate: async (text) => text,
});


const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';


export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [lang, setLang] = useState<Lang>(() => {

    const saved =
      localStorage.getItem('soil-lang');

    if (
      saved === 'en' ||
      saved === 'te' ||
      saved === 'hi'
    ) {
      return saved;
    }

    return 'en';
  });


  // Save selected language
  useEffect(() => {

    localStorage.setItem(
      'soil-lang',
      lang
    );

  }, [lang]);


  // ==========================================================
  // EXISTING STATIC TRANSLATION
  // ==========================================================

  const t = useMemo(() => {

    const getNestedValue = (
      object: any,
      key: string
    ): any => {

      return key
        .split('.')
        .reduce(
          (current, part) =>
            current?.[part],
          object
        );
    };


    return (key: string): string => {

      // First try selected language
      const translated =
        getNestedValue(
          dictionaries[lang],
          key
        );


      if (
        translated !== undefined &&
        translated !== null
      ) {
        return String(translated);
      }


      // If translation doesn't exist,
      // fall back to English
      const english =
        getNestedValue(
          dictionaries.en,
          key
        );


      if (
        english !== undefined &&
        english !== null
      ) {
        return String(english);
      }


      // Finally return the key itself
      return key;
    };

  }, [lang]);


  // ==========================================================
  // DYNAMIC TRANSLATION
  // ==========================================================

  const translate = async (
    text: string
  ): Promise<string> => {

    // Empty text
    if (!text || !text.trim()) {
      return text;
    }


    // English does not need translation
    if (lang === 'en') {
      return text;
    }


    try {

      const response = await fetch(
        `${API_BASE}/translate`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            text,
            target_language: lang,
          }),
        }
      );


      if (!response.ok) {

        console.error(
          'Translation request failed:',
          response.status
        );

        return text;
      }


      const data =
        await response.json();


      return (
        data.translation ||
        text
      );

    } catch (error) {

      console.error(
        'Dynamic translation error:',
        error
      );

      return text;
    }
  };


  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}


export const useLanguage =
  () => useContext(LanguageContext);