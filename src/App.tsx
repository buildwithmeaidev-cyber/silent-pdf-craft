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
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Guides from "./pages/Guides";
import UseCases from "./pages/UseCases";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Terms from "./pages/legal/Terms";
import Dpa from "./pages/legal/Dpa";
import Security from "./pages/legal/Security";
import Contact from "./pages/legal/Contact";
import Cookies from "./pages/legal/Cookies";

import ToolPage from "./pages/tools/ToolPage";
import NotFound from "./pages/NotFound";
import ProgrammaticPage from "./pages/ProgrammaticPage";

// Resources
import ResourceIndex from "./pages/resources/ResourceIndex";
import ResourceCategoryIndex from "./pages/resources/ResourceCategoryIndex";
import ResourceAssetPage from "./pages/resources/ResourceAssetPage";
import Workflows from "./pages/workflows/Workflows";
import CustomWorkflowBuilder from "./pages/workflows/CustomWorkflowBuilder";
import WorkflowRunner from "./pages/workflows/WorkflowRunner";

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

              <Route path="/privacy" element={<Privacy />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/dpa" element={<Dpa />} />
              <Route path="/security" element={<Security />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookies" element={<Cookies />} />


              {/* Resource Center */}
              <Route path="/resources" element={<ResourceIndex />} />
              <Route path="/resources/:category" element={<ResourceCategoryIndex />} />
              <Route path="/resources/:category/:slug" element={<ResourceAssetPage />} />

              {/* Workflows (must be registered BEFORE the /:slug catch-all) */}
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/custom" element={<CustomWorkflowBuilder />} />
              <Route path="/workflows/run/:id" element={<WorkflowRunner />} />

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
