/**
 * lib/ghl/redirects.ts
 * ---------------------
 * Creates a 301 redirect rule via the GHL Funnels Redirect API.
 * Maps  yourdomain.com/llms.txt  →  <hosted file URL>
 *
 * Endpoint: POST /funnels/lookup/redirect
 */

import axios from "axios";
import { getGhlClient } from "./client";

export interface RedirectResult {
  id?: string;
  locationId: string;
  path: string;
  targetUrl: string;
}

export interface GHLRedirect {
  _id?: string;
  id?: string;
  path: string;
  domain: string;
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
  const client = getGhlClient(accessToken);
  const cleanDomain = domainName.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const payload = {
    locationId,
    domain: cleanDomain,
    path: "/llms.txt",
    target: targetUrl,
    action: "url",
  };

  try {
    const resp = await client.post("/funnels/lookup/redirect", payload);

    return {
      id: resp.data?.id,
      locationId,
      path: "/llms.txt",
      targetUrl,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as GHLErrorResponse | undefined;
      const allMessages = JSON.stringify(errorData).toLowerCase();
      const isDuplicate = allMessages.includes("already exists");
      const status = error.response?.status;

      if ((status === 400 || status === 422) && isDuplicate) {
        console.log("[Redirect] Rule already exists, searching for ID to update...");
        
        let existing = null;
        let currentOffset = 0;
        let hasMore = true;

        while (hasMore) {
          const listResp = await client.get("/funnels/lookup/redirect/list", {
            params: { locationId, limit: 20, offset: currentOffset },
          });

          // GHL actually returns the array inside `data`, not `redirects`
          const redirects: GHLRedirect[] = listResp.data?.data || listResp.data?.redirects || [];
          console.log(`[Redirect] Fetched ${redirects.length} redirects at offset ${currentOffset}`);
          
          if (redirects.length === 0) break;

          existing = redirects.find((r) => {
            const rPath = r.path || "";
            const rDomain = r.domain || "";
            // GHL sometimes strips leading slashes or has different domain formatting
            return (rPath === "/llms.txt" || rPath === "llms.txt") && rDomain.includes(cleanDomain);
          });

          if (existing) break;

          currentOffset += 20;
          if (redirects.length < 20) hasMore = false;
        }

        if (existing) {
          const redirectId = existing._id || existing.id;
          console.log(`[Redirect] Found existing redirect ID: ${redirectId}. Updating...`);
          await client.patch(
            `/funnels/lookup/redirect/${redirectId}`,
            {
              locationId,
              target: targetUrl,
              action: "url",
            }
          );

          return {
            id: redirectId,
            locationId,
            path: "/llms.txt",
            targetUrl,
          };
        } else {
          console.warn("[Redirect] Could not find the existing rule in the URL redirects list. It might be attached directly to a Funnel or Website page.");
          throw new Error("Conflict: The path '/llms.txt' is currently being used by a Funnel or Website page in your GoHighLevel account. Please delete or rename that page's path in the GHL dashboard so we can create the redirect.");
        }
      }
    }
    throw error;
  }
}
