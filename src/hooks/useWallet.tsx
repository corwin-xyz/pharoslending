
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

interface WalletContextProps {
  address: string;
  isConnected: boolean;
  balance: { PHAR: number; USDP: number };
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Mock wallet data for demonstration purposes
const mockAddress = "0x1234567890123456789012345678901234567890";
const mockInitialBalance = { PHAR: 5, USDP: 1000 };

// Create context
const WalletContext = createContext<WalletContextProps>({} as WalletContextProps);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState({ PHAR: 0, USDP: 0 });

  // Check for saved connection state
  useEffect(() => {
    const savedConnection = localStorage.getItem("pharos_connected");
    if (savedConnection === "true") {
      setAddress(mockAddress);
      setBalance(mockInitialBalance);
      setIsConnected(true);
    }
  }, []);

  // Simulated wallet connection
  const connect = async () => {
    try {
      // In a real app, this would interact with the actual wallet provider
      setAddress(mockAddress);
      setBalance(mockInitialBalance);
      setIsConnected(true);
      localStorage.setItem("pharos_connected", "true");
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  // Disconnect wallet
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
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
