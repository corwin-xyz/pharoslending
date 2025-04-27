import { faker } from '@faker-js/faker';

// --- Interfaces ---
export interface WalletBalance {
  PHAR: number;
  USDP: number;
}

export interface UserData {
  creditScore: number;
  collateralRatio: number; // e.g., 0.6 means 60% collateral required
  lentAmount: number;
  borrowedAmount: number;
  collateralAmount: number; // Amount of PHAR used as collateral
  transactionHistory: Transaction[];
}

export type TransactionType = 'deposit' | 'withdraw_lend' | 'borrow' | 'repay' | 'add_collateral' | 'remove_collateral';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  token: 'USDP' | 'PHAR';
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

// --- Constants ---
export const MOCK_WALLET_ADDRESS = "0xDemo1234567890AbCdEfGhIjKlMnOpQrStUvWxYz";

export const MOCK_INITIAL_BALANCE: WalletBalance = {
  PHAR: faker.number.float({ min: 5, max: 100, precision: 0.01 }),
  USDP: faker.number.float({ min: 500, max: 10000, precision: 0.01 }),
};

// --- Initial Mock Data ---
const generateInitialTransactions = (count: number): Transaction[] => {
  const types: TransactionType[] = ['deposit', 'withdraw_lend', 'borrow', 'repay', 'add_collateral', 'remove_collateral'];
  const tokens: ('USDP' | 'PHAR')[] = ['USDP', 'PHAR'];
  const history: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(types);
    let token: 'USDP' | 'PHAR';
    let amount: number;

    switch (type) {
      case 'deposit':
      case 'withdraw_lend':
      case 'borrow':
      case 'repay':
        token = 'USDP';
        // amount = faker.number.float({ min: 100, max: 5000, precision: 0.01 });
        break;
      case 'add_collateral':
      case 'remove_collateral':
        token = 'PHAR';
        // amount = faker.number.float({ min: 10, max: 1000, precision: 0.01 });
        break;
    }

    history.push({
      id: faker.string.uuid(),
      type,
      amount,
      token,
      timestamp: faker.date.recent({ days: 90 }),
      status: 'completed',
    });
  }
  // Sort by date, most recent first
  return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const initialHistory = generateInitialTransactions(15);
const initialLentAmount = initialHistory
  .filter(t => t.type === 'deposit' && t.token === 'USDP')
  .reduce((sum, t) => sum + t.amount, 0) - 
  initialHistory
  .filter(t => t.type === 'withdraw_lend' && t.token === 'USDP')
  .reduce((sum, t) => sum + t.amount, 0);

const initialBorrowedAmount = initialHistory
  .filter(t => t.type === 'borrow' && t.token === 'USDP')
  .reduce((sum, t) => sum + t.amount, 0) - 
  initialHistory
  .filter(t => t.type === 'repay' && t.token === 'USDP')
  .reduce((sum, t) => sum + t.amount, 0);

const initialCollateralAmount = initialHistory
  .filter(t => t.type === 'add_collateral' && t.token === 'PHAR')
  .reduce((sum, t) => sum + t.amount, 0) - 
  initialHistory
  .filter(t => t.type === 'remove_collateral' && t.token === 'PHAR')
  .reduce((sum, t) => sum + t.amount, 0);

export const MOCK_INITIAL_USER_DATA: UserData = {
  creditScore: faker.number.int({ min: 350, max: 800 }),
  collateralRatio: faker.number.float({ min: 0.5, max: 0.8, precision: 0.01 }),
  lentAmount: Math.max(0, initialLentAmount), // Ensure non-negative
  borrowedAmount: Math.max(0, initialBorrowedAmount), // Ensure non-negative
  collateralAmount: Math.max(0, initialCollateralAmount), // Ensure non-negative
  transactionHistory: initialHistory,
};

// --- Utility Functions ---

export const generateNewTransaction = (type: TransactionType, amount: number, token: 'USDP' | 'PHAR'): Transaction => {
  return {
    id: faker.string.uuid(),
    type,
    amount,
    token,
    timestamp: new Date(),
    status: 'completed', // Simulate success for demo
  };
};

// --- Mock API Delay ---
export const simulateDelay = (durationMs: number = 1500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, durationMs));
};
