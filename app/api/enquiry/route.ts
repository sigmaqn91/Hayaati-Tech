import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting store (IP -> array of timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait 10 minutes before submitting again.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { type, name, email } = body;

    // Validate common fields
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'A valid name between 2 and 100 characters is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 120) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());

    let subject = '';
    let htmlContent = '';

    if (type === 'contact') {
      const { message } = body;
      if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 3000) {
        return NextResponse.json(
          { success: false, error: 'Message content must be between 10 and 3,000 characters.' },
          { status: 400 }
        );
      }
      const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br/>');
      subject = `[Hayaati Contact] Transmission from ${safeName}`;
      htmlContent = `
        <div style="font-family: monospace; background: #05070a; color: #f1f5f9; padding: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #38e8ff; margin-top: 0;">Direct Transmission // Hayaati Web Technology</h2>
          <p><strong>Sender Name:</strong> ${safeName}</p>
          <p><strong>Sender Email:</strong> ${safeEmail}</p>
          <hr style="border-color: #1e293b;" />
          <h4 style="color: #38e8ff;">Message Payload:</h4>
          <p style="white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
          <hr style="border-color: #1e293b;" />
          <p style="font-size: 11px; color: #94a3b8;">Client IP: ${ip} | Received via www.hayaatiweb.site</p>
        </div>
      `;
    } else if (type === 'project_submission') {
      const { projectName, projectLink, category, budget, description } = body;

      if (!projectName || typeof projectName !== 'string' || projectName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'Project name is required.' },
          { status: 400 }
        );
      }

      if (!description || typeof description !== 'string' || description.trim().length < 20) {
        return NextResponse.json(
          { success: false, error: 'Please provide a comprehensive project description (min 20 characters).' },
          { status: 400 }
        );
      }

      const safeProjectName = escapeHtml(projectName.trim());
      const safeProjectLink = projectLink ? escapeHtml(String(projectLink).trim()) : 'None supplied';
      const safeCategory = category ? escapeHtml(String(category).trim()) : 'General Tech';
      const safeBudget = budget ? escapeHtml(String(budget).trim()) : 'Not specified';
      const safeDesc = escapeHtml(description.trim()).replace(/\n/g, '<br/>');

      subject = `[Hayaati Listing] Project Submission: ${safeProjectName}`;
      htmlContent = `
        <div style="font-family: monospace; background: #05070a; color: #f1f5f9; padding: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #38e8ff; margin-top: 0;">Project Listing Submission // Manual Review Required</h2>
          <p><strong>Applicant Name:</strong> ${safeName}</p>
          <p><strong>Applicant Email:</strong> ${safeEmail}</p>
          <p><strong>Project / Organization:</strong> ${safeProjectName}</p>
          <p><strong>Documentation / Live Link:</strong> <a href="${safeProjectLink}" style="color: #38e8ff;">${safeProjectLink}</a></p>
          <p><strong>Domain Category:</strong> ${safeCategory}</p>
          <p><strong>Budget / Tier:</strong> ${safeBudget}</p>
          <hr style="border-color: #1e293b;" />
          <h4 style="color: #38e8ff;">Project Overview:</h4>
          <p style="white-space: pre-wrap; line-height: 1.6;">${safeDesc}</p>
          <hr style="border-color: #1e293b;" />
          <p style="font-size: 11px; color: #94a3b8;">Manual review required by Aliya Khan before public indexing.</p>
        </div>
      `;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid form transmission type.' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Per Section 7: Honest states: sending / sent / failed. Never show a fake "success" screen.
      return NextResponse.json(
        {
          success: false,
          error:
            'Transmission failed: Email delivery service (RESEND_API_KEY) is not yet configured on this server. Please contact Aliya Khan directly at Hayaati.Technology@gmail.com.',
        },
        { status: 503 }
      );
    }

    // Call Resend REST API directly via plain fetch (no extra packages needed)
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hayaati Portal <notifications@hayaatiweb.site>',
        to: ['Hayaati.Technology@gmail.com'],
        reply_to: email.trim(),
        subject,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.message ||
            'Email delivery server rejected packet. Please email Hayaati.Technology@gmail.com directly.',
        },
        { status: 500 }
      );
    }

    const result = await resendResponse.json();
    return NextResponse.json({ success: true, id: result.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server transmission error';
    return NextResponse.json(
      {
        success: false,
        error: `Transmission pipeline failure: ${message}. Please email Hayaati.Technology@gmail.com directly.`,
      },
      { status: 500 }
    );
  }
}
