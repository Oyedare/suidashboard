import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_DEV);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // When running via Netlify Dev, let Netlify's functions/redirects handle /api
      proxy: isNetlify
        ? undefined
        : {
            "/api": {
              target: "https://spot.api.sui-prod.bluefin.io",
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api/, ""),
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => {
                  const apiKey = env.VITE_COIN_API_KEY;
                  if (apiKey) {
                    proxyReq.setHeader("x-api-key", apiKey);
                  }
                });
              },
            },
          },
    },
  };
});
