
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { calculateCreditScore, getCollateralRatio } from '@/lib/utils';

interface UserData {
  creditScore: number;
  collateralRatio: number;
  interactions: number;
  lendingBalance: number;
  lendingRewards: number;
  borrowedAmount: number;
  collateralAmount: number;
  loanStatus: 'none' | 'active' | 'repaying';
  interestEarned: number;
  restakingRewards: number;
}

interface UserDataContextProps {
  userData: UserData;
  refreshUserData: () => void;
  lendFunds: (amount: number) => void;
  borrowFunds: (amount: number, collateral: number) => void;
  repayLoan: (amount: number) => void;
  withdrawLending: (amount: number) => void;
}

// Create context
const UserDataContext = createContext<UserDataContextProps>({} as UserDataContextProps);

// Mock initial data
const initialUserData: UserData = {
  creditScore: 0,
  collateralRatio: 2,
  interactions: 0,
  lendingBalance: 0,
  lendingRewards: 0,
  borrowedAmount: 0,
  collateralAmount: 0,
  loanStatus: 'none',
  interestEarned: 0,
  restakingRewards: 0,
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, balance } = useWallet();
  const [userData, setUserData] = useState<UserData>(initialUserData);

  // Simulation of loading user data from blockchain
  useEffect(() => {
    if (isConnected) {
      const savedData = localStorage.getItem("pharos_user_data");
      if (savedData) {
        setUserData(JSON.parse(savedData));
      } else {
        // Mock initial data - in a real app this would come from the blockchain
        const interactions = Math.floor(Math.random() * 10);
        const creditScore = calculateCreditScore(interactions, balance.PHAR);
        const collateralRatio = getCollateralRatio(creditScore);
        
        setUserData({
          ...initialUserData,
          interactions,
          creditScore,
          collateralRatio,
        });
      }
    } else {
      setUserData(initialUserData);
    }
  }, [isConnected, balance.PHAR]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem("pharos_user_data", JSON.stringify(userData));
    }
  }, [userData, isConnected]);

  // Refresh user data (simulating blockchain interaction)
  const refreshUserData = () => {
    if (isConnected) {
      const newInteractions = userData.interactions;
      const newCreditScore = calculateCreditScore(newInteractions, balance.PHAR);
      const newCollateralRatio = getCollateralRatio(newCreditScore);
      
      // Update interest and rewards
      const lendingInterest = userData.lendingBalance * 0.05 / 365; // 5% APY
      const restakingReward = userData.collateralAmount * 0.08 / 365; // 8% APY
      
      setUserData(prev => ({
        ...prev,
        creditScore: newCreditScore,
        collateralRatio: newCollateralRatio,
        interestEarned: prev.interestEarned + lendingInterest,
        restakingRewards: prev.restakingRewards + restakingReward,
        lendingRewards: prev.lendingRewards + lendingInterest + restakingReward,
      }));
    }
  };

  // Lend funds to the protocol
  const lendFunds = (amount: number) => {
    if (isConnected) {
      setUserData(prev => ({
        ...prev,
        lendingBalance: prev.lendingBalance + amount,
        interactions: prev.interactions + 1,
      }));
    }
  };

  // Borrow funds from the protocol
  const borrowFunds = (amount: number, collateral: number) => {
    if (isConnected) {
      setUserData(prev => ({
        ...prev,
        borrowedAmount: prev.borrowedAmount + amount,
        collateralAmount: prev.collateralAmount + collateral,
        loanStatus: 'active',
        interactions: prev.interactions + 1,
      }));
    }
  };

  // Repay loan
  const repayLoan = (amount: number) => {
    if (isConnected) {
      const newBorrowedAmount = Math.max(0, userData.borrowedAmount - amount);
      const repaidRatio = amount / userData.borrowedAmount;
      const collateralToReturn = userData.collateralAmount * repaidRatio;
      
      setUserData(prev => ({
        ...prev,
        borrowedAmount: newBorrowedAmount,
        collateralAmount: prev.collateralAmount - collateralToReturn,
        loanStatus: newBorrowedAmount > 0 ? 'repaying' : 'none',
        interactions: prev.interactions + 1,
      }));
    }
  };

  // Withdraw lending
  const withdrawLending = (amount: number) => {
    if (isConnected) {
      setUserData(prev => ({
        ...prev,
        lendingBalance: Math.max(0, prev.lendingBalance - amount),
        interactions: prev.interactions + 1,
      }));
    }
  };

  return (
    <UserDataContext.Provider 
      value={{ 
        userData, 
        refreshUserData, 
        lendFunds, 
        borrowFunds, 
        repayLoan, 
        withdrawLending 
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
