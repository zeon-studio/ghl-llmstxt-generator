/**
 * lib/ghl/funnels.ts
 * ------------------
 * Discovery service: fetches all Funnels and their Pages for a given
 * locationId using the authenticated access token.
 */

import axios from "axios";

const API_BASE =
  process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GHLFunnel {
  id: string;
  name: string;
  url?: string;
  domainId?: string;
  isDeleted?: boolean;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface GHLFunnelPage {
  id: string;
  name: string;
  url?: string;
  pathName?: string;
  funnelId: string;
  stepId?: string;
  isDeleted?: boolean;
}

export interface FunnelWithPages extends GHLFunnel {
  pages: GHLFunnelPage[];
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Fetch all funnels for a location */
async function fetchFunnels(
  locationId: string,
  accessToken: string
): Promise<GHLFunnel[]> {
  const resp = await axios.get(`${API_BASE}/funnels/funnel/list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
    },
    params: { locationId, limit: 100 },
  });
  return resp.data?.funnels ?? [];
}

/** Fetch all pages for a specific funnel */
async function fetchFunnelPages(
  locationId: string,
  funnelId: string,
  accessToken: string
): Promise<GHLFunnelPage[]> {
  const resp = await axios.get(`${API_BASE}/funnels/page`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
    },
    params: { locationId, funnelId, limit: 100 },
  });
  return (resp.data?.pages ?? []).map((p: GHLFunnelPage) => ({
    ...p,
    funnelId,
  }));
}

// ─── Main Discovery Function ──────────────────────────────────────────────────

/**
 * Discovers all funnels and their pages for a given location.
 * Pages are fetched in parallel for performance.
 */
export async function discoverFunnelsAndPages(
  locationId: string,
  accessToken: string
): Promise<FunnelWithPages[]> {
  const funnels = await fetchFunnels(locationId, accessToken);

  const activeFunnels = funnels.filter((f) => !f.isDeleted);

  const results = await Promise.all(
    activeFunnels.map(async (funnel) => {
      const pages = await fetchFunnelPages(
        locationId,
        funnel.id,
        accessToken
      );
      return {
        ...funnel,
        pages: pages.filter((p) => !p.isDeleted),
      } as FunnelWithPages;
    })
  );

  return results;
}
