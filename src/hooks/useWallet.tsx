import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { toast } from '@/lib/toast';
import {
  MOCK_WALLET_ADDRESS,
  MOCK_INITIAL_BALANCE,
  WalletBalance,
} from '@/lib/mockData';
import { ad } from 'node_modules/@faker-js/faker/dist/airline-BUL6NtOJ';
import { web3, contractUSDC } from '../../web3/contractUSDC'
import { ethers, formatUnits } from 'ethers';

interface WalletContextProps {
  address: string;
  isConnected: boolean;
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
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const savedConnection = localStorage.getItem('pharos_connected');
    if (savedConnection === 'true') {
      setAddress(MOCK_WALLET_ADDRESS);
      // setBalance(MOCK_INITIAL_BALANCE);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      setAddress(MOCK_WALLET_ADDRESS);
      // setBalance(MOCK_INITIAL_BALANCE);
      setIsConnected(true);
      localStorage.setItem('pharos_connected', 'true');
      toast.success('Demo wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting demo wallet:', error);
      toast.error('Failed to connect demo wallet');
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          getBalance(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('pharos_connected', 'true');
          toast.success('Wallet connected successfully!');
          console.log(
            'Wallet already unlocked. Connected account:',
            accounts[0]
          );
        } else {
          console.log('Requesting account access...');
          const requestedAccounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          console.log('Wallet connected. Account:', requestedAccounts[0]);
        }

        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            console.log('Wallet disconnected or locked');
          } else {
            setAddress(accounts[0]);
            toast.success('Account Changed!');
            console.log('Account changed:', accounts[0]);
          }
        });
      } catch (error) {
        if (error.code === 4001) {
          console.log('User rejected the connection request.');
        } else {
          console.error('Error connecting wallet:', error);
        }
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnect = () => {
    setAddress('');
    // setBalance({ PHAR: 0, USDP: 0 });
    setIsConnected(false);
    localStorage.removeItem('pharos_connected');
    toast.info('Wallet disconnected');
  };

    const getBalance = async (address) => {
      const rawBalance = await contractUSDC.balanceOf(address);
      const decimals = await contractUSDC.decimals();

      const balanceInDecimal = formatUnits(rawBalance, decimals);

      setBalance(Number(balanceInDecimal));
    };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
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
