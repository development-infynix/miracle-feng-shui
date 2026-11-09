import crypto from 'crypto';

// No 0/O or 1/I, so a number read out over the phone can't be misheard.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const LENGTH = 8;

/**
 * A customer-facing order number like "MFS-7KQ2-9XPA": 8 characters from 32, about a trillion
 * possibilities, drawn with crypto randomness. It's for display and support; links use the access token.
 */
export function generateOrderNumber() {
  let code = '';
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `MFS-${code.slice(0, 4)}-${code.slice(4)}`;
}

/** The unguessable token customer-facing order links carry instead of the order number. */
export function generateOrderAccessToken() {
  return crypto.randomBytes(24).toString('base64url');
}
