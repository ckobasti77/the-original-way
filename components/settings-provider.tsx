"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
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

const SETTINGS_EVENT = "tow-settings-change";
const DEFAULT_LANGUAGE: Language = "sr";
const DEFAULT_THEME: Theme = "light";
const DEFAULT_SNAPSHOT: SettingsSnapshot = {
  language: DEFAULT_LANGUAGE,
  theme: DEFAULT_THEME,
};

let cachedSnapshot: SettingsSnapshot = DEFAULT_SNAPSHOT;

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function isLanguage(value: string | null): value is Language {
  return value === "sr" || value === "en";
}

function getServerSnapshot(): SettingsSnapshot {
  return DEFAULT_SNAPSHOT;
}

function getSnapshot(theme: Theme, language: Language) {
  if (
    cachedSnapshot.theme === theme &&
    cachedSnapshot.language === language
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    language,
    theme,
  };

  return cachedSnapshot;
}

function getClientSnapshot(): SettingsSnapshot {
  if (typeof window === "undefined") {
    return getServerSnapshot();
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
  const storedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);

  return getSnapshot(
    isTheme(storedTheme) ? storedTheme : DEFAULT_THEME,
    isLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE,
  );
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === STORAGE_KEYS.theme ||
      event.key === STORAGE_KEYS.language
    ) {
      onStoreChange();
    }
  };

  const handleSettingsChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SETTINGS_EVENT, handleSettingsChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SETTINGS_EVENT, handleSettingsChange);
  };
}

function writeSnapshot(nextSnapshot: SettingsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.theme, nextSnapshot.theme);
  window.localStorage.setItem(STORAGE_KEYS.language, nextSnapshot.language);
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language, theme } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.lang = language === "sr" ? "sr-Latn-RS" : "en";
  }, [language, theme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        writeSnapshot({
          language: nextLanguage,
          theme,
        });
      },
      theme,
      setTheme: (nextTheme) => {
        writeSnapshot({
          language,
          theme: nextTheme,
        });
      },
      toggleLanguage: () => {
        writeSnapshot({
          language: language === "sr" ? "en" : "sr",
          theme,
        });
      },
      toggleTheme: () => {
        writeSnapshot({
          language,
          theme: theme === "light" ? "dark" : "light",
        });
      },
    }),
    [language, theme],
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
