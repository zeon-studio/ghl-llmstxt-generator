/**
 * lib/ghl/domains.ts
 * ------------------
 * Derives the list of domains connected to a GHL sub-account.
 *
 * GHL has no public /locations/{id}/domains endpoint.
 * Based on empirical testing, the only reliable public sources are:
 *
 *  1. location.domain   — the primary hosting domain (may be empty)
 *  2. location.website  — often used for the business domain
 *  3. redirect rules    — every redirect rule carries the connected domain
 *  4. funnels/websites  — attached to specific domains
 */

import { getGhlClient } from "./client";

export interface GHLDomain {
  id: string;
  domainName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strips protocol, www., and path — returns null for non-domain strings */
function normalizeDomain(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  // Must contain a dot to be a real domain
  return s.includes(".") ? s : null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns deduplicated domains for a location from multiple GHL sources.
 */
export async function fetchDomains(
  locationId: string,
  accessToken: string,
): Promise<GHLDomain[]> {
  const client = getGhlClient(accessToken);
  const seen = new Set<string>();
  const domains: GHLDomain[] = [];

  const add = (raw: string | undefined | null) => {
    const host = normalizeDomain(raw);
    if (!host || seen.has(host)) return;
    seen.add(host);
    domains.push({ id: host, domainName: host });
  };

  // 1. Location Profile
  try {
    const locResp = await client.get(`/locations/${locationId}`);
    const loc = locResp.data?.location;
    add(loc?.domain);

    // Extract from website field too (e.g. https://zeon.studio)
    const website = loc?.website;
    if (website) {
      try {
        const url = new URL(website);
        add(url.hostname);
      } catch (e) {
        // Fallback for non-URL strings like "zeon.studio"
        add(website);
      }
    }
  } catch (err) {
    // Silent fail for location info
  }

  // 2. Redirect Rules
  try {
    let offset = 0;
    const limit = 20;

    while (true) {
      const rdrResp = await client.get("/funnels/lookup/redirect/list", {
        params: { locationId, limit, offset },
      });
      const page: Array<{ domain?: string; deleted?: boolean }> =
        rdrResp.data?.data ?? rdrResp.data?.redirects ?? [];

      for (const r of page) {
        if (!r.deleted && r.domain) add(r.domain);
      }

      if (page.length < limit) break;
      offset += limit;
    }
  } catch (err) {
    // Silent fail for redirects
  }

  // 3. Funnels & Websites
  try {
    const funnelsResp = await client.get("/funnels/funnel/list", {
      params: { locationId },
    });
    const funnels = funnelsResp.data?.funnels ?? [];
    for (const f of funnels) {
      add(f.domain || f.domainId);
    }
  } catch (err) {
    // Silent fail for funnels
  }

  // 4. Direct Domain List (if available in future/with more scopes)
  try {
    const domainsResp = await client.get("/funnels/lookup/domain/list", {
      params: { locationId },
    });
    const direct = domainsResp.data?.data ?? domainsResp.data?.domains ?? [];
    for (const d of direct) {
      const name = typeof d === "string" ? d : (d.domainName || d.domain || d.name);
      add(name);
    }
  } catch (err) {
    // Silent fail for domain list
  }

  return domains;
}

/**
 * Finds a domain entry by matching a domain name string.
 */
export async function findDomainIdByName(
  locationId: string,
  domainName: string,
  accessToken: string,
): Promise<string | null> {
  const domains = await fetchDomains(locationId, accessToken);
  const normalized = normalizeDomain(domainName) ?? "";

  const match = domains.find(
    (d) => d.domainName === normalized || normalized.endsWith(d.domainName),
  );

  return match ? match.id : null;
}
