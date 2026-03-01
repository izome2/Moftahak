import { NextRequest, NextResponse } from 'next/server';






interface CachedResult {
  listings: AirbnbListing[];
  timestamp: number;
  metadata: any;
}

const resultsCache = new Map<string, CachedResult>();
const CACHE_DURATION = 10 * 60 * 1000; 


interface RateLimitState {
  requestCount: number;
  windowStart: number;
  lastRequestTime: number;
  isBlocked: boolean;
  blockUntil: number;
}

const rateLimitState: RateLimitState = {
  requestCount: 0,
  windowStart: Date.now(),
  lastRequestTime: 0,
  isBlocked: false,
  blockUntil: 0,
};


const PROTECTION_CONFIG = {
  maxRequestsPerMinute: 15,       
  maxRequestsPerHour: 100,        
  minDelayBetweenRequests: 1500,  
  delayBetweenBatches: 3000,      
  maxConcurrentRequests: 3,       
  cooldownAfterError: 15000,      
  maxGridSize: 4,                 
};


const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}


function generateCacheKey(params: SearchParams): string {
  
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `${round(params.ne_lat)}_${round(params.ne_lng)}_${round(params.sw_lat)}_${round(params.sw_lng)}`;
}


function checkRateLimit(): { allowed: boolean; waitTime: number; reason?: string } {
  const now = Date.now();
  
  
  if (rateLimitState.isBlocked && now < rateLimitState.blockUntil) {
    return { 
      allowed: false, 
      waitTime: rateLimitState.blockUntil - now,
      reason: 'في فترة راحة مؤقتة لحماية من الحظر'
    };
  }
  
  
  if (rateLimitState.isBlocked && now >= rateLimitState.blockUntil) {
    rateLimitState.isBlocked = false;
    rateLimitState.requestCount = 0;
    rateLimitState.windowStart = now;
  }
  
  
  if (now - rateLimitState.windowStart > 60000) {
    rateLimitState.requestCount = 0;
    rateLimitState.windowStart = now;
  }
  
  
  if (rateLimitState.requestCount >= PROTECTION_CONFIG.maxRequestsPerMinute) {
    return { 
      allowed: false, 
      waitTime: 60000 - (now - rateLimitState.windowStart),
      reason: 'تم الوصول للحد الأقصى من الطلبات في الدقيقة'
    };
  }
  
  
  const timeSinceLastRequest = now - rateLimitState.lastRequestTime;
  if (timeSinceLastRequest < PROTECTION_CONFIG.minDelayBetweenRequests) {
    return { 
      allowed: false, 
      waitTime: PROTECTION_CONFIG.minDelayBetweenRequests - timeSinceLastRequest,
      reason: 'انتظار بين الطلبات'
    };
  }
  
  return { allowed: true, waitTime: 0 };
}


function recordRequest() {
  rateLimitState.requestCount++;
  rateLimitState.lastRequestTime = Date.now();
}


function activateCooldown(duration: number = PROTECTION_CONFIG.cooldownAfterError) {
  rateLimitState.isBlocked = true;
  rateLimitState.blockUntil = Date.now() + duration;
  console.log(`⚠️ تم تفعيل فترة راحة لمدة ${duration / 1000} ثانية`);
}


interface AirbnbListing {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  guests: number;
  reviewsCount: number;
  rating: number;
  imageUrl?: string;
  hostName?: string;
  propertyType?: string;
}

interface SearchParams {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
  adults?: number;
  checkin?: string;
  checkout?: string;
  thoroughness?: 'fast' | 'normal' | 'thorough' | 'complete';
  excludeIds?: string[]; 
  searchStrategy?: 'normal' | 'micro-grid' | 'offset'; 
}


