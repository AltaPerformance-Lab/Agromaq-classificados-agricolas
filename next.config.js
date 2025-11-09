/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // --- ADICIONE ESTE BLOCO ---
  // Isso "autoriza" o Next.js a otimizar imagens do Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Permite qualquer imagem da sua conta
      },
    ],
  },
  // --- FIM DO BLOCO ---
};

module.exports = nextConfig;