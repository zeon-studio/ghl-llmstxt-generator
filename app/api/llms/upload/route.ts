/**
 * app/api/llms/upload/route.ts
 * ----------------------------
 * Final step:
 *   1. Retrieve stored access token
 *   2. Upload the provided content to GHL Media Storage
 *   3. Create /llms.txt redirect rule
 *
 * POST /api/llms/upload
 * Body: { locationId, content, domainId?, baseUrl? }
 */

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { sessionStorage } from "@/lib/ghl/client";
import { uploadLlmsTxt, cleanupOldLlmsFiles } from "@/lib/ghl/media";
import { createLlmsRedirect } from "@/lib/ghl/redirects";
import { getLlmsTxtFilename } from "@/lib/ghl/llms-generator";

export const runtime = "nodejs";

interface UploadRequestBody {
  locationId: string;
  content: string;
  domainId?: string;
  baseUrl?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<UploadRequestBody>;
    const { locationId, content, domainId, baseUrl } = body;

    if (!locationId || !content) {
      return NextResponse.json(
        { error: "locationId and content are required" },
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

    console.log(`[Upload] Starting upload for locationId: ${locationId}`);

    // ── Step 1: Upload to GHL Media Storage ───────────────────────────────
    const fileName = getLlmsTxtFilename();
    console.log("[Upload] Uploading to GHL Media Storage...");
    const uploadResult = await uploadLlmsTxt(
      content,
      fileName,
      locationId,
      accessToken
    );
    console.log(`[Upload] Uploaded to: ${uploadResult.fileUrl}`);

    // ── Step 1.5: Cleanup old files (asynchronously) ─────────────────────
    cleanupOldLlmsFiles(locationId, accessToken, uploadResult.fileId).catch(
      (err) => console.error("[Upload] Cleanup error:", err)
    );

    // ── Step 2: Create /llms.txt redirect ─────────────────────────────────
    let redirectResult = null;
    const targetDomain = domainId || baseUrl;

    if (targetDomain) {
      console.log(`[Upload] Creating /llms.txt redirect rule for domain: ${targetDomain}`);
      redirectResult = await createLlmsRedirect(
        locationId,
        targetDomain,
        uploadResult.fileUrl,
        accessToken
      );
      console.log("[Upload] Redirect created:", redirectResult);
    }

    return NextResponse.json({
      success: true,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      redirect: redirectResult,
    });
  } catch (error: unknown) {
    console.error("[Upload] Pipeline error:", error);
    
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
        error: "Upload failed", 
        details: message,
        ghlDetails: details 
      },
      { status }
    );
  }
}
