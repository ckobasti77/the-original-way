"use server";

import { requireCurrentAdmin } from "@/lib/auth/current-admin";
import type { OrderEmailStage } from "./admin/_lib/types";

type OrderEmailPayload = {
  stage: OrderEmailStage;
  email?: string;
  firstName: string;
  lastName: string;
  orderNumber: string;
  trackingNumber?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/;
const ALLOWED_STAGES = new Set<OrderEmailStage>([
  "processing",
  "sent",
  "completed",
]);

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function validatePayload(payload: OrderEmailPayload) {
  if (
    !ALLOWED_STAGES.has(payload.stage) ||
    !ORDER_NUMBER_PATTERN.test(payload.orderNumber) ||
    payload.firstName.length > 80 ||
    payload.lastName.length > 80 ||
    (payload.trackingNumber?.length ?? 0) > 100 ||
    (payload.email !== undefined && !EMAIL_PATTERN.test(payload.email))
  ) {
    throw new Error("Podaci za email nisu ispravni.");
  }
}

function buildEmail(payload: OrderEmailPayload) {
  const customerName = escapeHtml(
    `${payload.firstName} ${payload.lastName}`.trim(),
  );
  const orderNumber = escapeHtml(payload.orderNumber);
  const trackingNumber = escapeHtml(payload.trackingNumber ?? "");

  if (payload.stage === "processing") {
    return {
      subject: `Porudzbina ${payload.orderNumber} je prihvacena`,
      html: `<p>Zdravo ${customerName},</p><p>Tvoja porudzbina ${orderNumber} je prihvacena i trenutno je u obradi.</p><p>The Original Way</p>`,
    };
  }

  if (payload.stage === "sent") {
    return {
      subject: `Porudzbina ${payload.orderNumber} je poslata`,
      html: `<p>Zdravo ${customerName},</p><p>Tvoja porudzbina ${orderNumber} je poslata.</p><p>Broj porudzbine za pracenje: <strong>${trackingNumber}</strong></p><p>The Original Way</p>`,
    };
  }

  return {
    subject: `Hvala za porudzbinu ${payload.orderNumber}`,
    html: `<p>Zdravo ${customerName},</p><p>Hvala ti na poverenju. Porudzbina ${orderNumber} je zavrsena.</p><p>Tu smo za tebe uvek.</p><p>The Original Way</p>`,
  };
}

export async function sendOrderStatusEmail(payload: OrderEmailPayload) {
  await requireCurrentAdmin();
  validatePayload(payload);

  if (!payload.email) {
    return {
      ok: false,
      skipped: true,
      message: "Porudzbina nema email adresu kupca.",
    };
  }

  const email = buildEmail(payload);
  const resendApiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.ORDER_EMAIL_FROM ?? "The Original Way <orders@example.com>";

  if (!resendApiKey) {
    return {
      ok: false,
      skipped: true,
      message: "Slanje emaila nije konfigurisano.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.email,
      subject: email.subject,
      html: email.html,
    }),
  });

  if (!response.ok) {
    console.error("Order status email failed.", { status: response.status });
    return {
      ok: false,
      skipped: false,
      message: "Email trenutno nije moguće poslati.",
    };
  }

  return {
    ok: true,
    skipped: false,
    message: "Email je poslat.",
  };
}
