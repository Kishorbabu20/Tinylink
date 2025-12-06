import { NextResponse } from 'next/server';
import { getLinkByCode, updateLinkTitle } from '../../../../../lib/db';
import { fetchPageTitle } from '../../../../../utils/fetchTitle';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { code } = params;
    
    // Get the link
    const link = await getLinkByCode(code);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Fetch the page title
    let pageTitle = null;
    try {
      console.log('Fetching title for existing link:', link.url);
      pageTitle = await fetchPageTitle(link.url);
      console.log('Fetched title:', pageTitle);
    } catch (error) {
      console.error('Error fetching page title:', error);
      return NextResponse.json(
        { error: 'Failed to fetch page title', message: error.message },
        { status: 500 }
      );
    }

    // Update the link with the title
    if (pageTitle) {
      try {
        const updatedLink = await updateLinkTitle(code, pageTitle);
        return NextResponse.json(updatedLink);
      } catch (dbError) {
        console.error('Database error updating title:', dbError);
        // Check if it's a missing column error
        if (dbError.message && dbError.message.includes('Title column does not exist')) {
          return NextResponse.json(
            { 
              error: 'Database schema error', 
              message: 'The title column does not exist in the database. Please run: ALTER TABLE links ADD COLUMN title VARCHAR(500) NULL;',
              code: dbError.code
            },
            { status: 500 }
          );
        }
        throw dbError;
      }
    } else {
      return NextResponse.json(
        { error: 'Could not fetch page title' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating link title:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

