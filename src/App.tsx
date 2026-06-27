import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { SiteLayout } from "@/components/layout/SiteLayout";
import ScrollToTop from "@/components/ScrollToTop";

import AppErrorBoundary from "@/core/AppErrorBoundary";

import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Guides from "./pages/Guides";
import UseCases from "./pages/UseCases";
import Privacy from "./pages/Privacy";
import About from "./pages/About";

import ToolPage from "./pages/tools/ToolPage";
import NotFound from "./pages/NotFound";
import ProgrammaticPage from "./pages/ProgrammaticPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Custom PDF Tools


const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

          <ScrollToTop />

          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Tools />} />



              {/* Tools list */}

              <Route path="/guides" element={<Guides />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/about" element={<About />} />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Programmatic landing pages (root-level slugs) */}
              <Route path="/compress-pdf-for-email" element={<ProgrammaticPage />} />
              <Route path="/compress-pdf-to-1mb" element={<ProgrammaticPage />} />
              <Route path="/compress-pdf-to-500kb" element={<ProgrammaticPage />} />
              <Route path="/compress-pdf-for-resume" element={<ProgrammaticPage />} />
              <Route path="/merge-2-pdfs" element={<ProgrammaticPage />} />
              <Route path="/merge-3-pdfs" element={<ProgrammaticPage />} />
              <Route path="/merge-multiple-pdfs" element={<ProgrammaticPage />} />
              <Route path="/pdf-to-word-online" element={<ProgrammaticPage />} />
              <Route path="/pdf-to-word-for-resume" element={<ProgrammaticPage />} />
              <Route path="/pdf-to-word-with-formatting" element={<ProgrammaticPage />} />
              <Route path="/convert-scanned-pdf-to-word" element={<ProgrammaticPage />} />
              <Route path="/sign-pdf-online" element={<ProgrammaticPage />} />
              <Route path="/sign-contract-pdf" element={<ProgrammaticPage />} />
              <Route path="/watermark-pdf-online" element={<ProgrammaticPage />} />
              <Route path="/add-logo-watermark-pdf" element={<ProgrammaticPage />} />
              
              {/* Dynamic Tool Page (Catch-all for toolsConfig slugs) */}
              <Route path="/:slug" element={<ToolPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
