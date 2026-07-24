import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const s3AssetHostname = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME && process.env.NEXT_PUBLIC_AWS_S3_REGION
  ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com`
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Recipe uploads are stored below `/recipes/`. Use the exact bucket host
      // when deployment variables are available; keep the fallback for builds
      // that render persisted S3 URLs without those variables.
      ...(s3AssetHostname ? [{
        protocol: 'https' as const,
        hostname: s3AssetHostname,
        port: '',
        pathname: '/recipes/**',
      }] : [{
        protocol: 'https' as const,
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/recipes/**',
      }])
    ],
  }
};

export default withNextIntl(nextConfig);
