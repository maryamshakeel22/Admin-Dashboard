/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'cdn.sanity.io',
            port: '',
            pathname: '/images/**', // یہاں ** استعمال کرنا ضروری ہے تاکہ تمام تصاویر شامل ہو سکیں۔
          },
        ],
      },
};

export default nextConfig;
