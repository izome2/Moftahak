'use server';

import { NextRequest, NextResponse } from 'next/server';


const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];


const lookupCache = new Map<string, { data: AirbnbLookupResult; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000;


let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;

interface AirbnbLookupResult {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  reviewsCount: number;
  airbnbUrl: string;
  thumbnailUrl?: string;
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}


function extractListingId(url: string): string | null {
  try {
    
    
    
    
    
    const patterns = [
      /airbnb\.com\/rooms\/(\d+)/i,
      /airbnb\.[a-z]+\/rooms\/(\d+)/i,
      /\/rooms\/(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    
    if (/^\d+$/.test(url.trim())) {
      return url.trim();
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchListingWithLocation(listingId: string): Promise<AirbnbLookupResult | null> {
  try {
    
    const cached = lookupCache.get(listingId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] Lookup ${listingId}`);
      return cached.data;
    }

    
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    
    const url = `https://ar.airbnb.com/rooms/${listingId}`;
    console.log(`[Lookup] Fetching ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch listing ${listingId}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    
    const result = extractDataFromHtml(html, listingId, url);
    
    if (result) {
      lookupCache.set(listingId, { data: result, timestamp: Date.now() });
    }

    return result;
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    return null;
  }
}

function extractDataFromHtml(html: string, listingId: string, originalUrl: string): AirbnbLookupResult | null {
  try {
    let lat = 0;
    let lng = 0;
    let guests = 0;
    let bedrooms = 0;
    let beds = 0;
    let bathrooms = 0;
    let rating = 0;
    let reviewsCount = 0;
    let name = '';
    let thumbnailUrl = '';

    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].replace(/\s*[-–]\s*Airbnb.*$/i, '').trim();
    }

    
    
    
    const latLngPatterns = [
      /"lat"\s*:\s*([-]?\d+\.?\d*)\s*,\s*"lng"\s*:\s*([-]?\d+\.?\d*)/,
      /"latitude"\s*:\s*([-]?\d+\.?\d*)\s*,\s*"longitude"\s*:\s*([-]?\d+\.?\d*)/,
      /"lat"\s*:\s*([-]?\d+\.?\d*)[\s\S]*?"lng"\s*:\s*([-]?\d+\.?\d*)/,
      /lat['"]\s*:\s*([-]?\d+\.?\d*)/,
    ];

    for (const pattern of latLngPatterns) {
      const match = html.match(pattern);
      if (match) {
        const parsedLat = parseFloat(match[1]);
        const parsedLng = parseFloat(match[2] || '0');
        
        
        if (parsedLat !== 0 && parsedLat >= -90 && parsedLat <= 90) {
          lat = parsedLat;
          if (parsedLng !== 0 && parsedLng >= -180 && parsedLng <= 180) {
            lng = parsedLng;
          }
          break;
        }
      }
    }

    
    if (lat === 0 || lng === 0) {
      const mapMatch = html.match(/maps\.google\.com[^"]*@([-]?\d+\.?\d*),([-]?\d+\.?\d*)/);
      if (mapMatch) {
        lat = parseFloat(mapMatch[1]);
        lng = parseFloat(mapMatch[2]);
      }
    }

    
    if (lat === 0 || lng === 0) {
      const geoLatMatch = html.match(/<meta[^>]*property="place:location:latitude"[^>]*content="([-]?\d+\.?\d*)"/);
      const geoLngMatch = html.match(/<meta[^>]*property="place:location:longitude"[^>]*content="([-]?\d+\.?\d*)"/);
      if (geoLatMatch && geoLngMatch) {
        lat = parseFloat(geoLatMatch[1]);
        lng = parseFloat(geoLngMatch[1]);
      }
    }

    
    if (lat === 0 || lng === 0) {
      const listingLatMatch = html.match(/listingLat['"]\s*:\s*([-]?\d+\.?\d*)/);
      const listingLngMatch = html.match(/listingLng['"]\s*:\s*([-]?\d+\.?\d*)/);
      if (listingLatMatch && listingLngMatch) {
        lat = parseFloat(listingLatMatch[1]);
        lng = parseFloat(listingLngMatch[1]);
      }
    }

    
    if (lat === 0 || lng === 0) {
      console.error(`[Lookup] Could not extract location for listing ${listingId}`);
      return null;
    }

    
    
    
    const detailsPattern = /(\d+)\s*ضي[وف]+\s*[·•]\s*(\d+)\s*غرف?\s*نوم\s*[·•]\s*(\d+)\s*(?:أسر[ةّ]|سرير)\s*[·•]\s*(\d+)\s*حمام/;
    const detailsMatch = html.match(detailsPattern);
    if (detailsMatch) {
      guests = parseInt(detailsMatch[1]);
      bedrooms = parseInt(detailsMatch[2]);
      beds = parseInt(detailsMatch[3]);
      bathrooms = parseInt(detailsMatch[4]);
    } else {
      
      const guestsMatch = html.match(/(\d+)\s*ضي[وف]+/);
      if (guestsMatch) guests = parseInt(guestsMatch[1]);

      const bedroomsMatch = html.match(/(\d+)\s*غرف?\s*نوم/);
      if (bedroomsMatch) bedrooms = parseInt(bedroomsMatch[1]);

      const bedsMatch = html.match(/(\d+)\s*(?:أسر[ةّ]|سرير)/);
      if (bedsMatch) beds = parseInt(bedsMatch[1]);

      const bathroomsMatch = html.match(/(\d+)\s*حمام/);
      if (bathroomsMatch) bathrooms = parseInt(bathroomsMatch[1]);
    }

    
    const ratingMatch = html.match(/(\d+[.,]\d+)\s*[·•]\s*(\d+)\s*(?:تقييم|مراجع)/);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1].replace(',', '.'));
      reviewsCount = parseInt(ratingMatch[2]);
    } else {
      const ratingOnly = html.match(/"avgRating"\s*:\s*([\d.]+)/);
      if (ratingOnly) rating = parseFloat(ratingOnly[1]);
      
      const reviewsOnly = html.match(/"reviewCount"\s*:\s*(\d+)/);
      if (reviewsOnly) reviewsCount = parseInt(reviewsOnly[1]);
    }

    
    const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
    if (imgMatch) {
      thumbnailUrl = imgMatch[1];
    }

    
    const jsonMatches = html.matchAll(/<script[^>]*type="application\/json"[^>]*>([^<]+)<\/script>/gi);
    for (const match of jsonMatches) {
      try {
        const jsonStr = match[1];
        
        
        if (lat === 0 || lng === 0) {
          const jsonLatMatch = jsonStr.match(/"lat"\s*:\s*([-]?\d+\.?\d*)/);
          const jsonLngMatch = jsonStr.match(/"lng"\s*:\s*([-]?\d+\.?\d*)/);
          if (jsonLatMatch && jsonLngMatch) {
            const parsedLat = parseFloat(jsonLatMatch[1]);
            const parsedLng = parseFloat(jsonLngMatch[1]);
            if (parsedLat !== 0 && parsedLat >= -90 && parsedLat <= 90 &&
                parsedLng !== 0 && parsedLng >= -180 && parsedLng <= 180) {
              lat = parsedLat;
              lng = parsedLng;
            }
          }
        }

        
        if (jsonStr.includes('personCapacity') || jsonStr.includes('guestLabel')) {
          const capacityMatch = jsonStr.match(/"personCapacity"\s*:\s*(\d+)/);
          if (capacityMatch && !guests) guests = parseInt(capacityMatch[1]);

          const bedroomJsonMatch = jsonStr.match(/"bedroomLabel"\s*:\s*"(\d+)/);
          if (bedroomJsonMatch && !bedrooms) bedrooms = parseInt(bedroomJsonMatch[1]);

          const bedJsonMatch = jsonStr.match(/"bedLabel"\s*:\s*"(\d+)/);
          if (bedJsonMatch && !beds) beds = parseInt(bedJsonMatch[1]);

          const bathJsonMatch = jsonStr.match(/"bathLabel"\s*:\s*"(\d+)/);
          if (bathJsonMatch && !bathrooms) bathrooms = parseInt(bathJsonMatch[1]);
        }
      } catch {
        
      }
    }

    return {
      id: listingId,
      name: name || `شقة ${listingId}`,
      location: { lat, lng },
      guests: guests || 2,
      bedrooms: bedrooms || 1,
      beds: beds || 1,
      bathrooms: bathrooms || 1,
      rating,
      reviewsCount,
      airbnbUrl: `https://www.airbnb.com/rooms/${listingId}`,
      thumbnailUrl,
    };
  } catch (error) {
    console.error(`Error extracting data from HTML:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL', message: 'يرجى إدخال رابط الشقة' },
        { status: 400 }
      );
    }

    const listingId = extractListingId(url);
    if (!listingId) {
      return NextResponse.json(
        { error: 'Invalid URL', message: 'رابط غير صالح. يرجى إدخال رابط Airbnb صحيح' },
        { status: 400 }
      );
    }

    console.log(`[Lookup] Processing listing ID: ${listingId}`);

    const result = await fetchListingWithLocation(listingId);

    if (!result) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch listing', 
          message: 'فشل في جلب معلومات الشقة. تأكد من صحة الرابط وحاول مرة أخرى' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: result,
    });
  } catch (error) {
    console.error('Error in airbnb-lookup API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}
