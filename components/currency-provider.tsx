"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import {
  DEFAULT_CURRENCY,
  FALLBACK_EUR_RSD,
  formatMoneyFromEur,
  isCurrency,
  type Currency,
} from "@/lib/currency";

type CurrencyContextValue = {
  // Efektivna valuta: izbor korisnika ako postoji, inače admin default, inače EUR.
  currency: Currency;
  // Da li je posetilac sam birao valutu (localStorage).
  hasChosen: boolean;
  rate: number;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  // Formatira iznos zadat u EUR bazi u aktivnu valutu.
  formatPrice: (eur: number, options?: { rsdOverride?: number | null }) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "tow-currency";

function readStoredChoice(): Currency | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isCurrency(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // null = posetilac još nije birao valutu (koristi se admin default).
  const [userChoice, setUserChoice] = useState<Currency | null>(null);

  const config = useQuery(api.currency.getPublicConfig);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setUserChoice(readStoredChoice());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Sinhronizacija između tabova.
  useEffect(() => {
    if (typeof window === "undefined") {
      return () => undefined;
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEY) {
        setUserChoice(readStoredChoice());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const defaultCurrency = config?.defaultCurrency ?? DEFAULT_CURRENCY;
  const currency = userChoice ?? defaultCurrency;
  const rate = config?.rate ?? FALLBACK_EUR_RSD;

  const setCurrency = useCallback((next: Currency) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Privatni prozor / blokiran storage — izbor ostaje samo u memoriji.
    }
    setUserChoice(next);
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === "EUR" ? "RSD" : "EUR");
  }, [currency, setCurrency]);

  const formatPrice = useCallback(
    (eur: number, options?: { rsdOverride?: number | null }) =>
      formatMoneyFromEur(eur, {
        currency,
        rate,
        rsdOverride: options?.rsdOverride ?? null,
      }),
    [currency, rate],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      hasChosen: userChoice != null,
      rate,
      setCurrency,
      toggleCurrency,
      formatPrice,
    }),
    [currency, userChoice, rate, setCurrency, toggleCurrency, formatPrice],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider.");
  }
  return context;
}

// Klijentska komponenta za prikaz cene iz EUR baze — koristi se i unutar
// server komponenti (renderuje se na klijentu, čita aktivnu valutu/kurs).
export function Price({
  value,
  rsdOverride,
  className,
}: {
  value: number;
  rsdOverride?: number | null;
  className?: string;
}) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(value, { rsdOverride })}</span>;
}
