/**
 * app/api/llms/domains/route.ts
 * ------------------------------
 * Returns the list of connected domains for a GHL sub-account.
 *
 * GET /api/llms/domains?locationId=<id>
 *
 * How we source domains (GHL has no public /domains endpoint):
 *  1. location.domain   — the primary hosting domain (locations.readonly)
 *  2. redirect rules    — each rule carries the connected domain name
 *                         (funnels/redirect.readonly, limit ≤ 20)
 *
 * Both scopes are already in the app's OAuth grant.
 */

import { getActiveSession, handleApiError } from "@/lib/api-utils";
import { fetchDomains } from "@/lib/ghl/domains";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const locationId =
      request.nextUrl.searchParams.get("locationId") ?? undefined;

    const { session, errorResponse } = await getActiveSession(locationId);
    if (errorResponse) return errorResponse;

    const { accessToken, locationId: activeLocationId } = session!;

    const domains = await fetchDomains(activeLocationId, accessToken);

    return NextResponse.json({ success: true, domains });
  } catch (error: unknown) {
    return handleApiError(error, "Failed to fetch domains");
  }
}
