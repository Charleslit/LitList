/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // TODO: Restrict this in production if needed
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  images: {
    domains: [
      "i.pravatar.cc",
      "images.pexels.com",
      "cdn.pixabay.com",
      "lh3.googleusercontent.com",
      "media.kijiji.ca",
      "robohash.org", // Added from remotePatterns
      "googleusercontent.com", // Added from remotePatterns for consistency
    ],
    // remotePatterns are the more modern and flexible approach
    // but since `domains` is already used, I'll consolidate robohash.org here
    // and keep the other remotePatterns.
    // It's generally better to use one or the other if possible.
    // For new entries, remotePatterns is preferred.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robohash.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "googleusercontent.com", // This is broad, consider if specific paths are needed
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.kijiji.ca",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
