/**
 * Rate limiting utility for authentication attempts
 */

const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_MINUTES: 15,
  STORAGE_KEY_PREFIX: "auth_attempt_",
};

interface RateLimitAttempt {
  timestamp: number;
  count: number;
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number; // milliseconds
} {
  if (typeof window === "undefined") {
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS, resetIn: 0 };
  }

  const key = `${RATE_LIMIT_CONFIG.STORAGE_KEY_PREFIX}${identifier}`;
  const stored = localStorage.getItem(key);
  const now = Date.now();
  const windowMs = RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000;

  let attempt: RateLimitAttempt = { timestamp: now, count: 1 };

  if (stored) {
    const parsed = JSON.parse(stored) as RateLimitAttempt;
    const isExpired = now - parsed.timestamp > windowMs;

    if (isExpired) {
      attempt = { timestamp: now, count: 1 };
    } else {
      attempt = { timestamp: parsed.timestamp, count: parsed.count + 1 };
    }
  }

  localStorage.setItem(key, JSON.stringify(attempt));

  const allowed = attempt.count <= RATE_LIMIT_CONFIG.MAX_ATTEMPTS;
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.MAX_ATTEMPTS - attempt.count);
  const resetIn = Math.max(0, attempt.timestamp + windowMs - now);

  return { allowed, remaining, resetIn };
}

export function resetRateLimit(identifier: string): void {
  if (typeof window === "undefined") return;

  const key = `${RATE_LIMIT_CONFIG.STORAGE_KEY_PREFIX}${identifier}`;
  localStorage.removeItem(key);
}

export function formatResetTime(resetInMs: number): string {
  const seconds = Math.ceil(resetInMs / 1000);
  const minutes = Math.ceil(seconds / 60);

  if (minutes < 1) {
    return `${seconds} সেকেন্ড`;
  }
  return `${minutes} মিনিট`;
}
