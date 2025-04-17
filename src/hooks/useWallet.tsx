import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from '@/lib/toast'; 
import {
  MOCK_WALLET_ADDRESS,
  MOCK_INITIAL_BALANCE,
  WalletBalance, 
} from '@/lib/mockData';

interface WalletContextProps {
  address: string;
  isConnected: boolean;
  balance: WalletBalance; 
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextProps>({} as WalletContextProps);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<WalletBalance>({ PHAR: 0, USDP: 0 }); 

  useEffect(() => {
    const savedConnection = localStorage.getItem("pharos_connected");
    if (savedConnection === "true") {
      setAddress(MOCK_WALLET_ADDRESS);
      setBalance(MOCK_INITIAL_BALANCE);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      setAddress(MOCK_WALLET_ADDRESS);
      setBalance(MOCK_INITIAL_BALANCE);
      setIsConnected(true);
      localStorage.setItem("pharos_connected", "true");
      toast.success("Demo wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting demo wallet:", error);
      toast.error("Failed to connect demo wallet");
    }
  };

  const disconnect = () => {
    setAddress("");
    setBalance({ PHAR: 0, USDP: 0 });
    setIsConnected(false);
    localStorage.removeItem("pharos_connected");
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, balance, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
