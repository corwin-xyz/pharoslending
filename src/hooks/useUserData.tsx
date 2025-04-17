import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { toast } from '@/lib/toast';
import {
  UserData as MockUserData, 
  Transaction,
  TransactionType,
  MOCK_INITIAL_USER_DATA,
  generateNewTransaction,
  simulateDelay,
} from '@/lib/mockData';

interface UserDataContextProps {
  userData: MockUserData;
  isLoading: boolean; 
  refreshUserData: () => void;
  lendFunds: (amount: number) => Promise<boolean>; 
  borrowFunds: (amount: number, requiredCollateral: number) => Promise<boolean>;
  repayLoan: (amount: number) => Promise<boolean>;
  withdrawLending: (amount: number) => Promise<boolean>;
  addCollateral: (amount: number) => Promise<boolean>;
  removeCollateral: (amount: number) => Promise<boolean>;
}

const UserDataContext = createContext<UserDataContextProps>({} as UserDataContextProps);

const loadInitialData = (): MockUserData => {
  const savedData = localStorage.getItem("pharos_user_data_mock");
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      return {
        ...parsedData,
        transactionHistory: parsedData.transactionHistory.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp), 
        })),
      };
    } catch (error) {
      console.error("Failed to parse saved user data:", error);
      localStorage.removeItem("pharos_user_data_mock"); 
    }
  }
  return MOCK_INITIAL_USER_DATA;
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, balance } = useWallet(); 
  const [userData, setUserData] = useState<MockUserData>(loadInitialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isConnected) {
      setUserData(loadInitialData());
    } else {
      setUserData(MOCK_INITIAL_USER_DATA);
      localStorage.removeItem("pharos_user_data_mock"); 
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      localStorage.setItem("pharos_user_data_mock", JSON.stringify(userData));
    }
  }, [userData, isConnected]);

  const refreshUserData = useCallback(() => {
    if (!isConnected) return;
    console.log("Refreshing user data (mock)...");
    toast.info("Refreshing user data...");
    setUserData(loadInitialData());
    toast.success("User data refreshed.");
  }, [isConnected]);

  const handleTransaction = async (
    action: () => Partial<MockUserData>,
    type: TransactionType,
    amount: number,
    token: 'USDP' | 'PHAR'
  ): Promise<boolean> => {
    if (!isConnected || isLoading) return false;

    setIsLoading(true);
    toast.loading("Processing transaction...");

    try {
      await simulateDelay(); 

      const updates = action();
      const newTransaction = generateNewTransaction(type, amount, token);

      setUserData(prev => ({
        ...prev,
        ...updates,
        transactionHistory: [newTransaction, ...prev.transactionHistory],
      }));

      toast.dismiss(); 
      toast.success(`${type.replace('_', ' ')} successful!`);
      setIsLoading(false);
      return true;

    } catch (error: any) {
      console.error(`Error during ${type}:`, error);
      toast.dismiss();
      toast.error(error.message || `Failed to ${type.replace('_', ' ')}.`);
      setIsLoading(false);
      return false;
    }
  };

  const lendFunds = (amount: number) => handleTransaction(
    () => {
      if (amount <= 0) throw new Error("Amount must be positive.");
      if (balance.USDP < amount) throw new Error("Insufficient USDP balance.");
      return { lentAmount: userData.lentAmount + amount };
    },
    'deposit', amount, 'USDP'
  );

  const withdrawLending = (amount: number) => handleTransaction(
    () => {
      if (amount <= 0) throw new Error("Amount must be positive.");
      if (userData.lentAmount < amount) throw new Error("Insufficient lent balance.");
      return { lentAmount: userData.lentAmount - amount };
    },
    'withdraw_lend', amount, 'USDP'
  );

  const borrowFunds = (amount: number, requiredCollateral: number) => handleTransaction(
    () => {
      if (amount <= 0) throw new Error("Amount must be positive.");
      if (balance.PHAR < requiredCollateral) throw new Error("Insufficient PHAR balance for collateral.");
      return {
        borrowedAmount: userData.borrowedAmount + amount,
        collateralAmount: userData.collateralAmount + requiredCollateral,
      };
    },
    'borrow', amount, 'USDP'
  );

  const repayLoan = (amount: number) => handleTransaction(
    () => {
      if (amount <= 0) throw new Error("Amount must be positive.");
      if (balance.USDP < amount) throw new Error("Insufficient USDP balance.");
      const repayAmount = Math.min(amount, userData.borrowedAmount); 
      if (repayAmount <= 0) throw new Error("No loan to repay or invalid amount.");

      const repaidRatio = userData.borrowedAmount > 0 ? repayAmount / userData.borrowedAmount : 0;
      const collateralToReturn = userData.collateralAmount * repaidRatio;

      return {
        borrowedAmount: userData.borrowedAmount - repayAmount,
        collateralAmount: userData.collateralAmount - collateralToReturn,
      };
    },
    'repay', amount, 'USDP'
  );

  const addCollateral = (amount: number) => handleTransaction(
    () => {
      if (amount <= 0) throw new Error("Amount must be positive.");
      if (balance.PHAR < amount) throw new Error("Insufficient PHAR balance.");
      return { collateralAmount: userData.collateralAmount + amount };
    },
    'add_collateral', amount, 'PHAR'
  );

  const removeCollateral = (amount: number) => handleTransaction(
    () => {
      if (amount <= 0) throw new Error("Amount must be positive.");
      if (userData.collateralAmount < amount) throw new Error("Insufficient collateral to remove.");
      const requiredCollateralForLoan = userData.borrowedAmount * userData.collateralRatio; 
      if (userData.collateralAmount - amount < requiredCollateralForLoan) {
        throw new Error("Cannot remove collateral below required minimum for loan.");
      }
      return { collateralAmount: userData.collateralAmount - amount };
    },
    'remove_collateral', amount, 'PHAR'
  );

  return (
    <UserDataContext.Provider
      value={{
        userData,
        isLoading,
        refreshUserData,
        lendFunds,
        borrowFunds,
        repayLoan,
        withdrawLending,
        addCollateral,
        removeCollateral
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
