import { NextResponse } from 'next/server';
import { createLink, getAllLinks, getLinkByCode } from '../../../lib/db';
import { generateCode } from '../../../utils/generateCode';
import { fetchPageTitle } from '../../../utils/fetchTitle';

export async function POST(request) {
  try {
    const { url, code } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    let finalCode = code;
    if (!code) {
      // Generate unique code
      let attempts = 0;
      do {
        finalCode = generateCode();
        attempts++;
        if (attempts > 10) {
          return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
        }
      } while (await getLinkByCode(finalCode));
    } else {
      // Check if custom code exists
      const existing = await getLinkByCode(code);
      if (existing) {
        return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
      }
    }

    // Fetch page title asynchronously (don't block the response)
    let pageTitle = null;
    try {
      console.log('Starting to fetch page title for:', url);
      pageTitle = await fetchPageTitle(url);
      console.log('Page title fetched:', pageTitle);
    } catch (error) {
      console.error('Error fetching page title:', error.message, error.stack);
      // Continue without title if fetch fails
    }

    const link = await createLink(finalCode, url, pageTitle);
    console.log('Link created with title:', link.title);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('POST /api/links error:', error);
    // Provide more detailed error information
    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      // Include error code if available (for database errors)
      ...(error.code && { code: error.code }),
      // Include helpful hints based on error message
      hint: error.message.includes('Database configuration not found')
        ? 'Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables'
        : error.message.includes('Table "links" does not exist')
        ? 'Run schema.sql to create the links table'
        : error.message.includes('Failed to connect')
        ? 'Check your database connection settings and ensure the database server is running'
        : 'Check server logs for more details',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error('GET /api/links error:', error);
    // Provide more detailed error information
    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      // Include error code if available (for database errors)
      ...(error.code && { code: error.code }),
      // Include helpful hints based on error message
      hint: error.message.includes('Database configuration not found')
        ? 'Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables'
        : error.message.includes('Table "links" does not exist')
        ? 'Run schema.sql to create the links table'
        : error.message.includes('Failed to connect')
        ? 'Check your database connection settings and ensure the database server is running'
        : 'Check server logs for more details',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
