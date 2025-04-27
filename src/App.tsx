
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Lend from "./pages/Lend";
import Borrow from "./pages/Borrow";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { WalletProvider } from "./hooks/useWallet";
import { UserDataProvider } from "./hooks/useUserData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <UserDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/lend' element={<Lend />} />
                <Route path='/borrow' element={<Borrow />} />
                <Route path='/analytics' element={<Analytics />} />
                <Route path='/history' element={<History />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </UserDataProvider>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
