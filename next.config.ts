import type {NextConfig} from 'next';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              path.dirname(require.resolve('pdfjs-dist/package.json')),
              'cmaps'
            ),
            to: path.join(process.cwd(), 'public', 'cmaps'),
          },
          {
            from: path.join(
              path.dirname(require.resolve('pdfjs-dist/package.json')),
              'standard_fonts'
            ),
            to: path.join(process.cwd(), 'public', 'standard_fonts'),
          },
        ],
      })
    );
    return config;
  },
};

export default nextConfig;
