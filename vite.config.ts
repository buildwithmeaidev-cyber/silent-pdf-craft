import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: isSsrBuild
    ? undefined
    : {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes("/src/content/")) return "content-data";
              if (!id.includes("node_modules")) return;
              if (id.includes("pdfjs-dist")) return "vendor-pdfjs";
              if (id.includes("@cantoo/pdf-lib")) return "vendor-pdflib-enc";
              if (id.includes("pdf-lib")) return "vendor-pdflib";
              if (id.includes("/docx/")) return "vendor-docx";
              if (id.includes("/mammoth/")) return "vendor-mammoth";
              if (id.includes("framer-motion")) return "vendor-motion";
              if (id.includes("lucide-react")) return "vendor-icons";
              if (id.includes("@radix-ui") || id.includes("@dnd-kit") || id.includes("signature_pad")) {
                return "vendor-ui";
              }
              if (
                id.includes("/react/") ||
                id.includes("/react-dom/") ||
                id.includes("react-router") ||
                id.includes("@tanstack/react-query")
              ) {
                return "vendor-react";
              }
            },
          },
        },
      },
}));
