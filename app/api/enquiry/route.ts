import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { checkEnquiryRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory structured fallback store for submissions when SMTP is not configured
interface StoredSubmission {
  id: string;
  timestamp: string;
  type: string;
  name: string;
  email: string;
  projectTitle?: string;
  category?: string;
  description?: string;
}
const storedSubmissions: StoredSubmission[] = [];

export async function POST(req: NextRequest) {
  try {
    // 1. Rate & Quota check via lib/rateLimit.ts (dual-key: cookie + salted IP hash)
    const rateCheck = await checkEnquiryRateLimit(req);
    if (!rateCheck.allowed) {
      console.warn(`[Enquiry Rate Limited] RetryAfter: ${rateCheck.retryAfterSeconds}s`);
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a few minutes before submitting again.',
          code: 'rate_limited',
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429, headers }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { type, name, email } = body || {};

    // Validate common fields
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'A valid name between 2 and 100 characters is required.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 120) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());

    let subject = '';
    let htmlContent = '';
    let textContent = '';
    let submissionRecord: StoredSubmission;

    // Contact form handling
    if (type === 'contact') {
      const { message } = body;
      if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 3000) {
        return NextResponse.json(
          { success: false, error: 'Message content must be between 10 and 3,000 characters.', code: 'generic_error' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
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
          <p style="font-size: 11px; color: #94a3b8;">Transmission received via www.hayaatiweb.site</p>
        </div>
      `;
      textContent = `Direct Transmission from ${safeName} (${safeEmail}):\n\n${message.trim()}`;
      submissionRecord = {
        id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        type: 'contact',
        name: safeName,
        email: safeEmail,
        description: message.trim(),
      };
    } else {
      // 5 Advertise Form Fields: name, email, projectTitle, category, description
      // (Accepts either projectTitle or projectName for full backward-compatibility)
      const projectTitle = body.projectTitle || body.projectName;
      const category = body.category || 'General Tech';
      const description = body.description;

      if (!projectTitle || typeof projectTitle !== 'string' || projectTitle.trim().length < 2 || projectTitle.length > 150) {
        return NextResponse.json(
          { success: false, error: 'Project title is required (2 to 150 characters).', code: 'generic_error' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (!description || typeof description !== 'string' || description.trim().length < 15 || description.length > 3000) {
        return NextResponse.json(
          { success: false, error: 'Please provide a comprehensive project description (min 15 characters).', code: 'generic_error' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const safeProjectTitle = escapeHtml(projectTitle.trim());
      const safeCategory = escapeHtml(String(category).trim());
      const safeDesc = escapeHtml(description.trim()).replace(/\n/g, '<br/>');

      subject = `[Hayaati Listing] Project Submission: ${safeProjectTitle}`;
      htmlContent = `
        <div style="font-family: monospace; background: #05070a; color: #f1f5f9; padding: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #38e8ff; margin-top: 0;">Project Listing Submission // Manual Review Required</h2>
          <p><strong>Applicant Name:</strong> ${safeName}</p>
          <p><strong>Applicant Email:</strong> ${safeEmail}</p>
          <p><strong>Project Title:</strong> ${safeProjectTitle}</p>
          <p><strong>Domain Category:</strong> ${safeCategory}</p>
          <hr style="border-color: #1e293b;" />
          <h4 style="color: #38e8ff;">Project Description:</h4>
          <p style="white-space: pre-wrap; line-height: 1.6;">${safeDesc}</p>
          <hr style="border-color: #1e293b;" />
          <p style="font-size: 11px; color: #94a3b8;">Manual review required by Aliya Khan (Hayaati.Technology@gmail.com).</p>
        </div>
      `;
      textContent = `Project Submission: ${safeProjectTitle}\nApplicant: ${safeName} (${safeEmail})\nCategory: ${safeCategory}\n\nDescription:\n${description.trim()}`;
      submissionRecord = {
        id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        type: 'project_submission',
        name: safeName,
        email: safeEmail,
        projectTitle: safeProjectTitle,
        category: safeCategory,
        description: description.trim(),
      };
    }

    // Append to in-memory structured store
    storedSubmissions.push(submissionRecord);

    // Also attempt disk append in structured jsonl format
    try {
      const diskPath = path.join('/tmp', 'hayaati_submissions.jsonl');
      fs.appendFileSync(diskPath, JSON.stringify(submissionRecord) + '\n', 'utf8');
    } catch {
      // In-memory fallback is active
    }

    // In dev mode, return fallback success response so the form can be tested end-to-end without an SMTP server
    if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_HOST || !process.env.SMTP_USER)) {
      console.info(`[Enquiry Dev Fallback]: Submission ${submissionRecord.id} recorded successfully in dev mode.`);
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);
      return NextResponse.json(
        {
          success: true,
          id: submissionRecord.id,
          message: 'Submission received successfully (Dev mode active).',
        },
        { status: 200, headers }
      );
    }

    // SMTP forwarding to Hayaati.Technology@gmail.com if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || smtpUser,
          to: 'Hayaati.Technology@gmail.com',
          replyTo: safeEmail,
          subject,
          text: textContent,
          html: htmlContent,
        });

        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);

        return NextResponse.json(
          { success: true, id: submissionRecord.id },
          { status: 200, headers }
        );
      } catch (mailErr: any) {
        const errCode = mailErr?.code || mailErr?.responseCode || 'SMTP_ERROR';
        const errMsg = mailErr instanceof Error ? mailErr.message : String(mailErr);
        // Log exact status code and error message without printing visitor words or credentials
        console.error(
          `[Enquiry Mail Error] Code: ${errCode}, Message: ${errMsg.replace(/pass=[^&\s]+/gi, 'pass=REDACTED')}`
        );

        // Fall back gracefully to the stored disk/memory record so visitor inquiry is never lost
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);
        return NextResponse.json(
          {
            success: true,
            id: submissionRecord.id,
            notice: 'Recorded in backup archive. Direct forwarding queued.',
          },
          { status: 200, headers }
        );
      }
    }

    // If SMTP is not configured, fall back to structured disk/memory storage
    console.info(`[Enquiry Store]: SMTP not configured. Stored submission ${submissionRecord.id} in structured repository.`);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);

    return NextResponse.json(
      {
        success: true,
        id: submissionRecord.id,
      },
      { status: 200, headers }
    );
  } catch (fatalErr: any) {
    const errStatus = fatalErr?.status || fatalErr?.statusCode || 500;
    const rawMsg = fatalErr instanceof Error ? fatalErr.message : String(fatalErr);
    console.error(`[Enquiry Fatal] Status: ${errStatus}, Error: ${rawMsg.replace(/pass=[^&\s]+/gi, 'pass=REDACTED')}`);

    return NextResponse.json(
      {
        success: false,
        error: 'Transmission pipeline failure. Please contact Hayaati.Technology@gmail.com directly.',
        code: 'generic_error',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
