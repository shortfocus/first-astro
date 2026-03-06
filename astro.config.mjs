// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://solidweb.kr", // 실제 배포 도메인으로 변경하세요.
  devToolbar: {
    enabled: false,
  },

  vite: {
    server: {
      headers: {
        // 로컬 개발 시 CSP 완화 (eval·inline 허용) — HMR/인라인 스크립트 오류 방지
        "Content-Security-Policy":
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      },
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
      ],
    },
  },

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "cloudflare",
  }),

  integrations: [react(), sitemap()],
});