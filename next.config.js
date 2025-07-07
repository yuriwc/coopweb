/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  transpilePackages: ['recharts'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'recharts': 'recharts/es6'
    }
    return config
  },
  experimental: {
    optimizePackageImports: [
      '@heroui/badge',
      '@heroui/breadcrumbs', 
      '@heroui/button',
      '@heroui/calendar',
      '@heroui/card',
      '@heroui/checkbox',
      '@heroui/chip',
      '@heroui/date-input',
      '@heroui/divider',
      '@heroui/drawer',
      '@heroui/dropdown',
      '@heroui/form',
      '@heroui/input',
      '@heroui/link',
      '@heroui/modal',
      '@heroui/navbar',
      '@heroui/pagination',
      '@heroui/progress',
      '@heroui/radio',
      '@heroui/select',
      '@heroui/skeleton',
      '@heroui/spacer',
      '@heroui/spinner',
      '@heroui/switch',
      '@heroui/system',
      '@heroui/table',
      '@heroui/tabs',
      '@heroui/theme',
      '@heroui/toast',
      '@heroui/tooltip',
      '@heroui/user',
      '@iconify/react',
      'framer-motion',
      'date-fns',
      'recharts'
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)