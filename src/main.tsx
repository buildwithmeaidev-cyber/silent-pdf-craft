import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { UploadProvider } from "@/context/UploadContext";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <UploadProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UploadProvider>
  </HelmetProvider>
);
