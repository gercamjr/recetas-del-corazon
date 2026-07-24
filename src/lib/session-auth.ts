import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';

export type SessionUser = {
  id: string;
  username: string;
  name?: string | null;
  role: string;
};

/**
 * Require a signed-in family member for write APIs.
 * Replaces the shared FAMILY_ACCESS_TOKEN gate.
 */
export async function requireSessionUser(): Promise<
  { user: SessionUser; error: null } | { user: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Sign in required to change recipes.' },
        { status: 401 },
      ),
    };
  }

  return {
    user: {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      role: session.user.role,
    },
    error: null,
  };
}
