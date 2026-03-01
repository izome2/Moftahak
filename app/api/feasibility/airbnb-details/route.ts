'use server';

import { NextRequest, NextResponse } from 'next/server';


const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];


const detailsCache = new Map<string, { data: AirbnbDetails; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; 


let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; 

interface AirbnbDetails {
  id: string;
  name: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  reviewsCount: number;
  description?: string;
  amenities?: string[];
  hostName?: string;
  propertyType?: string;
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchListingDetails(listingId: string): Promise<AirbnbDetails | null> {
  try {
    
    const cached = detailsCache.get(listingId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] Listing ${listingId}`);
      return cached.data;
    }

    
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    
    const url = `https://ar.airbnb.com/rooms/${listingId}`;
    console.log(`[Fetching] ${url}`);

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

    
    const details = extractDetailsFromHtml(html, listingId);
    
    if (details) {
      
      detailsCache.set(listingId, { data: details, timestamp: Date.now() });
    }

    return details;
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    return null;
  }
}

function extractDetailsFromHtml(html: string, listingId: string): AirbnbDetails | null {
  try {
    
    
    
    let guests = 0;
    let bedrooms = 0;
    let beds = 0;
    let bathrooms = 0;
    let rating = 0;
    let reviewsCount = 0;
    let name = '';
    let description = '';
    let hostName = '';
    let propertyType = '';
    const amenities: string[] = [];

    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].replace(/\s*[-–]\s*Airbnb.*$/i, '').trim();
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

    
    const hostMatch = html.match(/مضيف[ةه]?\s+([^<\n]+)/i) || html.match(/"hostName"\s*:\s*"([^"]+)"/);
    if (hostMatch) hostName = hostMatch[1].trim();

    
    const typeMatch = html.match(/"roomType"\s*:\s*"([^"]+)"/) || html.match(/"propertyType"\s*:\s*"([^"]+)"/);
    if (typeMatch) propertyType = typeMatch[1];

    
    const jsonMatches = html.matchAll(/<script[^>]*type="application\/json"[^>]*>([^<]+)<\/script>/gi);
    for (const match of jsonMatches) {
      try {
        const jsonStr = match[1];
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

    
    if (guests === 0 && bedrooms === 0 && beds === 0 && bathrooms === 0) {
      console.log(`[Warning] Could not extract details for listing ${listingId}`);
      
    }

    return {
      id: listingId,
      name: name || `شقة ${listingId}`,
      guests,
      bedrooms,
      beds,
      bathrooms,
      rating,
      reviewsCount,
      description,
      amenities,
      hostName,
      propertyType,
    };
  } catch (error) {
    console.error(`Error extracting details from HTML:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listing ID', message: 'يرجى تحديد معرف الشقة' },
        { status: 400 }
      );
    }

    const details = await fetchListingDetails(listingId);

    if (!details) {
      return NextResponse.json(
        { error: 'Failed to fetch details', message: 'فشل في جلب تفاصيل الشقة' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      details,
    });
  } catch (error) {
    console.error('Error in airbnb-details API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing listing IDs', message: 'يرجى تحديد معرفات الشقق' },
        { status: 400 }
      );
    }

    
    const limitedIds = ids.slice(0, 10);
    
    const results: { [key: string]: AirbnbDetails | null } = {};
    
    
    for (const id of limitedIds) {
      results[id] = await fetchListingDetails(id);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      details: results,
      fetched: Object.keys(results).filter(k => results[k] !== null).length,
      total: limitedIds.length,
    });
  } catch (error) {
    console.error('Error in airbnb-details batch API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}
