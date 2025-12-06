import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';

export async function GET() {
  try {
    const db = await getConnection();
    const [columns] = await db.execute('DESCRIBE links');
    const hasTitle = columns.some(col => col.Field === 'title');
    
    return NextResponse.json({
      hasTitleColumn: hasTitle,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      hasTitleColumn: false
    }, { status: 500 });
  }
}

