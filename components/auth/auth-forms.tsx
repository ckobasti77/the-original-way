"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSettings } from "@/components/settings-provider";
import type { InputHTMLAttributes, ReactNode } from "react";

import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  type AuthActionState,
} from "@/app/prijava/actions";

import { AUTH_COPY } from "./content";

const CARD_CLASS =
  "rounded-[1.9rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] px-5 py-5 shadow-[0_28px_90px_rgba(var(--shadow-rgb),0.14)] backdrop-blur-2xl sm:px-6 sm:py-6";

const INPUT_CLASS =
  "w-full min-h-12 rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] px-4 py-3 text-[0.95rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:bg-[rgba(var(--shadow-rgb),0.035)] focus:ring-4 focus:ring-[rgba(var(--accent-rgb),0.08)]";

const FIELD_LABEL_CLASS =
  "text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]";

const LINK_CLASS =
  "text-sm font-semibold text-[var(--text-primary)] underline decoration-[rgba(var(--accent-rgb),0.28)] underline-offset-4 transition hover:text-[var(--accent-strong)] hover:decoration-[rgba(var(--accent-rgb),0.82)]";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function FormAlert({
  fieldErrors,
  message,
}: {
  fieldErrors?: AuthActionState["fieldErrors"];
  message?: string;
}) {
  const errors = Object.values(fieldErrors ?? {}).flat();

  if (!message && errors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.25rem] border border-[rgba(var(--accent-rgb),0.16)] bg-[rgba(var(--accent-rgb),0.06)] px-4 py-3 text-sm text-[var(--text-primary)]">
      {message ? <p className="font-semibold leading-6">{message}</p> : null}
      {errors.length > 0 ? (
        <ul className={cn("mt-2 space-y-1 text-sm", message ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]")}>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AuthField({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-[#9c5030]">{error}</p> : null}
    </div>
  );
}

function AuthInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(INPUT_CLASS, props.className)} />;
}

function AuthSubmit({
  label,
  pendingLabel,
  pending,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--action-primary-bg)] px-5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--action-primary-fg)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function AuthCard({ children }: { children: ReactNode }) {
  return <section className={CARD_CLASS}>{children}</section>;
}

