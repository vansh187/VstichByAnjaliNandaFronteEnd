// Shared field-length caps and format checks for user-entered text.
// Caps mirror the actual Postgres column limits (vstitch_users,
// vstitch_addresses, vstitch_orders — see information_schema.columns) so a
// too-long value is rejected client-side with a clear message instead of
// reaching the API and causing a truncation/DB error.
export const LIMITS = {
  NAME_MAX: 250, // vstitch_users.firstname/lastname, vstitch_addresses.recipientname
  USERNAME_MIN: 3,
  USERNAME_MAX: 250, // vstitch_users.vstitchusername
  EMAIL_MAX: 250, // vstitch_users.email
  PASSWORD_MIN: 8,
  // bcrypt (used by most auth backends) silently truncates/rejects beyond
  // 72 bytes, so capping here avoids a mismatch between what the user typed
  // and what actually got hashed, well under the 250-char hashed-password column.
  PASSWORD_MAX: 72,
  PHONE_MIN: 7,
  PHONE_MAX: 15, // E.164 format cap; column itself allows 250
  OTP_LENGTH: 6,
  ADDRESS_LINE_MAX: 250, // vstitch_addresses/orders address_line1/2
  CITY_STATE_MAX: 250, // vstitch_addresses/orders city/state
  POSTAL_CODE_MAX: 20, // vstitch_addresses/orders postal_code
  COUNTRY_MAX: 250, // vstitch_addresses/orders country
};

export const PATTERNS = {
  // Local part: letters/digits plus the common special chars allowed in
  // email addresses (. _ % + -), no leading/trailing/consecutive dots.
  // Domain: labels of letters/digits/hyphens, at least one dot, TLD of 2+
  // letters. Stricter than a bare "has an @ and a dot" check, so malformed
  // addresses like "a@@b..com" or "a@b" are rejected instead of ignored.
  EMAIL: /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/,
  // Optional leading + then 7-15 digits (E.164-style).
  PHONE: /^\+?\d{7,15}$/,
  // Letters (incl. accented), spaces, hyphens and apostrophes only.
  NAME: /^[\p{L}][\p{L}\s'-]*$/u,
  // Letters, digits, underscore and dot; no leading/trailing dot enforced elsewhere.
  USERNAME: /^[A-Za-z0-9_.]+$/,
  // Letters, spaces, hyphens and periods (covers "St. Louis", "Île-de-France", etc).
  CITY_STATE: /^[\p{L}][\p{L}\s'.-]*$/u,
  // Alphanumeric plus space/hyphen, matches most countries' postal formats.
  POSTAL_CODE: /^[A-Za-z0-9\s-]+$/,
  // Address lines: letters/digits/spaces plus common punctuation, no control chars.
  ADDRESS_LINE: /^[\p{L}\p{N}\s,.'#/&-]+$/u,
};

export function isTooLong(value, max) {
  return String(value ?? "").length > max;
}
