import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  MAX_MANUSCRIPT_BYTES,
  manuscriptFieldLabels,
  manuscriptThankYou,
} from "@/data/manuscript";
import { site } from "@/data/site";
import {
  formatFileSize,
  isAllowedManuscriptFile,
  sanitizeFilename,
} from "@/lib/manuscriptUpload";
import type { LeadTracking } from "@/lib/tracking";

export const maxDuration = 60;

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "street",
  "city",
  "state",
  "postalCode",
  "country",
  "bookTitle",
  "genre",
  "language",
  "manuscriptStatus",
  "synopsis",
];

const EMAIL_SECTIONS = [
  {
    title: "Personal Details",
    keys: ["firstName", "lastName", "penName", "email", "phone"],
  },
  {
    title: "Address",
    keys: ["street", "city", "state", "postalCode", "country"],
  },
  {
    title: "Book Details",
    keys: [
      "bookTitle",
      "genre",
      "language",
      "wordCount",
      "manuscriptStatus",
      "targetAudience",
      "synopsis",
      "notes",
    ],
  },
];

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseTracking(raw: string): LeadTracking {
  try {
    return raw ? (JSON.parse(raw) as LeadTracking) : {};
  } catch {
    return {};
  }
}

function buildRows(entries: Array<[string, string]>) {
  return entries
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;white-space:pre-wrap;">${escapeHtml(value || "—")}</td></tr>`,
    )
    .join("");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    if (readField(formData, "website")) {
      return NextResponse.json({ ok: true });
    }

    const fields = Object.fromEntries(
      Object.keys(manuscriptFieldLabels).map((key) => [key, readField(formData, key)]),
    );

    const missing = REQUIRED_FIELDS.filter((key) => !fields[key]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    const file = formData.get("manuscript");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Please upload your manuscript." },
        { status: 400 },
      );
    }

    if (!isAllowedManuscriptFile(file)) {
      return NextResponse.json(
        {
          error:
            file.size > MAX_MANUSCRIPT_BYTES
              ? "Please upload a file under 20 MB."
              : "Please upload a PDF, Word, RTF, TXT, or ODT file.",
        },
        { status: 400 },
      );
    }

    const smtpUser = getEnv("SMTP_USER").trim();
    const smtpPass = getEnv("SMTP_PASS").replace(/\s+/g, "");
    const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT ?? "587");
    const leadEmailTo = process.env.LEAD_EMAIL_TO ?? smtpUser;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const tracking = parseTracking(readField(formData, "tracking"));
    const pageUrl = readField(formData, "pageUrl");
    const pageTitle = readField(formData, "pageTitle");
    const authorName = `${fields.firstName} ${fields.lastName}`.trim();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filename = sanitizeFilename(file.name);

    const sectionHtml = EMAIL_SECTIONS.map((section) => {
      const rows = buildRows(
        section.keys.map((key) => [manuscriptFieldLabels[key], fields[key]]),
      );
      return `<h3 style="margin:24px 0 12px;">${section.title}</h3><table style="border-collapse:collapse;width:100%;">${rows}</table>`;
    }).join("");

    const trackingEntries: Array<[string, string]> = [
      ["Manuscript File", `${filename} (${formatFileSize(file.size)})`],
      ["Submitted From", pageUrl],
      ["Page Title", pageTitle],
      ["Form Source", "submit-manuscript"],
      ["UTM Source", tracking.utm_source ?? ""],
      ["UTM Medium", tracking.utm_medium ?? ""],
      ["UTM Campaign", tracking.utm_campaign ?? ""],
      ["Landing Page", tracking.landingPage ?? ""],
      ["Referrer", tracking.referrer ?? ""],
      ["IP Address", ip ?? ""],
      ["User Agent", userAgent ?? ""],
      ["Submitted At", new Date().toISOString()],
    ];
    const trackingRows = buildRows(trackingEntries.filter(([, value]) => value));

    const html = `
      <div style="font-family:Arial,sans-serif;color:#111827;max-width:720px;">
        <h2 style="margin:0 0 16px;">New Manuscript Submission</h2>
        <p style="margin:0 0 8px;"><strong>${escapeHtml(authorName)}</strong> submitted <strong>${escapeHtml(fields.bookTitle)}</strong>.</p>
        ${sectionHtml}
        <h3 style="margin:24px 0 12px;">File &amp; Tracking</h3>
        <table style="border-collapse:collapse;width:100%;">${trackingRows}</table>
      </div>
    `;

    const text = [
      "New Manuscript Submission",
      "",
      `${authorName} submitted ${fields.bookTitle}.`,
      "",
      ...EMAIL_SECTIONS.flatMap((section) => [
        section.title,
        ...section.keys.map(
          (key) => `${manuscriptFieldLabels[key]}: ${fields[key] || "—"}`,
        ),
        "",
      ]),
      `Manuscript File: ${filename} (${formatFileSize(file.size)})`,
      pageUrl ? `Submitted From: ${pageUrl}` : "",
      `Submitted At: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: `"Kindle Book Publishers Manuscripts" <${smtpUser}>`,
      to: leadEmailTo,
      replyTo: fields.email,
      subject: `New Manuscript: ${fields.bookTitle} — ${authorName}`,
      text,
      html,
      attachments: [
        {
          filename,
          content: fileBuffer,
          contentType: file.type || undefined,
        },
      ],
    });

    const firstName = fields.firstName || "there";
    const thankYouText = [
      `Dear ${firstName},`,
      "",
      `Thank you for submitting “${fields.bookTitle}” to Kindle Book Publishers.`,
      "",
      manuscriptThankYou.body,
      "",
      "What happens next:",
      ...manuscriptThankYou.nextSteps.map((step) => `• ${step}`),
      "",
      `If you have any questions, reply to this email or write to ${site.email}.`,
      "",
      "Warmly,",
      "The Kindle Book Publishers Team",
      site.phone,
      site.email,
    ].join("\n");

    const thankYouHtml = `
      <div style="font-family:Arial,sans-serif;color:#111827;max-width:640px;line-height:1.6;">
        <p style="margin:0 0 16px;">Dear ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 16px;">Thank you for submitting <strong>${escapeHtml(fields.bookTitle)}</strong> to Kindle Book Publishers.</p>
        <p style="margin:0 0 16px;">${escapeHtml(manuscriptThankYou.body)}</p>
        <p style="margin:0 0 8px;font-weight:600;">What happens next</p>
        <ul style="margin:0 0 16px;padding-left:18px;">
          ${manuscriptThankYou.nextSteps.map((step) => `<li style="margin:0 0 6px;">${escapeHtml(step)}</li>`).join("")}
        </ul>
        <p style="margin:0 0 16px;">If you have any questions, reply to this email or write to <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>.</p>
        <p style="margin:0;">Warmly,<br/>The Kindle Book Publishers Team<br/>${escapeHtml(site.phone)}<br/>${escapeHtml(site.email)}</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Kindle Book Publishers" <${smtpUser}>`,
        to: fields.email,
        replyTo: site.email,
        subject: manuscriptThankYou.emailSubject,
        text: thankYouText,
        html: thankYouHtml,
      });
    } catch (confirmationError) {
      console.error("Author thank-you email failed:", confirmationError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Manuscript form error:", error);
    return NextResponse.json(
      { error: "Failed to submit manuscript. Please try again later." },
      { status: 500 },
    );
  }
}
