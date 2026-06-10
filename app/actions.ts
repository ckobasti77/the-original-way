"use server";

import type { OrderEmailStage } from "./admin/_lib/types";

type OrderEmailPayload = {
  stage: OrderEmailStage;
  email?: string;
  firstName: string;
  lastName: string;
  orderNumber: string;
  trackingNumber?: string;
};

function buildEmail(payload: OrderEmailPayload) {
  const customerName = `${payload.firstName} ${payload.lastName}`.trim();

  if (payload.stage === "processing") {
    return {
      subject: `Porudzbina ${payload.orderNumber} je prihvacena`,
      html: `<p>Zdravo ${customerName},</p><p>Tvoja porudzbina ${payload.orderNumber} je prihvacena i trenutno je u obradi.</p><p>The Original Way</p>`,
    };
  }

  if (payload.stage === "sent") {
    return {
      subject: `Porudzbina ${payload.orderNumber} je poslata`,
      html: `<p>Zdravo ${customerName},</p><p>Tvoja porudzbina ${payload.orderNumber} je poslata.</p><p>Broj porudzbine za pracenje: <strong>${payload.trackingNumber}</strong></p><p>The Original Way</p>`,
    };
  }

  return {
    subject: `Hvala za porudzbinu ${payload.orderNumber}`,
    html: `<p>Zdravo ${customerName},</p><p>Hvala ti na poverenju. Porudzbina ${payload.orderNumber} je zavrsena.</p><p>Tu smo za tebe uvek.</p><p>The Original Way</p>`,
  };
}

export async function sendOrderStatusEmail(payload: OrderEmailPayload) {
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
    console.log("[order-email-preview]", {
      to: payload.email,
      ...email,
    });

    return {
      ok: true,
      skipped: true,
      message:
        "Email je pripremljen kroz Server Action, ali RESEND_API_KEY nije podesen.",
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
    return {
      ok: false,
      skipped: false,
      message: await response.text(),
    };
  }

  return {
    ok: true,
    skipped: false,
    message: "Email je poslat.",
  };
}
