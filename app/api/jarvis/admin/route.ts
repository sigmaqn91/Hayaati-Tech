import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerSession, failedAuditLogs } from '@/lib/jarvisAuth';
import {
  telemetryStats,
  conversationSessions,
  getOwnerProfile,
  updateOwnerProfile,
} from '@/lib/jarvisData';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // If not verified owner, return standard 404 with no hints
  if (!verifyOwnerSession(req)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const profile = getOwnerProfile();

  return NextResponse.json({
    stats: telemetryStats,
    sessions: conversationSessions,
    failedLogs: failedAuditLogs,
    profile,
  });
}

export async function POST(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const body = await req.json();
    const { action, profileData } = body;

    if (action === 'updateProfile' && profileData) {
      const updated = updateOwnerProfile(profileData);
      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === 'toggleRateLimits') {
      const current = getOwnerProfile();
      const updated = updateOwnerProfile({ rateLimitsEnabled: !current.rateLimitsEnabled });
      return NextResponse.json({ success: true, profile: updated });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
