/**
 * app/api/llms/generate/route.ts
 * --------------------------------
 * Core generation pipeline:
 *   1. Validate locationId + retrieve stored access token
 *   2. Discover all funnels + pages (GET /funnels/funnel/list + /funnels/page)
 *   3. Generate llms.txt markdown
 *   4. Upload to GHL Media Storage (POST /medias/upload-file)
 *   5. Create /llms.txt redirect rule (POST /funnels/lookup/redirect)
 *   6. Return the hosted file URL + redirect info
 *
 * POST /api/llms/generate
 * Body: { locationId, siteName, siteDescription?, domainId?, baseUrl? }
 */

import { NextRequest, NextResponse } from "next/server";
import { sessionStorage } from "@/lib/ghl/client";
import { discoverFunnelsAndPages } from "@/lib/ghl/funnels";
import { generateLlmsTxt, getLlmsTxtFilename } from "@/lib/ghl/llms-generator";
import { uploadLlmsTxt } from "@/lib/ghl/media";
import { createLlmsRedirect } from "@/lib/ghl/redirects";

export const runtime = "nodejs";

interface GenerateRequestBody {
  locationId: string;
  siteName: string;
  siteDescription?: string;
  domainId?: string;
  baseUrl?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<GenerateRequestBody>;

    // ── Validate required fields ───────────────────────────────────────────
    const { locationId, siteName, siteDescription, domainId, baseUrl } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 }
      );
    }
    if (!siteName) {
      return NextResponse.json(
        { error: "siteName is required" },
        { status: 400 }
      );
    }

    // ── Retrieve access token ─────────────────────────────────────────────
    const session = sessionStorage.get(locationId);
    if (!session) {
      return NextResponse.json(
        {
          error: "No active session for this location. Please re-authorize.",
          code: "SESSION_NOT_FOUND",
        },
        { status: 401 }
      );
    }

    const { accessToken } = session;

    console.log(`[Generate] Starting pipeline for locationId: ${locationId}`);

    // ── Step 1: Discover funnels + pages ──────────────────────────────────
    console.log("[Generate] Discovering funnels and pages...");
    const funnels = await discoverFunnelsAndPages(locationId, accessToken);
    console.log(
      `[Generate] Found ${funnels.length} funnels with ${funnels.reduce((n, f) => n + f.pages.length, 0)} pages total`
    );

    // ── Step 2: Generate llms.txt content ─────────────────────────────────
    const content = generateLlmsTxt(funnels, {
      siteName,
      siteDescription,
      locationId,
      baseUrl,
    });
    console.log(
      `[Generate] Generated ${content.length} chars of llms.txt content`
    );

    // ── Step 3: Upload to GHL Media Storage ───────────────────────────────
    const fileName = getLlmsTxtFilename();
    console.log("[Generate] Uploading to GHL Media Storage...");
    const uploadResult = await uploadLlmsTxt(
      content,
      fileName,
      locationId,
      accessToken
    );
    console.log(`[Generate] Uploaded to: ${uploadResult.fileUrl}`);

    // ── Step 4: Create /llms.txt redirect (optional — requires domainId) ──
    let redirectResult = null;
    if (domainId) {
      console.log("[Generate] Creating /llms.txt redirect rule...");
      redirectResult = await createLlmsRedirect(
        locationId,
        domainId,
        uploadResult.fileUrl,
        accessToken
      );
      console.log("[Generate] Redirect created:", redirectResult);
    }

    // ── Success response ──────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      funnelCount: funnels.length,
      pageCount: funnels.reduce((n, f) => n + f.pages.length, 0),
      redirect: redirectResult,
      preview: content.slice(0, 500) + (content.length > 500 ? "..." : ""),
    });
  } catch (error) {
    console.error("[Generate] Pipeline error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Generation pipeline failed", details: message },
      { status: 500 }
    );
  }
}
