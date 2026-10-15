/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // The shared workspace is plain TypeScript, so Next must compile it.
  transpilePackages: ["@familyinc/shared"],
  // Note: experimental.optimizePackageImports for @mantine/* breaks the
  // production build here: Turbopack ends up with two copies of the Mantine
  // context ("MantineProvider was not found in component tree").
};

module.exports = nextConfig;
