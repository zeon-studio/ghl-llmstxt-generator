/**
 * lib/ghl/client.ts
 * -----------------
 * Singleton GHL SDK client with a simple in-memory session storage.
 * In production, replace InMemorySessionStorage with a Redis/DB-backed
 * implementation to survive server restarts.
 */

import HighLevel from "@gohighlevel/api-client";
import axios, { AxiosInstance } from "axios";
import fs from "fs";
import path from "path";
import os from "os";

export const API_BASE = "https://services.leadconnectorhq.com";

export interface GHLSSOPayload {
  locationId: string;
  userId: string;
  companyId?: string;
  email?: string;
  role?: string;
  type?: string;
}

/**
 * Creates an Axios instance pre-configured for the GoHighLevel V2 API.
 * Automatically attaches the Bearer token, Version, and Accept headers.
 */
export function getGhlClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
      Accept: "application/json",
    },
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix ms timestamp
  locationId: string;
  userId?: string;
  companyId?: string;
  locationName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  locationId?: string;
  userId?: string;
  companyId?: string;
  scope?: string;
}

// ─── Supabase Session Storage ────────────────────────────────────────────────

import { db } from "../db/client";

const GHL_API_BASE = API_BASE;

async function refreshAccessToken(
  session: TokenSession,
): Promise<TokenSession> {
  if (!process.env.GHL_CLIENT_ID || !process.env.GHL_CLIENT_SECRET) {
    throw new Error("Missing GHL credentials for token refresh");
  }

  const tokenResp = await axios.post(
    `${GHL_API_BASE}/oauth/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  const data = tokenResp.data;

  const newSession: TokenSession = {
    ...session,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  // Save the new session to Supabase
  await sessionStorage.set(session.locationId, newSession);

  return newSession;
}

const LOCAL_STORAGE_FILE = path.join(os.tmpdir(), ".ghl-sessions.json");

function readLocalSessions(): Record<string, TokenSession> {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[LocalStorage] Error reading local sessions:", err);
  }
  return {};
}

function writeLocalSession(locationId: string, session: TokenSession) {
  try {
    const sessions = readLocalSessions();
    sessions[locationId] = session;
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.error("[LocalStorage] Error writing local session:", err);
  }
}

function deleteLocalSession(locationId: string) {
  try {
    const sessions = readLocalSessions();
    if (sessions[locationId]) {
      delete sessions[locationId];
      fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(sessions, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[LocalStorage] Error deleting local session:", err);
  }
}

export const sessionStorage = {
  async set(locationId: string, session: TokenSession): Promise<void> {
    console.log(`[Supabase] Attempting to save session for location: ${locationId}`);
    
    writeLocalSession(locationId, session);

    try {
      await db.query(
        `INSERT INTO sessions (
          location_id, access_token, refresh_token, expires_at,
          user_id, company_id, location_name, email, phone, address, city, country, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (location_id) DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          user_id = EXCLUDED.user_id,
          company_id = EXCLUDED.company_id,
          location_name = EXCLUDED.location_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          country = EXCLUDED.country,
          updated_at = EXCLUDED.updated_at`,
        [
          locationId,
          session.accessToken,
          session.refreshToken,
          session.expiresAt,
          session.userId || null,
          session.companyId || null,
          session.locationName || null,
          session.email || null,
          session.phone || null,
          session.address || null,
          session.city || null,
          session.country || null,
          new Date().toISOString(),
        ],
      );
      console.log(`[DB] Session saved successfully for ${locationId}`);
    } catch (e) {
      console.error("[DB] Exception saving session:", e);
    }
  },

  async get(locationId: string): Promise<TokenSession | undefined> {
    console.log(`[Supabase] Fetching session for location: ${locationId}`);
    
    let session: TokenSession | undefined;

    try {
      const { rows } = await db.query(
        "SELECT * FROM sessions WHERE location_id = $1",
        [locationId],
      );
      const data = rows[0];

      if (!data) {
        console.warn(`[DB] No session found in DB for location: ${locationId}`);
      } else {
        session = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Number(data.expires_at),
          locationId: data.location_id,
          userId: data.user_id,
          companyId: data.company_id,
          locationName: data.location_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
        };
      }
    } catch (e) {
      console.error("[DB] Exception fetching session:", e);
    }

    if (!session) {
      console.log(`[LocalStorage] Falling back to local storage for location: ${locationId}`);
      const localSessions = readLocalSessions();
      session = localSessions[locationId];
    }

    if (!session) {
      console.warn(`[Session] Session data is empty for location: ${locationId}`);
      return undefined;
    }

    // Auto-refresh if token is expired or expires within 5 minutes
    if (Date.now() + 5 * 60 * 1000 >= session.expiresAt) {
      try {
        session = await refreshAccessToken(session);
      } catch (err) {
        console.error(
          `[Session] Failed to refresh token for location ${locationId}:`,
          err,
        );
        return undefined; // If refresh fails, return undefined so user must re-auth
      }
    }

    return session;
  },

  async delete(locationId: string): Promise<void> {
    deleteLocalSession(locationId);

    try {
      await db.query("DELETE FROM sessions WHERE location_id = $1", [locationId]);
    } catch (e) {
      console.error("Exception deleting session from DB:", e);
    }
  },

  async keys(): Promise<string[]> {
    const localSessions = readLocalSessions();
    const keys = new Set<string>(Object.keys(localSessions));

    try {
      const { rows } = await db.query("SELECT location_id FROM sessions");
      rows.forEach((row) => keys.add(row.location_id));
    } catch (e) {
      console.error("Exception fetching session keys from DB:", e);
    }

    return Array.from(keys);
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
  const base =
    process.env.GHL_BASE_URL ?? "https://marketplace.gohighlevel.com";
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

/**
 * Exchanges an authorization code for access and refresh tokens.
 */
export async function exchangeToken(code: string): Promise<TokenResponse> {
  const redirectUri =
    process.env.GHL_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  const resp = await axios.post(
    `${API_BASE}/oauth/token`,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.GHL_CLIENT_ID!,
      client_secret: process.env.GHL_CLIENT_SECRET!,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  return resp.data;
}