function extractListingFromSearchResult(result: any): AirbnbListing | null {
  try {
    if (!result || result.__typename !== 'StaySearchResult') return null;
    
    
    const demandListing = result.demandStayListing;
    if (!demandListing) return null;
    
    
    const coordinate = demandListing.location?.coordinate;
    if (!coordinate?.latitude || !coordinate?.longitude) return null;
    
    
    let id = '';
    if (demandListing.id) {
      try {
        const decoded = Buffer.from(demandListing.id, 'base64').toString('utf-8');
        const idMatch = decoded.match(/:(\d+)$/);
        if (idMatch) {
          id = idMatch[1];
        }
      } catch {
        id = demandListing.id;
      }
    }
    if (!id) return null;
    
    
    let name = '';
    
    if (demandListing.description?.name?.localizedStringWithTranslationPreference) {
      name = demandListing.description.name.localizedStringWithTranslationPreference;
    }
    
    else if (result.listing?.title) {
      name = result.listing.title;
    }
    
    else if (result.nameLocalized?.localizedStringWithTranslationPreference) {
      name = result.nameLocalized.localizedStringWithTranslationPreference;
    }
    
    else if (result.title) {
      name = result.title;
    }
    
    else if (result.subtitle) {
      name = result.subtitle;
    }
    
    
    let propertyType = '';
    if (result.listing?.typeLabel) {
      propertyType = result.listing.typeLabel;
    } else if (demandListing.listingObjType) {
      propertyType = demandListing.listingObjType;
    }
    
    
    const price = 0;
    
    
    let bedrooms = 0;
    let bathrooms = 0;
    let beds = 0;
    let guests = 0;
    
    const primaryLine = result.structuredContent?.primaryLine || [];
    for (const item of primaryLine) {
      const body = item.body || '';
      
      
      if (item.type === 'BEDINFO' || body.includes('غرف نوم') || body.includes('غرفة نوم') || body.toLowerCase().includes('bedroom')) {
        const match = body.match(/(\d+)/);
        if (match) bedrooms = parseInt(match[1]);
      }
      
      if (body.includes('أسرّة') || body.includes('سرير') || body.toLowerCase().includes('bed')) {
        const match = body.match(/(\d+)/);
        if (match && !body.includes('غرف')) beds = parseInt(match[1]);
      }
      
      if (body.includes('حمام') || body.toLowerCase().includes('bathroom')) {
        const match = body.match(/(\d+)/);
        if (match) bathrooms = parseInt(match[1]);
      }
      
      if (body.includes('ضيف') || body.includes('ضيوف') || body.toLowerCase().includes('guest')) {
        const match = body.match(/(\d+)/);
        if (match) guests = parseInt(match[1]);
      }
    }
    
    
    const secondaryLine = result.structuredContent?.secondaryLine || [];
    for (const item of secondaryLine) {
      const body = item.body || '';
      if (!bathrooms && (body.includes('حمام') || body.toLowerCase().includes('bathroom'))) {
        const match = body.match(/(\d+)/);
        if (match) bathrooms = parseInt(match[1]);
      }
      if (!guests && (body.includes('ضيف') || body.includes('ضيوف') || body.toLowerCase().includes('guest'))) {
        const match = body.match(/(\d+)/);
        if (match) guests = parseInt(match[1]);
      }
    }
    
    
    let rating = 0;
    let reviewsCount = 0;
    if (result.avgRatingLocalized) {
      const ratingMatch = result.avgRatingLocalized.match(/([\d.]+)\s*\((\d+)\)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
        reviewsCount = parseInt(ratingMatch[2]);
      }
    } else if (result.avgRating) {
      rating = result.avgRating;
      reviewsCount = result.reviewsCount || 0;
    }
    
    
    const imageUrl = result.contextualPictures?.[0]?.picture || 
                     result.listing?.contextualPictures?.[0]?.picture || '';
    
    
    const hostName = demandListing.primaryHost?.firstName || '';
    
    
    return {
      id,
      name,
      lat: coordinate.latitude,
      lng: coordinate.longitude,
      price,
      currency: 'EGP',
      bedrooms,
      bathrooms,
      beds,
      guests,
      reviewsCount,
      rating,
      imageUrl,
      hostName,
      propertyType,
    };
  } catch (e) {
    console.log('Error extracting listing from search result:', e);
    return null;
  }
}


