import { NextResponse } from 'next/server';
import { getLinkByCode } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDbHost: !!process.env.DB_HOST,
    hasDbUser: !!process.env.DB_USER,
    hasDbName: !!process.env.DB_NAME,
    databaseConfig: {
      hasUrl: !!process.env.DATABASE_URL,
      hasIndividualVars: !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME),
    },
    databaseTest: null,
    error: null,
  };

  // Test database connection
  try {
    // Try to query a simple link to test connection
    const testLink = await getLinkByCode('test-code-that-does-not-exist');
    diagnostics.databaseTest = {
      status: 'connected',
      message: 'Database connection successful (test query executed)',
    };
  } catch (error) {
    diagnostics.databaseTest = {
      status: 'failed',
      message: error.message,
      error: error.toString(),
    };
    diagnostics.error = error.message;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}

