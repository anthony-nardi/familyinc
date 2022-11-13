// Need to transpile typescript from shared workspace
const withTM = require("next-transpile-modules")(["@familyinc/shared"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

module.exports = withTM(nextConfig);
