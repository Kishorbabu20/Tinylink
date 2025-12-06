import { NextResponse } from 'next/server';
import { getLinkByCode, updateLinkClicks } from '../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Extract code from params (Next.js 14 - params is synchronous)
    const { code } = params || {};
    
    if (!code) {
      console.error('No code provided in route params');
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    // Get the link from database
    let link;
    try {
      link = await getLinkByCode(code);
    } catch (dbError) {
      console.error('Database error in getLinkByCode:', dbError);
      // If database connection fails, return 500 instead of 404
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    if (!link) {
      // If link doesn't exist, redirect to 404
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    // Update click count (don't await to make redirect faster)
    updateLinkClicks(code).catch(err => {
      console.error('Error updating click count:', err);
    });
    
    // Validate URL before redirecting
    try {
      new URL(link.url);
    } catch (urlError) {
      console.error('Invalid URL in database:', link.url, urlError);
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    // Redirect to the original URL
    return NextResponse.redirect(link.url);
  } catch (error) {
    console.error('Redirect error:', error);
    console.error('Error stack:', error.stack);
    // On error, redirect to 404
    return NextResponse.redirect(new URL('/not-found', request.url));
  }
}

