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

export type Theme = "light" | "dark";
export type Language = "sr" | "en";

type SettingsContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
};

type SettingsSnapshot = {
  language: Language;
  theme: Theme;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEYS = {
  language: "tow-language",
  theme: "tow-theme",
} as const;

const DEFAULT_LANGUAGE: Language = "sr";
const DEFAULT_THEME: Theme = "light";
const DEFAULT_SNAPSHOT: SettingsSnapshot = {
  language: DEFAULT_LANGUAGE,
  theme: DEFAULT_THEME,
};

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function isLanguage(value: string | null): value is Language {
  return value === "sr" || value === "en";
}

function readStoredSnapshot(): SettingsSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_SNAPSHOT;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
  const storedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);

  return {
    language: isLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE,
    theme: isTheme(storedTheme) ? storedTheme : DEFAULT_THEME,
  };
}

function writeSnapshot(nextSnapshot: SettingsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.theme, nextSnapshot.theme);
  window.localStorage.setItem(STORAGE_KEYS.language, nextSnapshot.language);
}

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
    const targetLang = snapshot.language === "sr" ? "sr-Latn-RS" : "en";
    if (root.lang !== targetLang) {
      root.lang = targetLang;
    }
  }, [snapshot.language, snapshot.theme]);

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
        event.key === STORAGE_KEYS.theme ||
        event.key === STORAGE_KEYS.language
      ) {
        setSnapshot(readStoredSnapshot());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    const nextSnapshot: SettingsSnapshot = {
      language: nextLanguage,
      theme: stateRef.current.theme,
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    const nextSnapshot: SettingsSnapshot = {
      language: stateRef.current.language,
      theme: nextTheme,
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextSnapshot: SettingsSnapshot = {
      language: stateRef.current.language === "sr" ? "en" : "sr",
      theme: stateRef.current.theme,
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextSnapshot: SettingsSnapshot = {
      language: stateRef.current.language,
      theme: stateRef.current.theme === "light" ? "dark" : "light",
    };
    writeSnapshot(nextSnapshot);
    setSnapshot(nextSnapshot);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      language: snapshot.language,
      setLanguage,
      theme: snapshot.theme,
      setTheme,
      toggleLanguage,
      toggleTheme,
    }),
    [snapshot.language, snapshot.theme, setLanguage, setTheme, toggleLanguage, toggleTheme],
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
