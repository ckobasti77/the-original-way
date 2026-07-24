export type CourierProfileInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  deliveryNote?: string;
};

function required(value: string, label: string, maxLength = 120) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) throw new Error(`${label} je obavezno polje.`);
  if (normalized.length > maxLength) throw new Error(`${label} je predugačko.`);
  return normalized;
}

function optional(value: string | undefined, maxLength = 240) {
  const normalized = value?.trim().replace(/\s+/g, " ") ?? "";
  if (!normalized) return undefined;
  if (normalized.length > maxLength) throw new Error("Uneta vrednost je predugačka.");
  return normalized;
}

export function normalizeCourierProfile(input: CourierProfileInput) {
  const email = input.email
    ? required(input.email, "Email", 160).toLowerCase()
    : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Unesite ispravnu email adresu.");
  }

  return {
    firstName: required(input.firstName, "Ime", 80),
    lastName: required(input.lastName, "Prezime", 80),
    email,
    phone: required(input.phone, "Telefon", 40),
    city: required(input.city, "Grad", 100),
    postalCode: required(input.postalCode, "Poštanski broj", 20),
    street: required(input.street, "Ulica", 120),
    houseNumber: required(input.houseNumber, "Broj", 30),
    addressLine2: optional(input.addressLine2, 120),
    deliveryNote: optional(input.deliveryNote, 500),
  };
}

export function assertProfileOwnership(identitySubject: string, userAuthSubject: string) {
  if (!identitySubject || identitySubject !== userAuthSubject) {
    throw new Error("Nemate dozvolu za izmenu ovog profila.");
  }
}

export function readCourierSnapshot(order: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  city: string;
  postalCode?: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  deliveryNote?: string;
}) {
  return {
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email ?? "",
    phone: order.phone ?? "",
    city: order.city,
    postalCode: order.postalCode ?? "",
    street: order.street,
    houseNumber: order.houseNumber,
    addressLine2: order.addressLine2 ?? "",
    deliveryNote: order.deliveryNote ?? "",
  };
}
