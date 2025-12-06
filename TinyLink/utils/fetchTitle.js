import * as cheerio from 'cheerio';

export async function fetchPageTitle(url) {
  try {
    console.log('Fetching title for URL:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.log('Response not OK:', response.status, response.statusText);
      return null;
    }

    const html = await response.text();
    if (!html || html.length === 0) {
      console.log('Empty HTML response');
      return null;
    }

    const $ = cheerio.load(html);
    
    // Try to get title from various sources
    let title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text() ||
                $('h1').first().text();
    
    // Clean up the title
    if (title) {
      title = title.trim().replace(/\s+/g, ' ');
      // Remove common suffixes like " - YouTube"
      title = title.replace(/\s*-\s*YouTube\s*$/, '');
      title = title.replace(/\s*-\s*YouTube\s*$/, '');
      // Limit length
      if (title.length > 200) {
        title = title.substring(0, 200) + '...';
      }
    }
    
    console.log('Fetched title:', title);
    return title || null;
  } catch (error) {
    console.error('Error fetching page title:', error.message, error.stack);
    return null;
  }
}

