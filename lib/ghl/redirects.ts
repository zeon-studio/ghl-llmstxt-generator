/**
 * lib/ghl/redirects.ts
 * ---------------------
 * Creates a 301 redirect rule via the GHL Funnels Redirect API.
 * Maps  yourdomain.com/llms.txt  →  <hosted file URL>
 *
 * Endpoint: POST /funnels/lookup/redirect
 */

import axios from "axios";

const API_BASE =
  process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";

export interface RedirectResult {
  id?: string;
  locationId: string;
  path: string;
  targetUrl: string;
}

interface GHLErrorResponse {
  message?: string | string[];
}

/**
 * Creates (or updates) a redirect rule that maps /llms.txt to the
 * hosted file URL so visitors and crawlers resolve it correctly.
 */
export async function createLlmsRedirect(
  locationId: string,
  domainName: string,
  targetUrl: string,
  accessToken: string
): Promise<RedirectResult> {
  const payload = {
    locationId,
    domain: domainName.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    path: "/llms.txt",
    target: targetUrl,
    action: "url",
  };

  try {
    const resp = await axios.post(`${API_BASE}/funnels/lookup/redirect`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
    });

    return {
      id: resp.data?.id,
      locationId,
      path: "/llms.txt",
      targetUrl,
    };
  } catch (error: unknown) {
    // If it already exists, that's actually a success for us!
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as GHLErrorResponse | undefined;
      
      // Convert everything to a single string to search
      const allMessages = JSON.stringify(errorData).toLowerCase();
      const isDuplicate = allMessages.includes("already exists");

      // GHL sometimes returns 400 and sometimes 422 for 'already exists'
      const status = error.response?.status;
      if ((status === 400 || status === 422) && isDuplicate) {
        console.log("[Redirect] Rule already exists, skipping creation.");
        return {
          locationId,
          path: "/llms.txt",
          targetUrl,
        };
      }
    }
    throw error;
  }
}
