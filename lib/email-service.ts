import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Get base URL for email assets
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
};

// Email templates
const OTP_EMAIL_TEMPLATE = (code: string, name: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز التحقق - مفتاحك</title>
  <style>
    body {
      font-family: 'Dubai', 'Arial', sans-serif;
      background-color: #ead3b9;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #fdf6ee;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(16, 48, 43, 0.1);
    }
    h1 {
      color: #10302b;
      font-size: 24px;
      text-align: center;
      margin-bottom: 16px;
    }
    .greeting {
      color: #10302b;
      font-size: 16px;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .otp-container {
      background: linear-gradient(135deg, #edbf8c 0%, #e0a86e 100%);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #10302b;
      font-family: 'Courier New', monospace;
    }
    .note {
      color: #10302b;
      opacity: 0.7;
      font-size: 14px;
      text-align: center;
      margin-top: 24px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(16, 48, 43, 0.1);
      color: #10302b;
      opacity: 0.5;
      font-size: 12px;
    }
    .expire {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${getBaseUrl()}/logos/logo-dark.png" alt="مفتاحك" style="height:80px;width:auto;display:block;margin:0 auto;" />
    </div>
    
    <h1>رمز التحقق الخاص بك</h1>
    
    <p class="greeting">مرحباً ${name}،</p>
    <p class="greeting">لقد طلبت رمز تحقق لإكمال طلب دراسة الجدوى. الرمز هو:</p>
    
    <div class="otp-container">
      <div class="otp-code">${code}</div>
    </div>
    
    <div class="expire">
      ⏰ هذا الرمز صالح لمدة 10 دقائق فقط
    </div>
    
    <p class="note">
      إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني.
    </p>
    
    <div class="footer">
      <p>© 2026 مفتاحك - جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
`;

// Plain text version
const OTP_EMAIL_TEXT = (code: string, name: string) => `
مرحباً ${name}،

لقد طلبت رمز تحقق لإكمال طلب دراسة الجدوى.

رمز التحقق الخاص بك هو: ${code}

هذا الرمز صالح لمدة 10 دقائق فقط.

إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني.

---
© 2026 مفتاحك - جميع الحقوق محفوظة
`;

export interface SendOTPEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(
  to: string,
  name: string,
  code: string
): Promise<SendOTPEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'مفتاحك <noreply@moftahak.com>',
      to: [to],
      subject: `رمز التحقق: ${code} - مفتاحك`,
      html: OTP_EMAIL_TEMPLATE(code, name),
      text: OTP_EMAIL_TEXT(code, name),
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message || 'فشل إرسال البريد الإلكتروني',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير متوقع',
    };
  }
}

/**
 * Generate random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
