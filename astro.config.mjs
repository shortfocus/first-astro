// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },

  vite: {
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

  integrations: [react()],
});