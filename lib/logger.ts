/**
 * Logger utility - يخفي logs حساسة في production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // في Production: فقط رسالة عامة بدون تفاصيل حساسة
      console.error(`[ERROR] ${message}`);
      // يمكن إرسال للـ monitoring service هنا (Sentry, LogRocket, etc.)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};
