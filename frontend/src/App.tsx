
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Auction from "./pages/Auction";
import Matches from "./pages/Matches";
import Scores from "./pages/Scores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/teams" element={<MainLayout><Teams /></MainLayout>} />
          <Route path="/players" element={<MainLayout><Players /></MainLayout>} />
          <Route path="/auction" element={<MainLayout><Auction /></MainLayout>} />
          <Route path="/matches" element={<MainLayout><Matches /></MainLayout>} />
          <Route path="/scores" element={<MainLayout><Scores /></MainLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
