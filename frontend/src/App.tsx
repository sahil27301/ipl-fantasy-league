import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Auction from "./pages/Auction";
import AuctionStats from "./pages/AuctionStats";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import NotFound from "./pages/NotFound";
import Players from "./pages/Players";
import Scores from "./pages/Scores";
import TeamDetails from "./pages/TeamDetails";
import Teams from "./pages/Teams";

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
          <Route path="/teams/:id" element={<MainLayout><TeamDetails /></MainLayout>} />
          <Route path="/players" element={<MainLayout><Players /></MainLayout>} />
          <Route path="/auction" element={<MainLayout><Auction /></MainLayout>} />
          <Route path="/auction/stats" element={<MainLayout><AuctionStats /></MainLayout>} />
          <Route path="/matches" element={<MainLayout><Matches /></MainLayout>} />
          <Route path="/scores" element={<MainLayout><Scores /></MainLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
