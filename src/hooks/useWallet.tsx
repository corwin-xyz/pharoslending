import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { toast } from '@/lib/toast';
import { contractUSDC } from '../../web3/contractUSDC';
import { contractETH } from '../../web3/contractETH';
import { contractLendBorrow, web3 } from '../../web3/contractLendBorrow';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { walletActivity, contractsData } from '../../web3/resources';
import BN from 'bn.js';

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
  collateralBalance: number;
  borrowed: number;
  loanIsActive: boolean;
  handleDepositCollateral: (amount: number) => Promise<void>;
  handleBorrowed: (amount: number) => Promise<void>;
  handleRepayLoan: () => Promise<void>;
  getSupplyUSDC: () => Promise<void>;
  suplyUsdc: number;
  mintUSDC: (recipientAddress: string, amount: number) => Promise<void>;
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
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [borrowed, setBorrowed] = useState(0);
  const [loanIsActive, setLoanIsActive] = useState(false);
  const [suplyUsdc, setSuplyUsdc] = useState(0);

  // Fetch balances and score on address or connection change
  useEffect(() => {
    if (address) {
      setCurrentAddress(address);
      setConnected(true);
      fetchBalanceUSDC(address);
      fetchBalanceETH(address);
      fetchBalance(address);
      fetchActivityScore();
      getUserCollateral();
      getUserBorrowed();
      getUserStatusLoan();
    }
  }, [
    address,
    isConnected,
    balanceETH,
    balanceUSDC,
    borrowed,
    collateralBalance,
    suplyUsdc,
  ]);

  // Handle account and network change manually
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        const newAddress = accounts[0];
        setCurrentAddress(newAddress);
        setConnected(true);
        fetchBalanceUSDC(newAddress);
        fetchBalanceETH(newAddress);
        fetchBalance(newAddress);
        fetchActivityScore();
        getUserCollateral();
        getUserBorrowed();
        getUserStatusLoan();
        toast.info('Account changed');
        
      }
    };

    const handleChainChanged = (_chainId: string) => {
      toast.info('Network changed');
      if (currentAddress) {
        fetchBalanceUSDC(currentAddress);
        fetchBalanceETH(currentAddress);
        fetchBalance(currentAddress);
        fetchActivityScore();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [
    address,
    isConnected,
    balanceETH,
    balanceUSDC,
    balance,
    collateralBalance,
    borrowed,
    suplyUsdc,
  ]);

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
    } else if (balanceUSDC >= 500) {
      creditScore = 200;
    } else if (balanceUSDC >= 100) {
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
      getUserCollateral();
      getUserBorrowed();
      getSupplyUSDC();
    }
  };

  const disconnect = () => {
    setCurrentAddress('');
    setConnected(false);
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
      fetchBalance(currentAddress);
      fetchBalanceETH(currentAddress);
      fetchBalanceUSDC(currentAddress);
      getSupplyUSDC();

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
      fetchBalance(currentAddress);
      fetchBalanceETH(currentAddress);
      fetchBalanceUSDC(currentAddress);
      getSupplyUSDC();

      toast.success('Withdraw successful');
    } catch (error) {
      toast.error('Failed to withdraw USDC');
    }
  };

  const handleDepositCollateral = async (amount: number) => {
    if (!currentAddress) {
      toast.error('Wallet not connected');
      return;
    }

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    try {
      contractETH.methods
        .approve(contractsData.lendBorrow.address, weiAmount)
        .send({ from: currentAddress });

      await contractLendBorrow.methods
        .deposit(weiAmount)
        .send({ from: currentAddress });
      getUserCollateral();
      toast.success('Deposit collateral successful');
    } catch (error) {
      toast.error('Failed deposit collateral');
    }
  };

  const handleBorrowed = async (amount: number) => {
    if (!currentAddress) {
      toast.error('Wallet not connected');
      return;
    }

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    try {
      await contractUSDC.methods
        .approve(contractsData.lendBorrow.address, weiAmount)
        .send({ from: currentAddress });
      const tx = await contractLendBorrow.methods
        .borrow(weiAmount)
        .send({ from: currentAddress });

      if (tx && tx.status) {
        await getUserBorrowed();
        await getSupplyUSDC();

        toast.success(`Borrow ${amount} USDC successful`);
      } else {
        toast.error('Transaction reverted');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message?.includes('User denied')
          ? 'Transaction cancelled'
          : 'Failed to borrow USDC'
      );
    }
  };

  const handleRepayLoan = async () => {
    if (!currentAddress) {
      toast.error('Wallet not connected');
      return;
    }

    const weiAmount = web3.utils.toWei(borrowed.toString(), 'ether');
    try {
      contractUSDC.methods
        .approve(contractsData.lendBorrow.address, weiAmount)
        .send({ from: currentAddress });
      contractLendBorrow.methods.repayLoan().send({ from: currentAddress });
      getUserCollateral();
      getUserBorrowed();
      getSupplyUSDC();
      toast.success('Deposit collateral successful');
    } catch (error) {
      toast.error('Failed deposit collateral');
    }
  };

  const getUserCollateral = async () => {
    try {
      const loan = await contractLendBorrow.methods
        .loans(currentAddress)
        .call();
      const collateralAmount = loan.collateralAmount;
      const formatted = web3.utils.fromWei(collateralAmount, 'ether');
      setCollateralBalance(Number(formatted));
      console.log('Collateral:', collateralAmount);
    } catch (error) {
      console.error('Failed to fetch loan:', error);
    }
  };

  const getUserBorrowed = async () => {
    try {
      const loan = await contractLendBorrow.methods
        .loans(currentAddress)
        .call();
      const borrowedAmount = loan.borrowedAmount;
      const formatted = web3.utils.fromWei(borrowedAmount, 'ether');
      setBorrowed(Number(formatted));
      console.log('Collateral:', borrowed);
    } catch (error) {
      console.error('Failed to fetch loan:', error);
    }
  };

  const getUserStatusLoan = async () => {
    try {
      const loan = await contractLendBorrow.methods
        .loans(currentAddress)
        .call();
      const status = loan.active;
      setLoanIsActive(status);
      console.log('Status:', status);
    } catch (error) {
      console.error('Failed to fetch loan:', error);
    }
  };

  const getSupplyUSDC = async () => {
    try {
      const rawBalance = await contractUSDC.methods
        .balanceOf(contractsData.lendBorrow.address)
        .call();
      const formatted = web3.utils.fromWei(rawBalance, 'ether'); // jika USDC pakai 18 desimal
      console.log(`USDC in contract: ${formatted}`);
      setSuplyUsdc(Number(formatted));
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
    }
  };

  const mintUSDC = async (recipientAddress, amount) => {
    try {
      const decimals = await contractUSDC.methods.decimals().call();
      const ten = new BN(10);
      const amountInWei = new BN(amount).mul(ten.pow(new BN(decimals)));

      await contractUSDC.methods
        .mint(recipientAddress, amountInWei.toString())
        .send({ from: currentAddress });

      console.log('Minting success');
    } catch (err) {
      console.error('Minting failed:', err);
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
        handleDepositCollateral,
        collateralBalance,
        borrowed,
        loanIsActive,
        handleBorrowed,
        handleRepayLoan,
        getSupplyUSDC,
        suplyUsdc,
        mintUSDC,
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
