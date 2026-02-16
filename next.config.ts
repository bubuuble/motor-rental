import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tskxhicmotmtbjghmrwz.supabase.co', // Hostname dari error Anda
        port: '',
        pathname: '/storage/v1/object/public/**', // Mengizinkan semua file di public bucket
      },
    ],
  },
};

export default nextConfig;