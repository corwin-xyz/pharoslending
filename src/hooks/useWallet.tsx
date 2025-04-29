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
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useWriteContract, useReadContract } from 'wagmi';
import { log } from 'console';

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
  const { writeContract, isPending, isSuccess } = useWriteContract();


  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSDC, setBalanceUSDC] = useState<number>(0);
  const [balanceETH, setBalanceETH] = useState<number>(0);
  const [balancePharos, setBalancePharos] = useState<number>(0);
  const [connected, setConnected] = useState(false);

  // Update state when wallet is connected
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts) => {
        connectWallet();
        toast.success('Account changed');
        fetchBalance(address)
      });
    } else {
      console.log('MetaMask tidak terdeteksi');
    }

    return () => {
      ethereum?.removeListener('accountsChanged', () => {});
    };
  }, [connected, address, balance]);


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


  const connectWallet = async () => {
    if (!isConnected) {
     openConnectModal();
      setConnected(true);
    }

    if (address && isConnected) {
      setCurrentAddress(address);
      localStorage.setItem('pharos_connected', 'true');
      toast.success('Wallet connected successfully!');

      try {
        const rawBalance = await contractUSDC.methods.getBalance(address).call();
        const formatted = web3.utils.fromWei(rawBalance, 'ether');
        setBalance(Number(formatted));
        console.log('Balance:', formatted);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        toast.error('Failed to fetch balance');
      }
    }
  };


  const disconnect = () => {
    setCurrentAddress('');
    setConnected(false);
    localStorage.removeItem('pharos_connected');
    toast.info('Wallet disconnected');
  };

  const fetchBalance = async (addr: string) => {
    try {
      const rawBalance = await contractUSDC.methods.getBalance(addr).call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether');
      setBalance(Number(formatted));
      console.log('Balance updated:', formatted);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
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
