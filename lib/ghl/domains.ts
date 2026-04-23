/**
 * lib/ghl/domains.ts
 * ------------------
 * Service to fetch and manage domains for a GHL location.
 */

import axios from "axios";

const API_BASE = process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";

export interface GHLDomain {
  id: string;
  domainName: string;
}

/**
 * Fetches all domains for a given location.
 */
export async function fetchDomains(locationId: string, accessToken: string): Promise<GHLDomain[]> {
  const resp = await axios.get(`${API_BASE}/locations/${locationId}/domains`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
    },
  });

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
