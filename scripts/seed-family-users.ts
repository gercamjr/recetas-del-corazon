/**
 * Seed family members into MongoDB.
 *
 * Env:
 *   MONGODB_URI (required)
 *   FAMILY_SEED_USERS — JSON array:
 *     [{"username":"abuela","displayName":"Abuela","password":"...","role":"admin"}]
 *
 * Usage:
 *   FAMILY_SEED_USERS='[...]' npx tsx scripts/seed-family-users.ts
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

type SeedUser = {
  username: string;
  displayName: string;
  password: string;
  role?: 'member' | 'admin';
};

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

const raw = process.env.FAMILY_SEED_USERS;
if (!raw) {
  console.error('FAMILY_SEED_USERS JSON array is required');
  process.exit(1);
}

let users: SeedUser[];
try {
  users = JSON.parse(raw) as SeedUser[];
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('empty');
  }
} catch {
  console.error('FAMILY_SEED_USERS must be a non-empty JSON array');
  process.exit(1);
}

const FamilyUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const FamilyUser =
  mongoose.models.FamilyUser || mongoose.model('FamilyUser', FamilyUserSchema);

async function main() {
  await mongoose.connect(uri!);
  for (const u of users) {
    const username = u.username.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(u.password, 12);
    const doc = await FamilyUser.findOneAndUpdate(
      { username },
      {
        username,
        displayName: u.displayName.trim(),
        passwordHash,
        role: u.role === 'admin' ? 'admin' : 'member',
        active: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`upserted ${doc.username} (${doc.role}) id=${doc._id}`);
  }
  await mongoose.disconnect();
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