function divideSearchArea(params: SearchParams, gridSize: number = 2): SearchParams[] {
  const { ne_lat, ne_lng, sw_lat, sw_lng } = params;
  
  const latStep = (ne_lat - sw_lat) / gridSize;
  const lngStep = (ne_lng - sw_lng) / gridSize;
  
  const subAreas: SearchParams[] = [];
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      subAreas.push({
        ...params,
        sw_lat: sw_lat + (i * latStep),
        sw_lng: sw_lng + (j * lngStep),
        ne_lat: sw_lat + ((i + 1) * latStep),
        ne_lng: sw_lng + ((j + 1) * lngStep),
      });
    }
  }
  
  return subAreas;
}


async function fetchListingsFromArea(
  params: SearchParams,
  checkinDate: string,
  checkoutDate: string,
  adults: number,
  itemsOffset: number = 0, 
  zoomLevel: number = 15 
): Promise<AirbnbListing[]> {
  const listings: AirbnbListing[] = [];
  
  
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    console.log(`⏳ Rate limit: ${rateCheck.reason}, انتظار ${rateCheck.waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
  }
  
  
  
  let searchUrl = `https://www.airbnb.com/s/Egypt/homes?ne_lat=${params.ne_lat}&ne_lng=${params.ne_lng}&sw_lat=${params.sw_lat}&sw_lng=${params.sw_lng}&zoom=${zoomLevel}&search_by_map=true&checkin=${checkinDate}&checkout=${checkoutDate}&adults=${adults}`;
  
  if (itemsOffset > 0) {
    searchUrl += `&items_offset=${itemsOffset}`;
  }

  try {
    
    recordRequest();
    
    const htmlResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    
    if (htmlResponse.status === 403 || htmlResponse.status === 429) {
      console.error('⛔ تم اكتشاف حظر من Airbnb!');
      activateCooldown(60000); 
      return listings;
    }

    if (htmlResponse.ok) {
      const html = await htmlResponse.text();
      
      
      if (html.includes('g-recaptcha') || html.includes('Please verify you are a human') || html.includes('Access denied')) {
        console.error('⛔ تم اكتشاف captcha أو حظر!');
        activateCooldown(60000); 
        return listings;
      }

      
      const deferredStateMatch = html.match(/<script\s+id="data-deferred-state-0"[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i);
      
      if (deferredStateMatch) {
        try {
          const deferredData = JSON.parse(deferredStateMatch[1]);
          
          const niobeData = deferredData?.niobeMinimalClientData;
          if (Array.isArray(niobeData)) {
            for (const item of niobeData) {
              if (!Array.isArray(item) || item.length < 2) continue;
              
              const queryResult = item[1];
              const searchResults = queryResult?.data?.presentation?.staysSearch?.results?.searchResults || [];
              
              for (const result of searchResults) {
                const listing = extractListingFromSearchResult(result);
                if (listing) {
                  listings.push(listing);
                }
              }
            }
          }
        } catch (e) {
          
        }
      }

      
      if (listings.length === 0) {
        const staySearchPattern = /"__typename"\s*:\s*"StaySearchResult"[\s\S]*?"demandStayListing"\s*:\s*\{[\s\S]*?"id"\s*:\s*"([^"]+)"[\s\S]*?"coordinate"\s*:\s*\{\s*"__typename"\s*:\s*"Coordinate"\s*,\s*"latitude"\s*:\s*([\d.]+)\s*,\s*"longitude"\s*:\s*([\d.]+)/g;
        
        let stayMatch;
        while ((stayMatch = staySearchPattern.exec(html)) !== null) {
          const [, encodedId, lat, lng] = stayMatch;
          
          let id = encodedId;
          try {
            const decoded = Buffer.from(encodedId, 'base64').toString('utf-8');
            const idMatch = decoded.match(/:(\d+)$/);
            if (idMatch) id = idMatch[1];
          } catch {}
          
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lng);
          
          
          const contextStart = Math.max(0, stayMatch.index - 5000);
          const contextEnd = Math.min(html.length, stayMatch.index + 10000);
          const context = html.substring(contextStart, contextEnd);
          
          let name = '';
          const nameMatch = context.match(/"localizedStringWithTranslationPreference"\s*:\s*"([^"]+)"/);
          if (nameMatch) {
            name = nameMatch[1].replace(/\\u[\dA-Fa-f]{4}/g, (match) => 
              String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
            );
          }
          
          
          const price = 0;
          
          let rating = 0;
          let reviewsCount = 0;
          const ratingMatch = context.match(/"avgRatingLocalized"\s*:\s*"([\d.]+)\s*\((\d+)\)"/);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1]);
            reviewsCount = parseInt(ratingMatch[2]);
          }
          
          let bedrooms = 0;
          const bedroomMatch = context.match(/"body"\s*:\s*"(\d+)\s*غرف/);
          if (bedroomMatch) bedrooms = parseInt(bedroomMatch[1]);
          
          let imageUrl = '';
          const imageMatch = context.match(/"picture"\s*:\s*"(https:\/\/a0\.muscache\.com[^"]+)"/);
          if (imageMatch) imageUrl = imageMatch[1];
          
          listings.push({
            id,
            name,
            lat: latNum,
            lng: lngNum,
            price,
            currency: 'EGP',
            bedrooms,
            bathrooms: 0,
            beds: 0,
            guests: 0,
            reviewsCount,
            rating,
            imageUrl,
          });
        }
      }
    }
  } catch (e) {
    console.log('Error fetching area:', e);
    
    activateCooldown();
  }
  
  return listings;
}


