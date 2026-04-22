/**
 * app/api/auth/sso/route.ts
 * --------------------------
 * Server-side SSO decryption endpoint.
 * The dashboard page sends the encrypted key from window.exposeSessionDetails()
 * here; this route decrypts it and returns the location/user context.
 *
 * POST /api/auth/sso
 * Body: { "key": "<encrypted_sso_string>" }
 */

import { NextRequest, NextResponse } from "next/server";
import { decryptSSOKey } from "@/lib/sso";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { key } = body as { key?: string };

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'key' field in request body" },
        { status: 400 }
      );
    }

    const payload = decryptSSOKey(key);

    if (!payload) {
      return NextResponse.json(
        { error: "SSO decryption failed — invalid key or secret mismatch" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, session: payload });
  } catch (error) {
    console.error("[SSO] Decryption error:", error);
    return NextResponse.json(
      { error: "Internal server error during SSO decryption" },
      { status: 500 }
    );
  }
}
