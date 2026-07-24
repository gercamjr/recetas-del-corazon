import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authorizeWrite } from '@/lib/write-auth';

type UploadInput = {
  filename: string;
  contentType: string;
  recipeId: string;
};

function validateUploadInput(value: unknown): UploadInput | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;

  const { filename, contentType, recipeId } = value as Record<string, unknown>;
  const normalizedFilename = typeof filename === 'string' ? filename.trim() : '';
  if (
    normalizedFilename.length === 0
    || normalizedFilename.length > 255
    || normalizedFilename.includes('/')
    || normalizedFilename.includes('\\')
    || normalizedFilename === '.'
    || normalizedFilename === '..'
  ) return null;

  if (typeof contentType !== 'string' || !/^image\/(avif|gif|jpeg|png|webp)$/.test(contentType)) {
    return null;
  }

  if (typeof recipeId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(recipeId)) return null;

  return { filename: normalizedFilename, contentType, recipeId };
}

export async function POST(request: Request) {
  const authError = await authorizeWrite(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must contain valid JSON.' },
      { status: 400 },
    );
  }

  const input = validateUploadInput(body);
  if (!input) {
    return NextResponse.json(
      { success: false, error: 'Invalid filename, contentType, or recipeId.' },
      { status: 400 },
    );
  }

  const region = process.env.AWS_S3_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    return NextResponse.json(
      { success: false, error: 'Image upload service is not configured.' },
      { status: 503 },
    );
  }

  try {
    const s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    const normalizedFilename = input.filename.trim().replace(/\s+/g, '_');
    const key = `recipes/${input.recipeId}/${uuidv4()}-${normalizedFilename}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: input.contentType,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return NextResponse.json({ success: true, url, key });
  } catch (error) {
    console.error('Error creating pre-signed URL:', error);
    return NextResponse.json(
      { success: false, error: 'Could not create pre-signed URL.' },
      { status: 500 },
    );
  }
}