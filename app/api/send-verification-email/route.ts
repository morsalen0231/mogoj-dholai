import { NextRequest, NextResponse } from "next/server";

type MailerModule = {
  createTransport: (config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) => {
    sendMail: (input: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
    }) => Promise<unknown>;
  };
};

export async function POST(request: NextRequest) {
  const { email, displayName, token } = (await request.json()) as {
    email?: string;
    displayName?: string;
    token?: string;
  };

  if (!email || !token) {
    return NextResponse.json({ message: "email এবং token লাগবে।" }, { status: 400 });
  }

  const verifyUrl = `${request.nextUrl.origin}/verify?token=${encodeURIComponent(token)}`;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM ?? smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return NextResponse.json({
      message: "SMTP config পাওয়া যায়নি। dev mode-এ এই preview link দিয়ে verify করুন।",
      previewUrl: verifyUrl,
    });
  }

  try {
    const importer = Function("return import('nodemailer')") as () => Promise<MailerModule>;
    const nodemailer = await importer();
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: "Verify your email",
      text: `Hello ${displayName ?? "user"}, verify your email: ${verifyUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Email verification</h2>
          <p>Hello ${displayName ?? "user"},</p>
          <p>Verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "verification email পাঠানো হয়েছে।" });
  } catch {
    return NextResponse.json(
      { message: "verification email পাঠানো যায়নি। SMTP বা nodemailer config check করুন।" },
      { status: 500 },
    );
  }
}
