// App.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProjectDetail from "./pages/ProjectDetail";
import BlogPost from "./pages/BlogPost";
import { BlogListPage } from "./pages/BlogListPage";
import { ProjectListPage } from "./pages/ProjectListPage";
import AdminDashboard from "./admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    defaultTheme="dark"          
    storageKey="kiran-portfolio-theme"
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
