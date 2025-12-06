import { NextResponse } from 'next/server';
import { getLinkByCode, updateLinkClicks } from '../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    
    if (!code) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    // Get the link from database
    const link = await getLinkByCode(code);
    
    if (!link) {
      // If link doesn't exist, redirect to 404
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    
    // Update click count (don't await to make redirect faster)
    updateLinkClicks(code).catch(err => {
      console.error('Error updating click count:', err);
    });
    
    // Redirect to the original URL
    return NextResponse.redirect(link.url);
  } catch (error) {
    console.error('Redirect error:', error);
    // On error, redirect to 404
    return NextResponse.redirect(new URL('/not-found', request.url));
  }
}

