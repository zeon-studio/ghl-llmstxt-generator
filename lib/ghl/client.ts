/**
 * lib/ghl/client.ts
 * -----------------
 * Singleton GHL SDK client with a simple in-memory session storage.
 * In production, replace InMemorySessionStorage with a Redis/DB-backed
 * implementation to survive server restarts.
 */

import HighLevel from "@gohighlevel/api-client";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix ms timestamp
  locationId: string;
  userId?: string;
  companyId?: string;
}

// ─── Supabase Session Storage ────────────────────────────────────────────────

import { supabase } from "../supabase/client";

const GHL_API_BASE =
  process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";

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

export const sessionStorage = {
  async set(locationId: string, session: TokenSession): Promise<void> {
    const { error } = await supabase.from("sessions").upsert(
      {
        location_id: locationId,
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
        expires_at: session.expiresAt,
        user_id: session.userId || null,
        company_id: session.companyId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "location_id" },
    );

    if (error) {
      console.error("Failed to save session to Supabase:", error);
    }
  },

  async get(locationId: string): Promise<TokenSession | undefined> {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("location_id", locationId)
      .single();

    if (error || !data) {
      return undefined;
    }

    let session: TokenSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Number(data.expires_at),
      locationId: data.location_id,
      userId: data.user_id,
      companyId: data.company_id,
    };

    // Auto-refresh if token is expired or expires within 5 minutes
    if (Date.now() + 5 * 60 * 1000 >= session.expiresAt) {
      try {
        console.log(
          `[Session] Token expired/expiring for location ${locationId}. Refreshing...`,
        );
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
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("location_id", locationId);

    if (error) {
      console.error("Failed to delete session from Supabase:", error);
    }
  },

  async keys(): Promise<string[]> {
    const { data, error } = await supabase
      .from("sessions")
      .select("location_id");
    if (error || !data) {
      return [];
    }
    return data.map((row) => row.location_id);
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