interface SearchResult {
  listings: AirbnbListing[];
  metadata: {
    totalRequests: number;
    gridSize: number;
    areaSizeKm: number;
    thoroughness: string;
    fromCache: boolean;
    rateLimitStatus: string;
  };
}


async function searchAirbnbListings(params: SearchParams): Promise<SearchResult> {
  
  const excludeIds = new Set(params.excludeIds || []);
  const searchStrategy = params.searchStrategy || 'normal';
  const isLoadMore = excludeIds.size > 0;
  
  console.log(`🔍 Search strategy: ${searchStrategy}, excluding ${excludeIds.size} existing listings`);
  
  
  const cacheKey = generateCacheKey(params);
  if (!isLoadMore) {
    const cached = resultsCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('✅ استخدام نتائج مخزنة من الـ Cache');
      return {
        listings: cached.listings,
        metadata: {
          ...cached.metadata,
          fromCache: true,
          rateLimitStatus: 'ok',
        }
      };
    }
  }
  
  
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    console.log(`⚠️ Rate limit نشط: ${rateCheck.reason}`);
    await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
  }

  const allListings: Map<string, AirbnbListing> = new Map();
  
  
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(checkIn.getDate() + 3);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1); 
  
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const checkinDate = params.checkin || formatDate(checkIn);
  const checkoutDate = params.checkout || formatDate(checkOut);
  const adults = params.adults || 1;

  
  const latDiff = params.ne_lat - params.sw_lat;
  const lngDiff = params.ne_lng - params.sw_lng;
  const areaSizeKm = Math.sqrt(latDiff * lngDiff) * 111;
  
  
  let gridSize = 1;
  let itemsOffset = 0;
  
  if (isLoadMore) {
    
    if (searchStrategy === 'micro-grid') {
      
      gridSize = Math.min(4, Math.max(2, Math.ceil(areaSizeKm / 2)));
    } else if (searchStrategy === 'offset') {
      
      itemsOffset = excludeIds.size; 
      gridSize = 1;
    } else {
      
      gridSize = 2;
      itemsOffset = Math.floor(excludeIds.size / 20) * 20; 
    }
  } else {
    
    const thoroughness = params.thoroughness || 'normal';
    if (thoroughness === 'fast') {
      gridSize = Math.max(1, Math.ceil(areaSizeKm / 8));
    } else if (thoroughness === 'normal') {
      gridSize = Math.max(1, Math.ceil(areaSizeKm / 5));
    } else if (thoroughness === 'thorough') {
      gridSize = Math.max(1, Math.ceil(areaSizeKm / 3));
    } else if (thoroughness === 'complete') {
      gridSize = Math.max(1, Math.ceil(areaSizeKm / 2));
    }
  }
  
  
  gridSize = Math.min(gridSize, PROTECTION_CONFIG.maxGridSize);
  
  const totalRequests = gridSize * gridSize + 1;
  console.log(`🔍 Area size: ~${areaSizeKm.toFixed(1)}km, grid: ${gridSize}x${gridSize}, offset: ${itemsOffset}`);

  
  const subAreas = divideSearchArea(params, gridSize);
  
  console.log(`📍 Searching ${subAreas.length} sub-areas...`);

  
  
  const zoomLevels = isLoadMore ? [14, 16, 17] : [15];
  
  for (const zoomLevel of zoomLevels) {
    if (rateLimitState.isBlocked) break;
    
    console.log(`🔍 Searching with zoom level ${zoomLevel}...`);

    
    const batchSize = PROTECTION_CONFIG.maxConcurrentRequests;
    for (let i = 0; i < subAreas.length; i += batchSize) {
      const batch = subAreas.slice(i, i + batchSize);
      
      
      if (rateLimitState.isBlocked) {
        console.log('⛔ توقف البحث بسبب الحظر المؤقت');
        break;
      }
      
      const results = await Promise.all(
        batch.map(area => fetchListingsFromArea(area, checkinDate, checkoutDate, adults, itemsOffset, zoomLevel))
      );
      
      for (const listings of results) {
        for (const listing of listings) {
          
          if (listing.lat >= params.sw_lat && listing.lat <= params.ne_lat &&
              listing.lng >= params.sw_lng && listing.lng <= params.ne_lng) {
            
            if (excludeIds.has(listing.id) || excludeIds.has(`airbnb-${listing.id}`)) {
              continue;
            }
            const existing = allListings.get(listing.id);
            if (!existing || (listing.name && !existing.name) || (listing.price && !existing.price)) {
              allListings.set(listing.id, listing);
            }
          }
        }
      }
      
      
      if (i + batchSize < subAreas.length) {
        console.log(`⏳ انتظار ${PROTECTION_CONFIG.delayBetweenBatches / 1000}s قبل الدفعة التالية...`);
        await new Promise(resolve => setTimeout(resolve, PROTECTION_CONFIG.delayBetweenBatches));
      }
    }
    
    
    if (zoomLevels.indexOf(zoomLevel) < zoomLevels.length - 1) {
      await new Promise(resolve => setTimeout(resolve, PROTECTION_CONFIG.delayBetweenBatches));
    }
  }

  
  if (!rateLimitState.isBlocked && (allListings.size < 10 || isLoadMore)) {
    
    const additionalSearches = isLoadMore 
      ? [
          { offset: 20, zoom: 16 },
          { offset: 40, zoom: 17 },
          { offset: 60, zoom: 14 },
        ] 
      : [{ offset: 0, zoom: 15 }];
    
    for (const { offset, zoom } of additionalSearches) {
      if (rateLimitState.isBlocked) break;
      
      console.log(`🔄 Additional search with offset ${offset}, zoom ${zoom}...`);
      await new Promise(resolve => setTimeout(resolve, PROTECTION_CONFIG.delayBetweenBatches));
      
      const additionalListings = await fetchListingsFromArea(params, checkinDate, checkoutDate, adults, offset, zoom);
      let newCount = 0;
      
      for (const listing of additionalListings) {
        if (listing.lat >= params.sw_lat && listing.lat <= params.ne_lat &&
            listing.lng >= params.sw_lng && listing.lng <= params.ne_lng) {
          if (excludeIds.has(listing.id) || excludeIds.has(`airbnb-${listing.id}`)) {
            continue;
          }
          if (!allListings.has(listing.id)) {
            allListings.set(listing.id, listing);
            newCount++;
          }
        }
      }
      
      console.log(`  Found ${newCount} new listings with offset ${offset}, zoom ${zoom}`);
      
      
      if (newCount === 0 && offset > 20) break;
    }
  }

  
  const uniqueListings = Array.from(allListings.values()).filter(
    listing => !excludeIds.has(listing.id) && !excludeIds.has(`airbnb-${listing.id}`)
  );
  
  console.log(`✅ Total NEW unique listings found: ${uniqueListings.length}`);
  
  const result: SearchResult = {
    listings: uniqueListings,
    metadata: {
      totalRequests: subAreas.length + 1,
      gridSize,
      areaSizeKm,
      thoroughness: params.thoroughness || 'normal',
      fromCache: false,
      rateLimitStatus: rateLimitState.isBlocked ? 'blocked' : 'ok',
    }
  };
  
  
  resultsCache.set(cacheKey, {
    listings: uniqueListings,
    timestamp: Date.now(),
    metadata: result.metadata,
  });
  
  
  for (const [key, value] of resultsCache.entries()) {
    if (Date.now() - value.timestamp > CACHE_DURATION * 2) {
      resultsCache.delete(key);
    }
  }
  
  return result;
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    
    const ne_lat = parseFloat(searchParams.get('ne_lat') || '30.063');
    const ne_lng = parseFloat(searchParams.get('ne_lng') || '31.250');
    const sw_lat = parseFloat(searchParams.get('sw_lat') || '30.032');
    const sw_lng = parseFloat(searchParams.get('sw_lng') || '31.219');
    const adults = parseInt(searchParams.get('adults') || '1');
    const checkin = searchParams.get('checkin') || undefined;
    const checkout = searchParams.get('checkout') || undefined;
    const thoroughness = (searchParams.get('thoroughness') as 'fast' | 'normal' | 'thorough' | 'complete') || 'normal';

    console.log('Search params:', { ne_lat, ne_lng, sw_lat, sw_lng, adults, checkin, checkout, thoroughness });

    const result = await searchAirbnbListings({
      ne_lat,
      ne_lng,
      sw_lat,
      sw_lng,
      adults,
      checkin,
      checkout,
      thoroughness,
    });

    return NextResponse.json({
      success: true,
      count: result.listings.length,
      listings: result.listings,
      searchArea: {
        northeast: { lat: ne_lat, lng: ne_lng },
        southwest: { lat: sw_lat, lng: sw_lng },
      },
      metadata: result.metadata,
    });

  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'فشل في البحث عن الشقق', details: String(error) },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { ne_lat, ne_lng, sw_lat, sw_lng, adults, checkin, checkout, thoroughness, excludeIds, searchStrategy } = body;

    if (!ne_lat || !ne_lng || !sw_lat || !sw_lng) {
      return NextResponse.json(
        { error: 'يرجى توفير إحداثيات منطقة البحث (ne_lat, ne_lng, sw_lat, sw_lng)' },
        { status: 400 }
      );
    }

    
    if (rateLimitState.isBlocked && Date.now() >= rateLimitState.blockUntil) {
      rateLimitState.isBlocked = false;
      rateLimitState.requestCount = 0;
      rateLimitState.windowStart = Date.now();
      console.log('✅ تم إعادة تعيين حالة الحظر');
    }

    const result = await searchAirbnbListings({
      ne_lat: parseFloat(ne_lat),
      ne_lng: parseFloat(ne_lng),
      sw_lat: parseFloat(sw_lat),
      sw_lng: parseFloat(sw_lng),
      adults: adults ? parseInt(adults) : undefined,
      checkin,
      checkout,
      thoroughness: thoroughness || 'normal',
      excludeIds: excludeIds || [], 
      searchStrategy: searchStrategy || 'normal',
    });

    return NextResponse.json({
      success: true,
      count: result.listings.length,
      listings: result.listings,
      searchArea: {
        northeast: { lat: ne_lat, lng: ne_lng },
        southwest: { lat: sw_lat, lng: sw_lng },
      },
      metadata: result.metadata,
      isLoadMore: (excludeIds?.length || 0) > 0,
    });

  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'فشل في البحث عن الشقق', details: String(error) },
      { status: 500 }
    );
  }
}


export async function DELETE() {
  rateLimitState.isBlocked = false;
  rateLimitState.requestCount = 0;
  rateLimitState.windowStart = Date.now();
  rateLimitState.lastRequestTime = 0;
  rateLimitState.blockUntil = 0;
  resultsCache.clear();
  
  return NextResponse.json({
    success: true,
    message: 'تم إعادة تعيين حالة الحماية والـ Cache',
  });
}
