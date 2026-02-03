/**
 * Script to fetch 2026 Hot Chocolate Festival data from the website
 * Run with: npx tsx scripts/fetch-2026-data.ts
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Types matching the app's data model
interface Store {
  name: string;
  address: string;
  hours: string;
  point: [number, number];
}

interface Location {
  id: number;
  name: string;
  description: string;
  instagram: string;
  website: string;
  stores: Store[];
}

interface Flavour {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  location: number;
  tags: string[];
}

// Load existing 2025 data for coordinate matching
const existingLocations: { version: string; data: Location[] } = JSON.parse(
  readFileSync(join(__dirname, '../assets/LocationList.json'), 'utf-8')
);

// Create a map of vendor names to their store coordinates
const existingCoordinates = new Map<string, Map<string, [number, number]>>();
for (const loc of existingLocations.data) {
  const storeMap = new Map<string, [number, number]>();
  for (const store of loc.stores) {
    // Index by address for matching
    storeMap.set(store.address.toLowerCase(), store.point);
  }
  existingCoordinates.set(loc.name.toLowerCase(), storeMap);
}

// Helper to decode HTML entities
function decodeHtml(html: string): string {
  return html
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to find coordinates from existing data
function findCoordinates(vendorName: string, address: string): [number, number] | null {
  const normalizedVendor = vendorName.toLowerCase().replace(/ – new$/i, '');
  const normalizedAddress = address.toLowerCase();

  // Try exact vendor match first
  const vendorStores = existingCoordinates.get(normalizedVendor);
  if (vendorStores) {
    // Try to find matching address
    for (const [existingAddr, coords] of vendorStores) {
      if (normalizedAddress.includes(existingAddr.split(',')[0].toLowerCase()) ||
          existingAddr.includes(normalizedAddress.split(',')[0].toLowerCase())) {
        return coords;
      }
    }
    // Return first store if only one
    if (vendorStores.size === 1) {
      return vendorStores.values().next().value;
    }
  }

  // Try fuzzy vendor name match
  for (const [existingVendor, stores] of existingCoordinates) {
    if (normalizedVendor.includes(existingVendor) || existingVendor.includes(normalizedVendor)) {
      for (const [existingAddr, coords] of stores) {
        if (normalizedAddress.includes(existingAddr.split(',')[0].toLowerCase()) ||
            existingAddr.includes(normalizedAddress.split(',')[0].toLowerCase())) {
          return coords;
        }
      }
    }
  }

  return null;
}

// Fetch all vendors from the API
async function fetchVendors(): Promise<any[]> {
  const vendors: any[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://hotchocolatefest.com/wp-json/wp/v2/vendors?per_page=100&page=${page}`
    );

    if (!response.ok) break;

    const data = await response.json();
    if (data.length === 0) break;

    vendors.push(...data);
    page++;
  }

  return vendors;
}

// Fetch vendor page and extract detailed info
async function fetchVendorDetails(slug: string): Promise<{
  description: string;
  instagram: string;
  website: string;
  stores: { name: string; address: string; hours: string }[];
  flavours: { name: string; description: string; startDate: string; endDate: string; tags: string[] }[];
} | null> {
  try {
    const response = await fetch(`https://hotchocolatefest.com/vendors/${slug}/`);
    if (!response.ok) return null;

    const html = await response.text();

    // Extract description - look for the main content section
    const descMatch = html.match(/<div[^>]*class="[^"]*vendor-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                      html.match(/<div[^>]*class="[^"]*elementor-widget-text-editor[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const description = descMatch ? decodeHtml(descMatch[1]) : '';

    // Extract Instagram handle
    const instaMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
    const instagram = instaMatch ? instaMatch[1] : '';

    // Extract website
    const websiteMatch = html.match(/<a[^>]*href="(https?:\/\/(?!instagram|facebook|twitter)[^"]+)"[^>]*>.*?(?:website|visit|official)/i) ||
                         html.match(/Website:?\s*<a[^>]*href="([^"]+)"/i);
    const website = websiteMatch ? websiteMatch[1] : '';

    // Extract store locations - look for address patterns
    const stores: { name: string; address: string; hours: string }[] = [];
    const addressMatches = html.matchAll(/(\d+[^<,]+(?:St\.|Street|Ave\.|Avenue|Way|Blvd|Road|Rd)[^<]*(?:Vancouver|Richmond|Burnaby|North Vancouver|Surrey|New Westminster|Coquitlam|Port Moody|Langley|White Rock|Whistler)[^<]*)/gi);

    for (const match of addressMatches) {
      const address = decodeHtml(match[1]);
      if (!stores.some(s => s.address === address)) {
        stores.push({ name: '', address, hours: '' });
      }
    }

    // Extract flavours
    const flavours: { name: string; description: string; startDate: string; endDate: string; tags: string[] }[] = [];

    // Look for flavour sections with numbers like #001
    const flavourMatches = html.matchAll(/#(\d{3})\s*[–-]\s*([^<]+)/gi);
    for (const match of flavourMatches) {
      const name = decodeHtml(match[2]);
      flavours.push({
        name,
        description: '',
        startDate: '2026-01-17T08:00:00Z',
        endDate: '2026-02-14T08:00:00Z',
        tags: []
      });
    }

    return { description, instagram, website, stores, flavours };
  } catch (error) {
    console.error(`Error fetching ${slug}:`, error);
    return null;
  }
}

// Main execution
async function main() {
  console.log('Fetching vendors from API...');
  const vendors = await fetchVendors();
  console.log(`Found ${vendors.length} vendors`);

  const locations: Location[] = [];
  const flavours: Flavour[] = [];
  let flavourId = 1;

  for (let i = 0; i < vendors.length; i++) {
    const vendor = vendors[i];
    const name = decodeHtml(vendor.title.rendered).replace(/ – NEW$/, '');
    const slug = vendor.slug;

    console.log(`[${i + 1}/${vendors.length}] Processing ${name}...`);

    // Fetch detailed info from vendor page
    const details = await fetchVendorDetails(slug);

    const locationId = i + 1;

    // Build store data with coordinates
    const stores: Store[] = [];
    if (details?.stores.length) {
      for (const store of details.stores) {
        const coords = findCoordinates(name, store.address);
        if (coords) {
          stores.push({
            name: store.name || 'Main',
            address: store.address,
            hours: store.hours || 'See website for hours',
            point: coords
          });
        } else {
          console.log(`  No coordinates found for: ${store.address}`);
          stores.push({
            name: store.name || 'Main',
            address: store.address,
            hours: store.hours || 'See website for hours',
            point: [49.2827, -123.1207] // Default to Vancouver downtown, needs manual update
          });
        }
      }
    }

    // If no stores found from page, try to use existing data
    if (stores.length === 0) {
      const existing = existingLocations.data.find(l =>
        l.name.toLowerCase() === name.toLowerCase() ||
        l.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(l.name.toLowerCase())
      );
      if (existing) {
        stores.push(...existing.stores);
      }
    }

    locations.push({
      id: locationId,
      name,
      description: details?.description || '',
      instagram: details?.instagram || '',
      website: details?.website || '',
      stores: stores.length ? stores : [{ name: 'Main', address: 'See website', hours: 'See website', point: [49.2827, -123.1207] }]
    });

    // Add flavours
    if (details?.flavours.length) {
      for (const flav of details.flavours) {
        flavours.push({
          id: flavourId++,
          name: flav.name,
          description: flav.description,
          startDate: flav.startDate,
          endDate: flav.endDate,
          location: locationId,
          tags: flav.tags
        });
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Write output files
  const locationOutput = {
    version: '2026.01',
    data: locations
  };

  const flavourOutput = {
    version: '2026.01',
    data: flavours
  };

  writeFileSync(
    join(__dirname, '../assets/LocationList.2026.json'),
    JSON.stringify(locationOutput, null, 2)
  );

  writeFileSync(
    join(__dirname, '../assets/FlavourList.2026.json'),
    JSON.stringify(flavourOutput, null, 2)
  );

  console.log('\nDone!');
  console.log(`Locations: ${locations.length}`);
  console.log(`Flavours: ${flavours.length}`);
  console.log('\nOutput written to:');
  console.log('  - assets/LocationList.2026.json');
  console.log('  - assets/FlavourList.2026.json');
  console.log('\nReview and rename to replace existing files.');
}

main().catch(console.error);
