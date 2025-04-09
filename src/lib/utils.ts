
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string | undefined): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function calculateCreditScore(interactions: number, balance: number): number {
  // Example: Score = min(800, 300 + (Interaction Count * 10) + (Balance in PHAR * 100))
  return Math.min(800, 300 + (interactions * 10) + (balance * 100));
}

export function getCollateralRatio(creditScore: number): number {
  if (creditScore >= 700) return 1.2; // 120%
  if (creditScore >= 500) return 1.5; // 150%
  return 2; // 200%
}

export function calculateRequiredCollateral(loanAmount: number, collateralRatio: number): number {
  return loanAmount * collateralRatio;
}
