/**
 * lib/ghl/client.ts
 * -----------------
 * Singleton GHL SDK client with a simple in-memory session storage.
 * In production, replace InMemorySessionStorage with a Redis/DB-backed
 * implementation to survive server restarts.
 */

import HighLevel from "@gohighlevel/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix ms timestamp
  locationId: string;
  userId?: string;
  companyId?: string;
}

// ─── In-Memory Session Storage ────────────────────────────────────────────────

const sessions = new Map<string, TokenSession>();

export const sessionStorage = {
  /** Save or update a session keyed by locationId */
  set(locationId: string, session: TokenSession): void {
    sessions.set(locationId, session);
  },

  /** Retrieve a session by locationId */
  get(locationId: string): TokenSession | undefined {
    return sessions.get(locationId);
  },

  /** Delete a session (on logout / revoke) */
  delete(locationId: string): void {
    sessions.delete(locationId);
  },

  /** List all active locationIds */
  keys(): string[] {
    return Array.from(sessions.keys());
  },
};

// ─── SDK Client Singleton ─────────────────────────────────────────────────────

let _client: InstanceType<typeof HighLevel> | null = null;

export function getGHLClient(): InstanceType<typeof HighLevel> {
  if (_client) return _client;

  if (!process.env.GHL_CLIENT_ID) throw new Error("Missing GHL_CLIENT_ID");
  if (!process.env.GHL_CLIENT_SECRET)
    throw new Error("Missing GHL_CLIENT_SECRET");

  _client = new HighLevel({
    clientId: process.env.GHL_CLIENT_ID,
    clientSecret: process.env.GHL_CLIENT_SECRET,
  });

  return _client;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the OAuth authorization URL to redirect users to */
export function buildAuthorizationUrl(state?: string): string {
  const base = process.env.GHL_BASE_URL ?? "https://marketplace.gohighlevel.com";
  const redirectUri =
    process.env.GHL_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  const clientId = process.env.GHL_CLIENT_ID!;

  const scopes = [
    "funnels.readonly",
    "funnels.write",
    "medias.readonly",
    "medias.write",
    "locations.readonly",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: redirectUri,
    client_id: clientId,
    scope: scopes,
    ...(state ? { state } : {}),
  });

  return `${base}/oauth/chooselocation?${params.toString()}`;
}
