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

import fs from "fs";
import path from "path";

const SESSION_FILE = path.join(process.cwd(), "sessions.json");

function loadSessions(): Map<string, TokenSession> {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, "utf-8");
      return new Map(Object.entries(JSON.parse(data)));
    }
  } catch (e) {
    console.error("Failed to load sessions:", e);
  }
  return new Map();
}

function saveSessions(map: Map<string, TokenSession>) {
  try {
    const data = JSON.stringify(Object.fromEntries(map));
    fs.writeFileSync(SESSION_FILE, data, "utf-8");
  } catch (e) {
    console.error("Failed to save sessions:", e);
  }
}

export const sessionStorage = {
  set(locationId: string, session: TokenSession): void {
    const sessions = loadSessions();
    sessions.set(locationId, session);
    saveSessions(sessions);
  },

  get(locationId: string): TokenSession | undefined {
    const sessions = loadSessions();
    return sessions.get(locationId);
  },

  delete(locationId: string): void {
    const sessions = loadSessions();
    sessions.delete(locationId);
    saveSessions(sessions);
  },

  keys(): string[] {
    const sessions = loadSessions();
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
    "funnels/funnel.readonly",
    "funnels/page.readonly",
    "funnels/redirect.readonly",
    "funnels/redirect.write",
    "medias.readonly",
    "medias.write",
    "locations.readonly",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: redirectUri,
    client_id: clientId,
    scope: scopes,
    ...(process.env.GHL_APP_VERSION_ID
      ? { version_id: process.env.GHL_APP_VERSION_ID }
      : {}),
    ...(state ? { state } : {}),
  });

  return `${base}/oauth/chooselocation?${params.toString()}`;
}
