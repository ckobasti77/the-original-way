"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  getLocaleFromPathname,
  localizeHref,
  type StoreLocale,
} from "@/lib/storefront-i18n";

export type Theme = "light" | "dark";
export type Language = StoreLocale;

type SettingsContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
};

type SettingsSnapshot = {
  theme: Theme;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEYS = {
  theme: "tow-theme",
} as const;

const DEFAULT_THEME: Theme = "light";
const DEFAULT_SNAPSHOT: SettingsSnapshot = {
  theme: DEFAULT_THEME,
};

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function readStoredSnapshot(): SettingsSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_SNAPSHOT;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);

  return {
    theme: isTheme(storedTheme) ? storedTheme : DEFAULT_THEME,
  };
}

function writeSnapshot(nextSnapshot: SettingsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.theme, nextSnapshot.theme);
}

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = getLocaleFromPathname(pathname);
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>(DEFAULT_SNAPSHOT);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSnapshot(readStoredSnapshot());
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.theme !== snapshot.theme) {
      root.dataset.theme = snapshot.theme;
    }
    const targetLang = language === "sr" ? "sr-Latn-RS" : "en";
    if (root.lang !== targetLang) {
      root.lang = targetLang;
    }
  }, [language, snapshot.theme]);

  const stateRef = useRef(snapshot);
  useEffect(() => {
    stateRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === STORAGE_KEYS.theme
      ) {
        setSnapshot(readStoredSnapshot());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      document.cookie = `tow-locale=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
      const query = searchParams.toString();
      router.push(
        `${localizeHref(pathname, nextLanguage)}${query ? `?${query}` : ""}`,
      );
    },
    [pathname, router, searchParams],
  );

  const setTheme = useCallback((nextTheme: Theme) => {
    const nextSnapshot: SettingsSnapshot = {
      theme: nextTheme,
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "sr" ? "en" : "sr");
  }, [language, setLanguage]);

  const toggleTheme = useCallback(() => {
    const nextSnapshot: SettingsSnapshot = {
      theme: stateRef.current.theme === "light" ? "dark" : "light",
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      language,
      setLanguage,
      theme: snapshot.theme,
      setTheme,
      toggleLanguage,
      toggleTheme,
    }),
    [language, snapshot.theme, setLanguage, setTheme, toggleLanguage, toggleTheme],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider.");
  }

  return context;
}
