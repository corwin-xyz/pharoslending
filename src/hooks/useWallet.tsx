import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { toast } from '@/lib/toast';
import { MOCK_WALLET_ADDRESS } from '@/lib/mockData';
import { web3, contractUSDC } from '../../web3/contractUSDC';
import { formatUnits } from 'ethers';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

interface WalletContextProps {
  currentAddress: string;
  connected: boolean;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextProps>(
  {} as WalletContextProps
);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useBalance({
    address: address,
  });

  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [connected, setConnected] = useState(false);

  // Update state when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      setCurrentAddress(address);
      setConnected(true);
      toast.success('Wallet connected successfully!');
      // Set balance based on wagmi hook's balance
      setBalance(Number(balanceData?.formatted || 0));
    }
  }, [isConnected, address, balanceData]);

  // Connect to demo wallet
  const connect = async () => {
    try {
      setCurrentAddress(MOCK_WALLET_ADDRESS);
      localStorage.setItem('pharos_connected', 'true');
      toast.success('Demo wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting demo wallet:', error);
      toast.error('Failed to connect demo wallet');
    }
  };

  // Connect to actual wallet
  const connectWallet = async () => {
    if (!isConnected) {
      // Open connection modal if wallet is not connected
      openConnectModal();
    }
    if (isConnected && address) {
      setCurrentAddress(address);
      setConnected(true);
      toast.success('Wallet connected successfully!');
      // Set balance after wallet is connected
      setBalance(Number(balanceData?.formatted || 0));
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setCurrentAddress('');
    setConnected(false);
    localStorage.removeItem('pharos_connected');
    toast.info('Wallet disconnected');
  };

  // Get balance manually (if needed)
  const getBalance = async (address: string) => {
    try {
      const rawBalance = await contractUSDC.balanceOf(address);
      const decimals = await contractUSDC.decimals();
      const balanceInDecimal = formatUnits(rawBalance, decimals);
      setBalance(Number(balanceInDecimal));
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        currentAddress,
        connected: !!currentAddress,
        balance,
        connect,
        disconnect,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
