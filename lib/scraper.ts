/**
 * lib/scraper.ts
 * --------------
 * Simple utility to fetch a website and extract its metadata
 * (Title and Description) for the llms.txt header.
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface SiteMetadata {
  title?: string;
  description?: string;
}

/**
 * Scrapes a URL and returns its title and meta description.
 */
export async function scrapeMetadata(url: string): Promise<SiteMetadata> {
  try {
    const { data } = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LLMSTxtBot/1.0)",
      },
    });

    const $ = cheerio.load(data);
    
    const title = 
      $('meta[property="og:title"]').attr("content") || 
      $("title").text() || 
      "";

    const description = 
      $('meta[name="description"]').attr("content") || 
      $('meta[property="og:description"]').attr("content") || 
      "";

    return {
      title: title.trim(),
      description: description.trim(),
    };
  } catch (error) {
    console.error(`[Scraper] Failed to fetch metadata for ${url}:`, error);
    return {};
  }
}
