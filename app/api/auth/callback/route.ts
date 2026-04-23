/**
 * app/api/auth/callback/route.ts
 * --------------------------------
 * Handles the OAuth 2.0 callback from GHL Marketplace.
 * Exchanges the authorization code for access + refresh tokens,
 * stores them in the in-memory session keyed by locationId,
 * then redirects to /dashboard.
 *
 * GET /api/auth/callback?code=...&locationId=...
 */

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { sessionStorage } from "@/lib/ghl/client";
import type { TokenSession } from "@/lib/ghl/client";

export const runtime = "nodejs";

const GHL_API_BASE =
  process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  token_type: string;
  locationId?: string;
  userId?: string;
  companyId?: string;
  scope?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const locationId = searchParams.get("locationId"); // GHL passes this

  // ── Validate presence of code ────────────────────────────────────────────
  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  // ── Optional: Validate state cookie ─────────────────────────────────────
  const savedState = request.cookies.get("ghl_oauth_state")?.value;
  if (savedState && returnedState && savedState !== returnedState) {
    return NextResponse.json(
      { error: "OAuth state mismatch — possible CSRF attack" },
      { status: 403 }
    );
  }

  try {
    // ── Exchange code for tokens ──────────────────────────────────────────
    const redirectUri =
      process.env.GHL_REDIRECT_URI ??
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

    const tokenResp = await axios.post<TokenResponse>(
      `${GHL_API_BASE}/oauth/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokenData = tokenResp.data;

    // ── Resolve locationId ────────────────────────────────────────────────
    const resolvedLocationId =
      locationId ?? tokenData.locationId ?? "unknown";

    // ── Persist session ───────────────────────────────────────────────────
    const session: TokenSession = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      locationId: resolvedLocationId,
      userId: tokenData.userId,
      companyId: tokenData.companyId,
    };

    await sessionStorage.set(resolvedLocationId, session);

    console.log(
      `[GHL Callback] Token stored for locationId: ${resolvedLocationId}`
    );

    // ── Clear state cookie & redirect to dashboard ────────────────────────
    const dashboardUrl = new URL(
      `/dashboard?locationId=${resolvedLocationId}`,
      request.nextUrl.origin
    );

    const response = NextResponse.redirect(dashboardUrl);
    response.cookies.delete("ghl_oauth_state");
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[GHL Callback] Token exchange failed:",
        error.response?.data ?? error.message
      );
      return NextResponse.json(
        {
          error: "Token exchange failed",
          details: error.response?.data,
        },
        { status: 502 }
      );
    }
    throw error;
  }
}
