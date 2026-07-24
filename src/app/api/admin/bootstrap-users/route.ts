import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import dbConnect, { MissingEnvironmentError } from '@/lib/mongodb';
import FamilyUserModel from '@/models/FamilyUser';

type SeedUser = {
  username: string;
  displayName: string;
  password: string;
  role?: 'member' | 'admin';
};

function secretsMatch(candidate: string, expected: string) {
  const a = createHash('sha256').update(candidate).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * One-time (or operator) bootstrap for family accounts.
 * Requires header x-bootstrap-secret matching AUTH_BOOTSTRAP_SECRET.
 * Body: { users: [{ username, displayName, password, role? }] }
 */
export async function POST(request: Request) {
  const expected = process.env.AUTH_BOOTSTRAP_SECRET;
  if (!expected) {
    return NextResponse.json(
      { success: false, error: 'Bootstrap is not configured.' },
      { status: 503 },
    );
  }

  const provided = request.headers.get('x-bootstrap-secret') || '';
  if (!provided || !secretsMatch(provided, expected)) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const users = (body as { users?: SeedUser[] })?.users;
  if (!Array.isArray(users) || users.length === 0) {
    return NextResponse.json({ success: false, error: 'users array required.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const results: Array<{ username: string; id: string }> = [];
    for (const u of users) {
      const username = String(u.username || '').trim().toLowerCase();
      const displayName = String(u.displayName || '').trim();
      const password = String(u.password || '');
      if (username.length < 2 || displayName.length < 1 || password.length < 8) {
        return NextResponse.json(
          { success: false, error: `Invalid user payload for ${username || '(missing)'}` },
          { status: 400 },
        );
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const doc = await FamilyUserModel.findOneAndUpdate(
        { username },
        {
          username,
          displayName,
          passwordHash,
          role: u.role === 'admin' ? 'admin' : 'member',
          active: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      results.push({ username: doc.username, id: String(doc._id) });
    }
    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      return NextResponse.json(
        { success: false, error: 'Database not configured.' },
        { status: 503 },
      );
    }
    console.error('bootstrap users failed', error);
    return NextResponse.json({ success: false, error: 'Bootstrap failed.' }, { status: 500 });
  }
}
