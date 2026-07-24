import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

const FAMILY_TOKEN_HEADER = 'x-family-token';
const FAMILY_TOKEN_COOKIE = 'family_access_token';

function configuredToken() {
  return process.env.FAMILY_ACCESS_TOKEN || process.env.RDC_WRITE_TOKEN;
}

function cookieToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name !== FAMILY_TOKEN_COOKIE) continue;

    const value = valueParts.join('=');
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return undefined;
}

function tokensMatch(candidate: string, expected: string) {
  const candidateDigest = createHash('sha256').update(candidate).digest();
  const expectedDigest = createHash('sha256').update(expected).digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

export function authorizeWrite(request: Request) {
  const expected = configuredToken();
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Recipe writes are not configured.' },
        { status: 503 },
      );
    }

    console.warn(
      'FAMILY_ACCESS_TOKEN is not configured; allowing write request outside production.',
    );
    return null;
  }

  const candidate = request.headers.get(FAMILY_TOKEN_HEADER) || cookieToken(request);
  if (!candidate || !tokensMatch(candidate, expected)) {
    return NextResponse.json(
      { success: false, error: 'Family access token is required.' },
      { status: 401 },
    );
  }

  return null;
}
