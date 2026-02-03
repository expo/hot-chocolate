/**
 * Script to enrich existing data with flavour descriptions and vendor logos
 * Run with: bunx tsx scripts/enrich-data.ts
 */

import * as cheerio from 'cheerio';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const VENDORS_API = 'https://hotchocolatefest.com/wp-json/wp/v2/vendors';

interface VendorAPIResponse {
  id: number;
  slug: string;
  title: { rendered: string };
  link: string;
  featured_image?: string;
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
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch all vendors from API to get slugs and image URLs
async function fetchVendorAPI(): Promise<VendorAPIResponse[]> {
  const vendors: VendorAPIResponse[] = [];
  let page = 1;

  while (true) {
    console.log(`Fetching API page ${page}...`);
    const response = await fetch(`${VENDORS_API}?per_page=100&page=${page}`);
    if (!response.ok) break;

    const data = await response.json();
    if (data.length === 0) break;

    vendors.push(...data);
    page++;
  }

  return vendors;
}

// Fetch vendor page and extract flavour descriptions
async function fetchVendorPage(slug: string): Promise<Map<number, string>> {
  const flavourDescriptions = new Map<number, string>();

  try {
    const response = await fetch(`https://hotchocolatefest.com/vendors/${slug}/`);
    if (!response.ok) return flavourDescriptions;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find all headings that contain flavour IDs (#001, #002, etc.)
    $('h1, h2, h3, h4, h5, h6, p, strong').each((_, el) => {
      const text = $(el).text();
      const match = text.match(/#(\d{1,3})\s*[–-]\s*/);

      if (match) {
        const flavourId = parseInt(match[1], 10);

        // Collect text from following elements until next flavour or section
        let description = '';
        let current = $(el).next();
        let iterations = 0;

        while (current.length && iterations < 10) {
          const currentText = current.text().trim();

          // Stop if we hit another flavour heading
          if (currentText.match(/#\d{1,3}\s*[–-]/)) break;

          // Stop if we hit certain section headers
          if (current.is('h1, h2, h3') && !currentText.match(/#\d{1,3}/)) break;

          // Collect paragraph text
          if (current.is('p') && currentText.length > 10) {
            // Skip availability dates
            if (!currentText.match(/^Available:/i) && !currentText.match(/^January|^February/i)) {
              description += (description ? ' ' : '') + currentText;
            }
          }

          current = current.next();
          iterations++;
        }

        // Also check if the description is in the same element after the title
        const remainingText = text.replace(match[0], '').trim();
        if (remainingText.length > 20 && !description) {
          description = remainingText;
        }

        if (description) {
          // Clean up the description
          description = decodeHtml(description)
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/\s+/g, ' ')
            .trim();

          flavourDescriptions.set(flavourId, description);
        }
      }
    });

    // Alternative: look for description paragraphs that follow flavour mentions
    const fullText = $('body').text();
    const flavourSections = fullText.split(/#(\d{1,3})\s*[–-]/);

    for (let i = 1; i < flavourSections.length; i += 2) {
      const id = parseInt(flavourSections[i], 10);
      if (!flavourDescriptions.has(id) && flavourSections[i + 1]) {
        let desc = flavourSections[i + 1]
          .split(/(?:#\d{1,3}|Available:|Location:|$)/)[0]
          .trim();

        // Extract just the name and description part
        const lines = desc.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
          // First line is the name, rest might be description
          const descLines = lines.slice(1).filter(l =>
            l.length > 20 &&
            !l.match(/^January|^February|^Available/i) &&
            !l.match(/^\d+\s*(a\.m\.|p\.m\.)/i)
          );

          if (descLines.length > 0) {
            const cleanDesc = decodeHtml(descLines.join(' ')).substring(0, 500);
            flavourDescriptions.set(id, cleanDesc);
          }
        }
      }
    }

    return flavourDescriptions;
  } catch (error) {
    console.error(`Error fetching ${slug}:`, error);
    return flavourDescriptions;
  }
}

// Download vendor logo
async function downloadLogo(url: string, slug: string): Promise<string | null> {
  const logoDir = join(__dirname, '..', 'assets', 'vendor-logos');

  if (!existsSync(logoDir)) {
    mkdirSync(logoDir, { recursive: true });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const ext = url.match(/\.(png|jpg|jpeg|gif|webp)/i)?.[1] || 'png';
    const filename = `${slug}.${ext}`;
    const filepath = join(logoDir, filename);

    writeFileSync(filepath, Buffer.from(buffer));
    return filename;
  } catch (error) {
    console.error(`Error downloading logo for ${slug}:`, error);
    return null;
  }
}

async function main() {
  // Load existing data
  const locationsPath = join(__dirname, '..', 'assets', 'LocationList.json');
  const flavoursPath = join(__dirname, '..', 'assets', 'FlavourList.json');

  const locations = JSON.parse(readFileSync(locationsPath, 'utf-8'));
  const flavours = JSON.parse(readFileSync(flavoursPath, 'utf-8'));

  // Create lookup maps
  const locationByName = new Map<string, any>();
  for (const loc of locations.data) {
    const normalizedName = loc.name.toLowerCase().replace(/ – new$/i, '').trim();
    locationByName.set(normalizedName, loc);
  }

  const flavourById = new Map<number, any>();
  for (const flav of flavours.data) {
    flavourById.set(flav.id, flav);
  }

  // Fetch vendor data from API
  console.log('Fetching vendor list from API...');
  const apiVendors = await fetchVendorAPI();
  console.log(`Found ${apiVendors.length} vendors\n`);

  let updatedFlavours = 0;
  let downloadedLogos = 0;

  for (const vendor of apiVendors) {
    const vendorName = decodeHtml(vendor.title.rendered)
      .replace(/ – NEW$/i, '')
      .trim();

    const normalizedName = vendorName.toLowerCase();
    const location = locationByName.get(normalizedName);

    if (!location) {
      // Try partial match
      let found = false;
      for (const [key, loc] of locationByName) {
        if (key.includes(normalizedName) || normalizedName.includes(key)) {
          console.log(`[${vendor.slug}] Partial match: "${vendorName}" -> "${loc.name}"`);
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(`[${vendor.slug}] No match for: ${vendorName}`);
      }
      continue;
    }

    console.log(`[${vendor.slug}] Processing: ${vendorName}`);

    // Download logo if available
    if (vendor.featured_image && !location.logoUrl) {
      const logoFile = await downloadLogo(vendor.featured_image, vendor.slug);
      if (logoFile) {
        location.logoUrl = logoFile;
        downloadedLogos++;
        console.log(`  Downloaded logo: ${logoFile}`);
      }
    }

    // Fetch flavour descriptions from vendor page
    const descriptions = await fetchVendorPage(vendor.slug);

    for (const [flavourId, description] of descriptions) {
      const flavour = flavourById.get(flavourId);
      if (flavour && (!flavour.description || flavour.description.length < description.length)) {
        flavour.description = description;
        updatedFlavours++;
        console.log(`  Updated flavour #${flavourId}: ${description.substring(0, 60)}...`);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Save updated data
  writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
  writeFileSync(flavoursPath, JSON.stringify(flavours, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Updated ${updatedFlavours} flavour descriptions`);
  console.log(`Downloaded ${downloadedLogos} logos`);
  console.log('Data saved!');
}

main().catch(console.error);
