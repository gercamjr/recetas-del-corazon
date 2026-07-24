import { NextResponse } from 'next/server';
import { requireSessionUser } from '@/lib/session-auth';

/**
 * Authorize recipe/S3 writes via signed-in family session (NextAuth).
 * Shared FAMILY_ACCESS_TOKEN is no longer accepted.
 */
export async function authorizeWrite(_request?: Request) {
  void _request;
  const { error } = await requireSessionUser();
  return error;
}

/** @deprecated Prefer requireSessionUser for author attribution. */
export async function authorizeWriteUser() {
  return requireSessionUser();
}

/** Sync helper kept for tests that only check response shape — prefer async authorizeWrite. */
export function unauthorizedWriteResponse() {
  return NextResponse.json(
    { success: false, error: 'Sign in required to change recipes.' },
    { status: 401 },
  );
}
