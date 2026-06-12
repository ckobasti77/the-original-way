const textEncoder = new TextEncoder();

export const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_LENGTH_BITS = 256;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex value.");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }

  return bytes;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function safeTrim(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function randomHex(bytesLength = 32) {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return toHex(new Uint8Array(digest));
}

export async function hashPassword(password: string, saltHex: string) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(saltHex),
      iterations: PASSWORD_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PASSWORD_LENGTH_BITS,
  );

  return toHex(new Uint8Array(derivedBits));
}

export async function createPasswordDigest(password: string) {
  const saltHex = randomHex(16);
  const passwordHash = await hashPassword(password, saltHex);

  return { saltHex, passwordHash };
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHash: string,
) {
  const actualHash = await hashPassword(password, saltHex);
  return actualHash === expectedHash;
}