export function LoginForm() {
  const { language } = useSettings();
  const copy = AUTH_COPY[language];
  const [state, action, pending] = useActionState(login, {});

  return (
    <div className="w-full max-w-md">
      <AuthCard>
        <form action={action} className="space-y-4">
          <input type="hidden" name="language" value={language} />
          <AuthField
            htmlFor="login-email"
            label={copy.fields.email[language]}
            error={state?.fieldErrors?.email?.[0]}
          >
            <AuthInput
              autoFocus
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={copy.placeholders.email[language]}
              required
            />
          </AuthField>

          <AuthField
            htmlFor="login-password"
            label={copy.fields.password[language]}
            error={state?.fieldErrors?.password?.[0]}
          >
            <AuthInput
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={copy.placeholders.password[language]}
              required
            />
          </AuthField>

          <FormAlert fieldErrors={state?.fieldErrors} message={state?.message} />

          <AuthSubmit
            pending={pending}
            label={copy.submit.login[language]}
            pendingLabel={copy.submit.pending[language]}
          />

          <div className="flex flex-col gap-3 pt-1 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link href="/registracija" className={LINK_CLASS}>
              {copy.links.register[language]}
            </Link>
            <Link href="/prijava/zaboravljena-sifra" className={LINK_CLASS}>
              {copy.links.forgotPassword[language]}
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}

export function RegisterForm() {
  const { language } = useSettings();
  const copy = AUTH_COPY[language];
  const [state, action, pending] = useActionState(register, {});

  return (
    <div className="w-full max-w-2xl">
      <AuthCard>
        <form action={action} className="space-y-4">
          <input type="hidden" name="language" value={language} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              htmlFor="register-first-name"
              label={copy.fields.firstName[language]}
              error={state?.fieldErrors?.firstName?.[0]}
            >
              <AuthInput
                autoFocus
                id="register-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder={copy.placeholders.firstName[language]}
                required
              />
            </AuthField>

            <AuthField
              htmlFor="register-last-name"
              label={copy.fields.lastName[language]}
              error={state?.fieldErrors?.lastName?.[0]}
            >
              <AuthInput
                id="register-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={copy.placeholders.lastName[language]}
                required
              />
            </AuthField>
          </div>

          <AuthField
            htmlFor="register-email"
            label={copy.fields.email[language]}
            error={state?.fieldErrors?.email?.[0]}
          >
            <AuthInput
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={copy.placeholders.email[language]}
              required
            />
          </AuthField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              htmlFor="register-password"
              label={copy.fields.password[language]}
              error={state?.fieldErrors?.password?.[0]}
            >
              <AuthInput
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={copy.placeholders.password[language]}
                required
              />
            </AuthField>

            <AuthField
              htmlFor="register-confirm-password"
              label={copy.fields.confirmPassword[language]}
              error={state?.fieldErrors?.confirmPassword?.[0]}
            >
              <AuthInput
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder={copy.placeholders.confirmPassword[language]}
                required
              />
            </AuthField>
          </div>

          <FormAlert fieldErrors={state?.fieldErrors} message={state?.message} />

          <AuthSubmit
            pending={pending}
            label={copy.submit.register[language]}
            pendingLabel={copy.submit.pending[language]}
          />

          <div className="pt-1 text-sm">
            <Link href="/prijava" className={LINK_CLASS}>
              {copy.links.login[language]}
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}

export function ForgotPasswordForm() {
  const { language } = useSettings();
  const copy = AUTH_COPY[language];
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  return (
    <div className="w-full max-w-md">
      <AuthCard>
        <form action={action} className="space-y-4">
          <input type="hidden" name="language" value={language} />
          <AuthField
            htmlFor="forgot-email"
            label={copy.fields.email[language]}
            error={state?.fieldErrors?.email?.[0]}
          >
            <AuthInput
              autoFocus
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={copy.placeholders.email[language]}
              required
            />
          </AuthField>

          <FormAlert fieldErrors={state?.fieldErrors} message={state?.message} />

          <AuthSubmit
            pending={pending}
            label={copy.submit.forgot[language]}
            pendingLabel={copy.submit.pending[language]}
          />

          {state?.resetLink ? (
            <div className="pt-1">
              <Link
                href={state.resetLink}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[rgba(var(--accent-rgb),0.18)] bg-[rgba(var(--accent-rgb),0.08)] px-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--text-primary)] transition hover:bg-[rgba(var(--accent-rgb),0.12)]"
              >
                {copy.links.resetLink[language]}
              </Link>
            </div>
          ) : null}
        </form>
      </AuthCard>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { language } = useSettings();
  const copy = AUTH_COPY[language];
  const [state, action, pending] = useActionState(resetPassword, {});

  return (
    <div className="w-full max-w-md">
      <AuthCard>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="language" value={language} />

          <AuthField
            htmlFor="reset-password"
            label={copy.fields.password[language]}
            error={state?.fieldErrors?.password?.[0]}
          >
            <AuthInput
              autoFocus
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={copy.placeholders.password[language]}
              required
            />
          </AuthField>

          <AuthField
            htmlFor="reset-confirm-password"
            label={copy.fields.confirmPassword[language]}
            error={state?.fieldErrors?.confirmPassword?.[0]}
          >
            <AuthInput
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={copy.placeholders.confirmPassword[language]}
              required
            />
          </AuthField>

          <FormAlert fieldErrors={state?.fieldErrors} message={state?.message} />

          <AuthSubmit
            pending={pending}
            label={copy.submit.reset[language]}
            pendingLabel={copy.submit.pending[language]}
          />
        </form>
      </AuthCard>
    </div>
  );
}
