/**
 * lib/ghl/domains.ts
 * ------------------
 * Derives the list of domains connected to a GHL sub-account.
 *
 * GHL has no public /locations/{id}/domains endpoint.
 * Based on empirical testing, the only reliable public sources are:
 *
 *  1. location.domain   — the primary hosting domain (may be empty)
 *                         Scope: locations.readonly
 *  2. redirect rules    — every redirect rule carries the connected domain
 *                         Scope: funnels/redirect.readonly  (limit ≤ 20)
 *
 * Both scopes are already in the app's OAuth grant.
 */

import { getGhlClient } from "./client";

export interface GHLDomain {
  id: string;
  domainName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strips protocol, www., and path — returns null for non-domain strings */
function normaliseDomain(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  // Must contain a dot to be a real domain (not a slug like "evan-blog")
  return s.includes(".") ? s : null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns deduplicated domains for a location from two confirmed sources:
 *  – location.domain field
 *  – domain field on each redirect rule
 */
export async function fetchDomains(
  locationId: string,
  accessToken: string,
): Promise<GHLDomain[]> {
  const client = getGhlClient(accessToken);
  const seen = new Set<string>();
  const domains: GHLDomain[] = [];

  const add = (raw: string | undefined | null) => {
    const host = normaliseDomain(raw);
    if (!host || seen.has(host)) return;
    seen.add(host);
    domains.push({ id: host, domainName: host });
  };

  // ── 1. Location's primary domain field ───────────────────────────────────
  try {
    const locResp = await client.get(`/locations/${locationId}`);
    add(locResp.data?.location?.domain);
  } catch {
    // Non-fatal — continue to redirect rules
  }

  // ── 2. Redirect rules — each carries the real connected domain name ───────
  //    Max limit enforced by GHL is 20 per page.
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
        if (!r.deleted) add(r.domain);
      }

      if (page.length < limit) break; // last page
      offset += limit;
    }
  } catch {
    // Non-fatal
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
  const normalised = normaliseDomain(domainName) ?? "";

  const match = domains.find(
    (d) =>
      d.domainName === normalised || normalised.endsWith(d.domainName),
  );

  return match ? match.id : null;
}
