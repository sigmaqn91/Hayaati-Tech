import { NextRequest, NextResponse } from 'next/server';
import { createLogoutCookie } from '@/lib/jarvisAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  const logoutCookie = createLogoutCookie();
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Set-Cookie': logoutCookie,
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Owner session terminated. Security protocols re-engaged.',
      isOwner: false,
    },
    { status: 200, headers }
  );
}
