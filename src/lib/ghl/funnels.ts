/**
 * lib/ghl/funnels.ts
 * ------------------
 * Discovery service: fetches all Funnels and their Pages for a given
 * locationId using the authenticated access token.
 */

import { getGhlClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GHLFunnel {
  id: string;
  name: string;
  url?: string;
  domain?: string;
  domainName?: string;
  domainId?: string;
  isDeleted?: boolean;
  steps?: GHLFunnelStep[];
}

export interface GHLFunnelStep {
  id?: string;
  _id?: string;
  name: string;
  url?: string;
  pathName?: string;
  isDeleted?: boolean;
}

export interface GHLFunnelPage {
  id: string;
  name: string;
  url?: string;
  pathName?: string;
  funnelId: string;
  isDeleted?: boolean;
}

export interface FunnelWithPages extends GHLFunnel {
  pages: GHLFunnelPage[];
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Discovers all funnels and their pages for a given location.
 * Uses the single 'list' endpoint which includes nested steps/pages.
 */
export async function discoverFunnelsAndPages(
  locationId: string,
  accessToken: string,
): Promise<FunnelWithPages[]> {
  const client = getGhlClient(accessToken);

  const resp = await client.get("/funnels/funnel/list", {
    params: { locationId, limit: 100, offset: 0 },
  });

  const rawFunnels = resp.data?.funnels ?? [];

  const results: FunnelWithPages[] = rawFunnels
    .filter((f: GHLFunnel & { _id?: string }) => !f.isDeleted)
    .map((f: GHLFunnel & { _id?: string }) => {
      const funnelId = f.id || f._id || "";

      // Extract steps as pages
      const pages: GHLFunnelPage[] = (f.steps ?? [])
        .filter((s: GHLFunnelStep) => !s.isDeleted)
        .map((s: GHLFunnelStep) => ({
          id: s.id || s._id || "",
          name: s.name || "Untitled Page",
          pathName: s.pathName,
          url: s.url,
          funnelId,
        }));

      return {
        id: funnelId,
        name: f.name,
        url: f.url,
        domainId: f.domainId,
        pages,
      };
    });

  return results;
}
