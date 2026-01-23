import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace(
            /<title>(.*?)<\/title>/,
            `<title>${env.VITE_APP_NAME || "Twitch Raffle App"}</title>`
          );
        },
      },
    ],
    server: {
      https: {
        key: "./certs/localhost.key",
        cert: "./certs/localhost.crt",
      },
    },
  };
});
