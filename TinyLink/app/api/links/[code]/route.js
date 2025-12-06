import { NextResponse } from 'next/server';
import { getLinkByCode, deleteLinkByCode } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    const link = await getLinkByCode(code);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { code } = params;
    const deletedLink = await deleteLinkByCode(code);
    if (!deletedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Link deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
