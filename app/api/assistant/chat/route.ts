import { NextRequest, NextResponse } from 'next/server';
import { POST as handleChatPost } from '@/app/api/chat/route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleChatPost(req);
}
