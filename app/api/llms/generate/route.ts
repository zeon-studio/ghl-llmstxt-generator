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
import axios from "axios";
import { sessionStorage } from "@/lib/ghl/client";
import { discoverFunnelsAndPages } from "@/lib/ghl/funnels";
import { generateLlmsTxt, getLlmsTxtFilename } from "@/lib/ghl/llms-generator";
import { uploadLlmsTxt } from "@/lib/ghl/media";
import { createLlmsRedirect } from "@/lib/ghl/redirects";
import { scrapeMetadata } from "@/lib/scraper";

export const runtime = "nodejs";

interface GenerateRequestBody {
  locationId: string;
  siteName: string;
  siteDescription?: string;
  domainId?: string;
  baseUrl?: string;
  previewOnly?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<GenerateRequestBody>;
    const { locationId, siteName, siteDescription, domainId, baseUrl } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 }
      );
    }

    // ── Optional Scrape: If title/description are missing, try to fetch them ──
    let finalSiteName = siteName?.trim();
    let finalSiteDescription = siteDescription?.trim();

    if (baseUrl && (!finalSiteName || !finalSiteDescription)) {
      console.log(`[Generate] Scraping metadata from: ${baseUrl}`);
      const meta = await scrapeMetadata(baseUrl);
      console.log(`[Generate] Scraped Metadata:`, meta);
      if (!finalSiteName) {
        if (meta.title) {
          finalSiteName = meta.title;
        } else {
          // Fallback to Domain Name (e.g. evangrayson.dev -> Evangrayson)
          const domainPart = baseUrl.replace(/^https?:\/\//, "").split(".")[0];
          finalSiteName = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
        }
      }
      if (!finalSiteDescription) finalSiteDescription = meta.description;
    }

    if (!finalSiteName) {
      return NextResponse.json(
        { error: "Site Name is required (could not be auto-detected)" },
        { status: 400 }
      );
    }

    // ── Retrieve access token ─────────────────────────────────────────────
    const session = await sessionStorage.get(locationId);
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
      siteName: finalSiteName,
      siteDescription: finalSiteDescription,
      locationId,
      baseUrl,
    });
    console.log(
      `[Generate] Generated ${content.length} chars of llms.txt content`
    );

    // ── Step 2.5: Preview Only check ──────────────────────────────────────
    if (body.previewOnly) {
      return NextResponse.json({
        success: true,
        content,
        funnelCount: funnels.length,
        pageCount: funnels.reduce((n, f) => n + f.pages.length, 0),
        preview: content.slice(0, 500) + (content.length > 500 ? "..." : ""),
      });
    }

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

    // ── Step 4: Create /llms.txt redirect (requires domain name or baseUrl) ─────
    let redirectResult = null;
    const targetDomain = domainId || baseUrl;

    if (targetDomain) {
      console.log(`[Generate] Creating /llms.txt redirect rule for domain: ${targetDomain}`);
      redirectResult = await createLlmsRedirect(
        locationId,
        targetDomain,
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
      content,
      preview: content.slice(0, 500) + (content.length > 500 ? "..." : ""),
    });
  } catch (error: unknown) {
    console.error("[Generate] Pipeline error:", error);
    
    let status = 500;
    let message = "Unknown error occurred";
    let details = null;

    if (axios.isAxiosError(error)) {
      const ghlError = error.response?.data;
      status = error.response?.status || 500;
      message = ghlError?.message || error.message || "GHL API error";
      details = ghlError?.errors || ghlError || null;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Generation pipeline failed", 
        details: message,
        ghlDetails: details 
      },
      { status }
    );
  }
}
