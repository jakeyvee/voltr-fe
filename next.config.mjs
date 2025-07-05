/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "*" }],
  },
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Enable WebAssembly experiments
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // Add WASM file handling
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Specific handling for Orca WASM files
    config.module.rules.push({
      test: /orca_whirlpools_core_js_bindings_bg\.wasm$/,
      type: "webassembly/async",
    });

    // Fallback for Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        util: false,
      };
    }

    // Ignore WASM files in SSR for now
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          "@orca-so/whirlpools-core": "commonjs @orca-so/whirlpools-core",
          "@kamino-finance/kliquidity-sdk":
            "commonjs @kamino-finance/kliquidity-sdk",
        },
      ];
    }

    return config;
  },

  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: [
      "@orca-so/whirlpools-core",
      "@kamino-finance/kliquidity-sdk",
      "@kamino-finance/klend-sdk",
    ],
  },

  // Disable server-side rendering for pages that use WASM
  async redirects() {
    return [];
  },
};

export default nextConfig;
