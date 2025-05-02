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
import { contractETH } from '../../web3/contractETH';
import { contractLendBorrow } from '../../web3/contractLendBorrow';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract } from 'wagmi';
import { log } from 'console';
import { contractsData } from '../../web3/resources';

interface WalletContextProps {
  currentAddress: string;
  connected: boolean;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  connectWallet: () => Promise<void>;
  handleLend: (amount: number) => Promise<void>;
  balanceUSDC: number;
  balanceETH: number;
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
        setCurrentAddress(accounts[0]);
        toast.success('Account changed');
        fetchBalanceUSDC(accounts[0]);
        fetchBalanceETH(accounts[0]);
      });
    } else {
      console.log('MetaMask tidak terdeteksi');
    }

    return () => {
      ethereum?.removeListener('accountsChanged', () => {});
    };
  }, []);

  // Connect to demo wallet
  const fetchBalanceUSDC = async (addr: string) => {
    try {
      const rawBalance = await contractUSDC.methods.getBalance(addr).call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether');
      setBalanceUSDC(Number(formatted));
      console.log('Balance updated:', formatted);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast.error('Failed to fetch balance');
    }
  };

  const fetchBalanceETH = async (addr: string) => {
    try {
      const rawBalance = await contractETH.methods.getBalance(addr).call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether');
      setBalanceETH(Number(formatted));
      console.log('Balance updated:', formatted);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast.error('Failed to fetch balance');
    }
  };
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
      // setConnected(true);
      return;
    }

    if (address && isConnected) {
      setCurrentAddress(address);
      setConnected(true);
      localStorage.setItem('pharos_connected', 'true');
      toast.success('Wallet connected successfully!');

      try {
        const rawBalance = await contractUSDC.methods
          .getBalance(address)
          .call();
        const formatted = web3.utils.fromWei(rawBalance, 'ether');
        setBalanceUSDC(Number(formatted));

        const rawBalance2 = await contractETH.methods
          .getBalance(address)
          .call();
        const formatted2 = web3.utils.fromWei(rawBalance2, 'ether');
        setBalanceETH(Number(formatted2));
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

  const getUSDCBalanceContract = async () => {
    const balance = await contractUSDC.balanceOf(contractsData.lendBorrow.address);
    const formatted = web3.utils.fromWei(balance, 'ether');
    console.log(`USDC in contract: ${formatted}`);
    return formatted;
  }

  const handleLend = async (amount: number) => {
    try {
      if (!currentAddress) {
        toast.error('Wallet not connected');
        return;
      }

      const weiAmount = web3.utils.toWei(amount.toString(), 'mwei'); 

      await contractUSDC.methods
        .approve(contractsData.lendBorrow.address, weiAmount)
        .send({ from: currentAddress });

      await contractLendBorrow.methods
        .lend(weiAmount)
        .send({ from: currentAddress });

      toast.success('Lend successful');
    } catch (error) {
      console.error(error);
      toast.error('Failed to lend USDC');
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
        balanceUSDC,
        balanceETH,
        handleLend,
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
