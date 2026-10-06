import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },

  preview: {
    host: "0.0.0.0",
    port: 4173,
  },

  publicDir: "public",

  plugins: [
    react(),

    {
      name: "react-app-route",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            req.url === "/react" ||
            req.url?.startsWith("/react/")
          ) {
            req.url = "/react.html";
          }

          next();
        });
      },
    },
  ],
});