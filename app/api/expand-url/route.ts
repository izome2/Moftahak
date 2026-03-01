import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Follow redirects to get the final URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      },
    });
    
    clearTimeout(timeoutId);

    // The final URL after redirects
    const expandedUrl = response.url;
    
    // Also get the HTML content for more patterns
    const html = await response.text();

    let coordinates = null;
    
    // Pattern 1: /search/lat,lng or /search/lat,+lng (most common for short URLs)
    const searchPattern = /\/search\/(-?\d+\.?\d*),\+?(-?\d+\.?\d*)/;
    const searchMatch = expandedUrl.match(searchPattern);
    if (searchMatch) {
      coordinates = { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };
    }
    
    // Pattern 2: @lat,lng,zoom in URL
    if (!coordinates) {
      const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const atMatch = expandedUrl.match(atPattern);
      if (atMatch) {
        coordinates = { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      }
    }
    
    // Pattern 3: q=lat,lng query param (numeric coordinates only)
    if (!coordinates) {
      const qPattern = /[?&]q=(-?\d+\.?\d*),\+?(-?\d+\.?\d*)(?:&|$)/;
      const qMatch = expandedUrl.match(qPattern);
      if (qMatch) {
        coordinates = { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
      }
    }
    
    // Pattern 4: !3d lat !4d lng in URL data parameters
    if (!coordinates) {
      const dataPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
      const dataMatch = expandedUrl.match(dataPattern);
      if (dataMatch) {
        coordinates = { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
      }
    }

    // Pattern 5: ll=lat,lng query param
    if (!coordinates) {
      const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const llMatch = expandedUrl.match(llPattern);
      if (llMatch) {
        coordinates = { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
      }
    }
    
    // Pattern 5b: Try to decode ftid (Feature ID) to coordinates
    // ftid format: 0x[hex_lng]:0x[hex_lat] where the values are encoded coordinates
    if (!coordinates) {
      const ftidPattern = /ftid=0x([0-9a-f]+):0x([0-9a-f]+)/i;
      const ftidMatch = expandedUrl.match(ftidPattern);
      if (ftidMatch) {
        try {
          // The ftid contains encoded place IDs, not direct coordinates
          // But we can try to extract from the expanded URL's place data
          // For now, we'll need to use Google Places API or alternative approach
          console.log('Found ftid:', ftidMatch[0]);
        } catch {
          // Ignore decode errors
        }
      }
    }
    
    // Pattern 6: Extract from HTML content - look for coordinates in script/meta tags
    if (!coordinates && html) {
      // Format: Look for coordinates after "center" or in data arrays
      // This pattern matches coordinates like [30.0247405,31.2293735] in various contexts
      
      // Pattern 6a: @lat,lng in HTML (most reliable)
      const atInHtmlPattern = /@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/;
      const atInHtmlMatch = html.match(atInHtmlPattern);
      if (atInHtmlMatch) {
        coordinates = { lat: parseFloat(atInHtmlMatch[1]), lng: parseFloat(atInHtmlMatch[2]) };
      }
      
      // Pattern 6b: !3d and !4d in HTML
      if (!coordinates) {
        const data3d4dPattern = /!3d(-?\d+\.\d{4,})!4d(-?\d+\.\d{4,})/;
        const data3d4dMatch = html.match(data3d4dPattern);
        if (data3d4dMatch) {
          coordinates = { lat: parseFloat(data3d4dMatch[1]), lng: parseFloat(data3d4dMatch[2]) };
        }
      }
      
      // Pattern 6c: Look for [null,null,lat,lng] pattern
      if (!coordinates) {
        const jsonCoordsPattern = /\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/;
        const jsonMatch = html.match(jsonCoordsPattern);
        if (jsonMatch) {
          coordinates = { lat: parseFloat(jsonMatch[1]), lng: parseFloat(jsonMatch[2]) };
        }
      }
      
      // Pattern 6d: ,"lat":30.123,"lng":31.456
      if (!coordinates) {
        const latLngPattern = /"lat":\s*(-?\d+\.\d+).*?"lng":\s*(-?\d+\.\d+)/;
        const latLngMatch = html.match(latLngPattern);
        if (latLngMatch) {
          coordinates = { lat: parseFloat(latLngMatch[1]), lng: parseFloat(latLngMatch[2]) };
        }
      }
    }

    return NextResponse.json({ 
      expandedUrl,
      coordinates,
    });
  } catch (error) {
    console.error('Error expanding URL:', error);
    return NextResponse.json({ error: 'Failed to expand URL' }, { status: 500 });
  }
}
