"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type TokenResponse = {
  expiresAt: number | null;
  token: string | null;
};

const REFRESH_BUFFER_MS = 60_000;

export function useEmailPasswordAuth() {
  const cacheRef = useRef<TokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      const cachedToken = cacheRef.current;

      if (
        !forceRefreshToken &&
        cachedToken &&
        cachedToken.token &&
        cachedToken.expiresAt !== null &&
        cachedToken.expiresAt - Date.now() > REFRESH_BUFFER_MS
      ) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return cachedToken.token;
      }

      try {
        const response = await fetch("/api/auth/token", {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          cacheRef.current = null;
          setIsAuthenticated(false);
          setIsLoading(false);
          return null;
        }

        const data = (await response.json()) as TokenResponse;
        cacheRef.current = data;
        if (!data.token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return null;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
        return data.token;
      } catch {
        cacheRef.current = null;
        setIsAuthenticated(false);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAccessToken({ forceRefreshToken: true });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchAccessToken, pathname]);

  return useMemo(
    () => ({
      fetchAccessToken,
      isAuthenticated,
      isLoading,
    }),
    [fetchAccessToken, isAuthenticated, isLoading],
  );
}
