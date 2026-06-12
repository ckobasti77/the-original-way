"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { AUTH_COPY, getAuthLanguage } from "@/components/auth/content";
import { AUTH_SESSION_COOKIE, hashSessionToken } from "@/lib/auth/server";
import { createServerConvexClient } from "@/lib/convex/server-client";

type FieldName = "firstName" | "lastName" | "email" | "password" | "confirmPassword" | "token";

export type AuthActionState = {
  fieldErrors?: Partial<Record<FieldName, string[]>>;
  message?: string;
  resetLink?: string;
};

const EMPTY_STATE: AuthActionState = {};

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeState(
  message: string,
  fieldErrors?: AuthActionState["fieldErrors"],
  resetLink?: string,
) {
  return {
    fieldErrors,
    message,
    resetLink,
  };
}

function getLanguage(formData: FormData) {
  return getAuthLanguage(getValue(formData, "language"));
}

function validatePasswordPair(formData: FormData, language: ReturnType<typeof getLanguage>) {
  const password = getValue(formData, "password");
  const confirmPassword = getValue(formData, "confirmPassword");
  const fieldErrors: AuthActionState["fieldErrors"] = {};
  const messages = AUTH_COPY[language].messages;

  if (password.length < 8) {
    fieldErrors.password = [messages.passwordTooShort[language]];
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = [messages.passwordMismatch[language]];
  }

  return {
    confirmPassword,
    fieldErrors,
    password,
  };
}

async function setSessionCookie(sessionToken: string, expiresAt: number) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, sessionToken, {
    expires: new Date(expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function validateRegisterForm(formData: FormData) {
  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const firstName = getValue(formData, "firstName");
  const lastName = getValue(formData, "lastName");
  const email = getValue(formData, "email");
  const fieldErrors: AuthActionState["fieldErrors"] = {};
  const passwordData = validatePasswordPair(formData, language);

  if (firstName.length < 2) {
    fieldErrors.firstName = [messages.requiredFields[language]];
  }

  if (lastName.length < 2) {
    fieldErrors.lastName = [messages.requiredFields[language]];
  }

  if (!isValidEmail(email)) {
    fieldErrors.email = [messages.invalidEmail[language]];
  }

  if (passwordData.fieldErrors.password) {
    fieldErrors.password = passwordData.fieldErrors.password;
  }

  if (passwordData.fieldErrors.confirmPassword) {
    fieldErrors.confirmPassword = passwordData.fieldErrors.confirmPassword;
  }

  return {
    firstName,
    lastName,
    email,
    password: passwordData.password,
    confirmPassword: passwordData.confirmPassword,
    fieldErrors,
  };
}

function validateLoginForm(formData: FormData) {
  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!isValidEmail(email)) {
    fieldErrors.email = [messages.invalidEmail[language]];
  }

  if (!password) {
    fieldErrors.password = [messages.requiredFields[language]];
  }

  return {
    email,
    password,
    fieldErrors,
  };
}

function validateForgotPasswordForm(formData: FormData) {
  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const email = getValue(formData, "email");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!isValidEmail(email)) {
    fieldErrors.email = [messages.invalidEmail[language]];
  }

  return {
    email,
    fieldErrors,
  };
}

function validateResetPasswordForm(formData: FormData) {
  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const token = getValue(formData, "token");
  const fieldErrors: AuthActionState["fieldErrors"] = {};
  const passwordData = validatePasswordPair(formData, language);

  if (!token) {
    fieldErrors.token = [messages.invalidResetLink[language]];
  }

  if (passwordData.fieldErrors.password) {
    fieldErrors.password = passwordData.fieldErrors.password;
  }

  if (passwordData.fieldErrors.confirmPassword) {
    fieldErrors.confirmPassword = passwordData.fieldErrors.confirmPassword;
  }

  return {
    fieldErrors,
    password: passwordData.password,
    token,
  };
}

export async function register(
  state: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState | never> {
  void state;

  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const validated = validateRegisterForm(formData);

  if (Object.keys(validated.fieldErrors ?? {}).length > 0) {
    return makeState(messages.fieldCheck[language], validated.fieldErrors);
  }

  const convex = createServerConvexClient();

  try {
    const result = await convex.mutation(api.auth.register, {
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
      password: validated.password,
    });

    await setSessionCookie(result.sessionToken, result.sessionExpiresAt);
  } catch (error) {
    const message = error instanceof Error ? error.message : messages.registerFailed[language];

    if (message.toLowerCase().includes("email")) {
      return makeState(message, {
        email: [messages.registerEmailExists[language]],
      });
    }

    return makeState(messages.registerFailed[language]);
  }

  redirect("/profil");
}

export async function login(
  state: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState | never> {
  void state;

  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const validated = validateLoginForm(formData);

  if (Object.keys(validated.fieldErrors ?? {}).length > 0) {
    return makeState(messages.fieldCheck[language], validated.fieldErrors);
  }

  const convex = createServerConvexClient();

  try {
    const result = await convex.mutation(api.auth.login, {
      email: validated.email,
      password: validated.password,
    });

    await setSessionCookie(result.sessionToken, result.sessionExpiresAt);
  } catch (error) {
    void error;
    return makeState(messages.invalidCredentials[language]);
  }

  redirect("/profil");
}

export async function requestPasswordReset(
  state: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState> {
  void state;

  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const validated = validateForgotPasswordForm(formData);

  if (Object.keys(validated.fieldErrors ?? {}).length > 0) {
    return makeState(messages.fieldCheck[language], validated.fieldErrors);
  }

  const convex = createServerConvexClient();

  try {
    const result = await convex.mutation(api.auth.requestPasswordReset, {
      email: validated.email,
    });

    const resetLink = result.resetLink ?? undefined;

    return makeState(
      resetLink
        ? messages.forgotSuccessWithLink[language]
        : messages.forgotSuccessWithoutLink[language],
      undefined,
      resetLink,
    );
  } catch (error) {
    void error;
    return makeState(messages.forgotSuccessWithoutLink[language]);
  }
}

export async function resetPassword(
  state: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState | never> {
  void state;

  const language = getLanguage(formData);
  const messages = AUTH_COPY[language].messages;
  const validated = validateResetPasswordForm(formData);

  if (Object.keys(validated.fieldErrors ?? {}).length > 0) {
    return makeState(messages.fieldCheck[language], validated.fieldErrors);
  }

  const convex = createServerConvexClient();

  try {
    const result = await convex.mutation(api.auth.resetPassword, {
      password: validated.password,
      token: validated.token,
    });

    await setSessionCookie(result.sessionToken, result.sessionExpiresAt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.toLowerCase().includes("link") || message.toLowerCase().includes("token")) {
      return makeState(message, {
        token: [messages.invalidResetLink[language]],
      });
    }

    return makeState(messages.resetFailed[language]);
  }

  redirect("/profil");
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionToken) {
    try {
      const convex = createServerConvexClient();
      const sessionTokenHash = await hashSessionToken(sessionToken);
      await convex.mutation(api.auth.logout, { sessionTokenHash });
    } catch {
      // Clear the cookie even if the backend revocation fails.
    }
  }

  cookieStore.delete(AUTH_SESSION_COOKIE);
  redirect("/");
}
