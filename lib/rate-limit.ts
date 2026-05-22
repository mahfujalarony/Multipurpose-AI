import { NextResponse } from "next/server";

const WINDOW_MS = 60 * 60 * 1000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getClientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "local";
}

export function enforceRateLimit(request: Request, scope: string, limit: number, cost = 1) {
  const now = Date.now();
  const clientId = getClientId(request);
  const key = `${scope}:${clientId}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: cost, resetAt: now + WINDOW_MS });
    return null;
  }

  if (current.count + cost > limit) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);

    return NextResponse.json(
      {
        error: `Rate limit exceeded. Try again after ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
        limit,
        remaining: 0,
        resetAt: new Date(current.resetAt).toISOString(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(current.resetAt / 1000)),
        },
      },
    );
  }

  current.count += cost;
  buckets.set(key, current);
  return null;
}
