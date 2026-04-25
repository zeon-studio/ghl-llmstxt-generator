/**
 * lib/ghl/domains.ts
 * ------------------
 * Service to fetch and manage domains for a GHL location.
 */

import { getGhlClient } from "./client";

export interface GHLDomain {
  id: string;
  domainName: string;
}

/**
 * Fetches all domains for a given location.
 */
export async function fetchDomains(locationId: string, accessToken: string): Promise<GHLDomain[]> {
  const client = getGhlClient(accessToken);
  const resp = await client.get(`/locations/${locationId}/domains`);

  return resp.data?.domains ?? [];
}

/**
 * Finds a Domain ID by matching a domain name.
 */
export async function findDomainIdByName(
  locationId: string, 
  domainName: string, 
  accessToken: string
): Promise<string | null> {
  const domains = await fetchDomains(locationId, accessToken);
  const normalizedSearch = domainName.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  
  const match = domains.find(d => 
    d.domainName.toLowerCase() === normalizedSearch || 
    normalizedSearch.endsWith(d.domainName.toLowerCase())
  );

  return match ? match.id : null;
}
