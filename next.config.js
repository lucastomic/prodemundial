/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @libsql/client carga un binario nativo para ficheros locales; mantenerlo
    // externo al bundle del servidor evita problemas de empaquetado.
    serverComponentsExternalPackages: ["@libsql/client", "libsql"],
  },
};

module.exports = nextConfig;
