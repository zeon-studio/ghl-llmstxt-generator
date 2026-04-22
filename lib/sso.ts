/**
 * lib/sso.ts
 * ----------
 * Decrypts the GHL SSO payload sent via window.exposeSessionDetails().
 *
 * GHL encrypts the session as AES with the SHARED_SECRET_KEY.
 * The decrypted payload contains locationId, userId, companyId, etc.
 */

import CryptoJS from "crypto-js";

export interface GHLSSOPayload {
  locationId: string;
  userId: string;
  companyId?: string;
  userName?: string;
  email?: string;
  role?: string;
  type?: string;
}

/**
 * Decrypts an SSO key string received from the GHL iframe.
 *
 * @param encryptedKey - The value from window.exposeSessionDetails().sessionDetails.key
 * @returns Parsed SSO payload or null if decryption fails
 */
export function decryptSSOKey(
  encryptedKey: string
): GHLSSOPayload | null {
  const sharedSecret = process.env.GHL_SHARED_SECRET_KEY;
  if (!sharedSecret) {
    throw new Error("GHL_SHARED_SECRET_KEY is not set in environment variables");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, sharedSecret);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    return JSON.parse(decrypted) as GHLSSOPayload;
  } catch {
    return null;
  }
}
