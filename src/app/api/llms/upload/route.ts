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
import { getActiveSession, handleApiError } from "@/lib/api-utils";
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

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const { session, errorResponse } = await getActiveSession(locationId);
    if (errorResponse) return errorResponse;

    const { accessToken, locationId: activeLocationId } = session!;





    // ── Step 1: Upload to GHL Media Storage ───────────────────────────────
    const fileName = getLlmsTxtFilename();
    const uploadResult = await uploadLlmsTxt(
      content,
      fileName,
      activeLocationId,
      accessToken
    );

    // ── Step 1.5: Cleanup old files (asynchronously) ─────────────────────
    cleanupOldLlmsFiles(activeLocationId, accessToken, uploadResult.fileId).catch(
      (err) => console.error("[Upload] Cleanup error:", err)
    );

    // ── Step 2: Create /llms.txt redirect ─────────────────────────────────
    let redirectResult = null;
    const targetDomain = domainId || baseUrl;

    if (targetDomain) {
      redirectResult = await createLlmsRedirect(
        activeLocationId,
        targetDomain,
        uploadResult.fileUrl,
        accessToken
      );
    }

    return NextResponse.json({
      success: true,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      redirect: redirectResult,
    });
  } catch (error: unknown) {
    return handleApiError(error, "Upload failed");
  }
}
