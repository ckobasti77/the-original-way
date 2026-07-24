import assert from "node:assert/strict";
import test from "node:test";

import {
  assertProfileOwnership,
  normalizeCourierProfile,
  readCourierSnapshot,
} from "../lib/storefront-profile.ts";

const validProfile = {
  firstName: "  Ana  ",
  lastName: " Petrović ",
  email: " ANA@EXAMPLE.COM ",
  phone: " +381 60 123 456 ",
  city: " Beograd ",
  postalCode: " 11000 ",
  street: " Knez Mihailova ",
  houseNumber: " 12 ",
};

test("normalizes and validates a courier profile", () => {
  const profile = normalizeCourierProfile(validProfile);
  assert.equal(profile.firstName, "Ana");
  assert.equal(profile.email, "ana@example.com");
  assert.equal(profile.city, "Beograd");
});

test("rejects incomplete courier data", () => {
  assert.throws(
    () => normalizeCourierProfile({ ...validProfile, phone: "" }),
    /Telefon je obavezno polje/,
  );
});

test("profile ownership is limited to the authenticated subject", () => {
  assert.doesNotThrow(() => assertProfileOwnership("subject-a", "subject-a"));
  assert.throws(
    () => assertProfileOwnership("subject-a", "subject-b"),
    /Nemate dozvolu/,
  );
});

test("legacy orders without new optional fields remain readable", () => {
  const snapshot = readCourierSnapshot({
    firstName: "Ana",
    lastName: "Petrović",
    city: "Beograd",
    street: "Knez Mihailova",
    houseNumber: "12",
  });
  assert.equal(snapshot.phone, "");
  assert.equal(snapshot.postalCode, "");
  assert.equal(snapshot.deliveryNote, "");
});
