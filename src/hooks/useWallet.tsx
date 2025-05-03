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
import { useAccount } from 'wagmi';
import { walletActivity } from '../../web3/resources';
import { contractsData } from '../../web3/resources';

interface WalletContextProps {
  currentAddress: string;
  connected: boolean;
  balance: number;
  disconnect: () => void;
  connectWallet: () => Promise<void>;
  handleLend: (amount: number) => Promise<void>;
  handleWithdrawal: (amount: number) => Promise<void>;
  balanceUSDC: number;
  balanceETH: number;
  activityScore: number;
}

const WalletContext = createContext<WalletContextProps>(
  {} as WalletContextProps
);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSDC, setBalanceUSDC] = useState<number>(0);
  const [balanceETH, setBalanceETH] = useState<number>(0);
  const [connected, setConnected] = useState(false);
  const [activityScore, setActivityScore] = useState<number>(0);

  // Dynamically fetch all balances and activity score on address change
  useEffect(() => {
    if (address) {
      setCurrentAddress(address);
      fetchBalanceUSDC(address);
      fetchBalanceETH(address);
      fetchBalance(address);
      fetchActivityScore();
    }
  }, [address, isConnected, balanceUSDC, balanceETH]);

  const fetchBalanceUSDC = async (addr: string) => {
    try {
      const rawBalance = await contractUSDC.methods.getBalance(addr).call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether');
      setBalanceUSDC(Number(formatted));
    } catch (error) {
      toast.error('Failed to fetch USDC balance');
    }
  };

  const fetchBalanceETH = async (addr: string) => {
    try {
      const rawBalance = await contractETH.methods.getBalance(addr).call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether');
      setBalanceETH(Number(formatted));
    } catch (error) {
      toast.error('Failed to fetch ETH balance');
    }
  };

  const fetchBalance = async (addr: string) => {
    try {
      const rawBalance = await contractLendBorrow.methods
        .lendersBalance(addr)
        .call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether');
      setBalance(Number(formatted));
    } catch (error) {
      toast.error('Failed to fetch balance');
    }
  };

  const fetchActivityScore = async () => {
    try {
      const balanceScore = await getCreditScore();
      const walletScore = await getActivityScoreByWallet();
      setActivityScore(balanceScore + walletScore);
    } catch (error) {
      toast.error('Failed to fetch activity score');
    }
  };

  const getCreditScore = async (): Promise<number> => {
    let creditScore = 0;

    if (balanceUSDC >= 1000 || balanceETH >= 1) {
      creditScore = 300;
    } else if (balanceUSDC >= 500 && balanceUSDC < 1000) {
      creditScore = 200;
    } else if (balanceUSDC >= 100 && balanceUSDC < 500) {
      creditScore = 100;
    } else {
      creditScore = 50;
    }

    return creditScore;
  };

  const getActivityScoreByWallet = async (): Promise<number> => {
    if (walletActivity.high.includes(currentAddress)) return 500;
    if (walletActivity.medium.includes(currentAddress)) return 250;
    if (walletActivity.low.includes(currentAddress)) return 75;
    return 0;
  };

  const connectWallet = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }

    if (address) {
      setCurrentAddress(address);
      setConnected(true);
      toast.success('Wallet connected successfully!');
      fetchBalanceUSDC(address);
      fetchBalanceETH(address);
      fetchBalance(address);
      fetchActivityScore();
    }
  };

  const disconnect = () => {
    setCurrentAddress('');
    setConnected(false);
    setBalance(0);
    setBalanceUSDC(0);
    setBalanceETH(0);
    setActivityScore(0);
    toast.info('Wallet disconnected');
  };

  const handleLend = async (amount: number) => {
    if (!currentAddress) {
      toast.error('Wallet not connected');
      return;
    }

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    try {
      await contractUSDC.methods
        .approve(contractsData.lendBorrow.address, weiAmount)
        .send({ from: currentAddress });
      await contractLendBorrow.methods
        .lend(weiAmount)
        .send({ from: currentAddress });
      fetchBalance(currentAddress); // Refresh balance after lending
      toast.success('Lend successful');
    } catch (error) {
      toast.error('Failed to lend USDC');
    }
  };

  const handleWithdrawal = async (amount: number) => {
    if (!currentAddress) {
      toast.error('Wallet not connected');
      return;
    }

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    try {
      await contractLendBorrow.methods
        .withdrawLend(weiAmount)
        .send({ from: currentAddress });
      fetchBalance(currentAddress); // Refresh balance after withdrawal
      toast.success('Withdraw successful');
    } catch (error) {
      toast.error('Failed to withdraw USDC');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        currentAddress,
        connected,
        balance,
        connectWallet,
        disconnect,
        handleLend,
        handleWithdrawal,
        balanceUSDC,
        balanceETH,
        activityScore,
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
