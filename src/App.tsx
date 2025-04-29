import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Lend from './pages/Lend';
import Borrow from './pages/Borrow';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { WalletProvider } from './hooks/useWallet';
import { UserDataProvider } from './hooks/useUserData';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, lisk, mainnet, sepolia } from 'wagmi/chains';
import { WagmiConfig } from 'wagmi';

// Inisialisasi Query Client
const queryClient = new QueryClient();

// Buat config Wagmi + RainbowKit sekaligus
const config = getDefaultConfig({
  appName: 'Hackaton',
  projectId: '84088d9596a6f6f539cbc05491031ef9',
  chains: [mainnet, sepolia, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      <RainbowKitProvider>
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
      </RainbowKitProvider>
    </WagmiProvider>
  </QueryClientProvider>
);

export default App;
