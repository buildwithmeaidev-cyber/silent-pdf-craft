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
import ToolPage from "./pages/tools/ToolPage";
import NotFound from "./pages/NotFound";

// Custom PDF Tools
import MergePdf from "./pages/tools/MergePDF";
import SplitPdf from "./pages/tools/SplitPDF";
import RemovePagesPDF from "./pages/tools/RemovepagesPDF";
import EditPdf from "./pages/tools/EditPDF";
import CompressPdf from "./pages/tools/CompressPDF";
import ProtectPdf from "./pages/tools/ProtectPDF";
import ReorderPdf from "./pages/tools/ReorderPDF";
import ESignPdf from "./pages/tools/ESignPDF";
import WatermarkPdf from "./pages/tools/WatermarkPDF";
import PhotoToPdf from "./pages/tools/PhotoToPDF";
import ExportPdf from "./pages/tools/ExportPDF";
import PdfToWord from "./pages/tools/PdfToWord";
import WordToPdf from "./pages/tools/WordToPDF";
import AddpagesPdf from "./pages/tools/AddpagesPDF";
import RemovewatermarkPdf from "./pages/tools/RemovewatermarkPDF";
import RotatepagesPdf from "./pages/tools/RotatepagesPDF";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            
            {/* Specific PDF Tool Routes */}
            <Route path="/tools/merge-pdf" element={<MergePdf />} />
            <Route path="/tools/split-pdf" element={<SplitPdf />} />
            <Route path="/tools/remove-pages" element={<RemovePagesPDF />} />
            <Route path="/tools/edit-pdf" element={<EditPdf />} />
            <Route path="/tools/compress-pdf" element={<CompressPdf />} />
            <Route path="/tools/protect-pdf" element={<ProtectPdf />} />
            <Route path="/tools/reorder-pdf" element={<ReorderPdf />} />
            <Route path="/tools/esign-pdf" element={<ESignPdf />} />
            <Route path="/tools/watermark-pdf" element={<WatermarkPdf />} />
            <Route path="/tools/photo-to-pdf" element={<PhotoToPdf />} />
            <Route path="/tools/export-pdf" element={<ExportPdf />} />
            <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
            <Route path="/tools/word-to-pdf" element={<WordToPdf />} />
            
            {/* Fallback Tool Page */}
            <Route path="/tools/:slug" element={<ToolPage />} />
            
            <Route path="/guides" element={<Guides />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
