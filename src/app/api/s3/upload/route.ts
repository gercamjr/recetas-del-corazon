import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType, recipeId } = await request.json();

    if (!filename || !contentType || !recipeId) {
      return NextResponse.json({ error: 'Missing filename, contentType, or recipeId' }, { status: 400 });
    }

    // Generate a unique key for the S3 object, including the recipe-specific path
    const key = `recipes/${recipeId}/${uuidv4()}-${filename.replace(/\s/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 }); // URL expires in 10 minutes

    return NextResponse.json({ success: true, url, key });

  } catch (error) {
    console.error('Error creating pre-signed URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Could not create pre-signed URL.', details: errorMessage }, { status: 500 });
  }
}
