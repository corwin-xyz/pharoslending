import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/useWallet';
import { useUserData } from '@/hooks/useUserData';
import TokenAmountInput from '@/components/TokenAmountInput';
import TransactionConfirmation from '@/components/TransactionConfirmation';
import CreditScoreCard from '@/components/CreditScoreCard';
import { toast } from '@/lib/toast';
import { calculateRequiredCollateral } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function Borrow() {
  const {
    connected,
    balance,
    balanceUSDC,
    balanceETH,
    collateralBalance,
    borrowed,
    handleBorrowed,
    handleRepayLoan,
    activityScore,
  } = useWallet();
  const { userData, borrowFunds, repayLoan } = useUserData();

  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [requiredCollateral, setRequiredCollateral] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBorrow, setIsBorrow] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('borrow');

  useEffect(() => {
    if (borrowAmount && parseFloat(borrowAmount) > 0) {
      const collateral = calculateRequiredCollateral(
        parseFloat(borrowAmount),
        1/2000
      );
      setRequiredCollateral(collateral);
    } else {
      setRequiredCollateral(0);
    }
  }, [borrowAmount, userData.collateralRatio]);

  const handleMaxBorrow = () => {
    const maxBorrowable = Math.min(
      collateralBalance / userData.collateralRatio,
      1000
    );
    setBorrowAmount(maxBorrowable.toString());
  };

  const handleMaxRepay = () => {
    const maxRepayable = Math.min(borrowed, balanceUSDC);
    setRepayAmount(borrowed.toString());
  };

  const handleBorrow = () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast.error('Please enter a valid amount to borrow');
      return;
    }

    if (requiredCollateral >= collateralBalance) {
      if (activityScore > 700) {
        setIsBorrow(true);
        setIsConfirming(true);
        return;
      }
      toast.error(
        `Insufficient ETH for collateral. You need ${(requiredCollateral+collateralBalance).toFixed(
          2
        )} ETH`
      );
      return;
    }

    setIsBorrow(true);
    setIsConfirming(true);
  };

  const handleRepay = () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      toast.error('Please enter a valid amount to repay');
      return;
    }

    if (parseFloat(repayAmount) > balanceUSDC) {
      toast.error('Insufficient USDC balance');
      return;
    }

    if (parseFloat(repayAmount) > userData.borrowedAmount) {
      toast.error('Amount exceeds your outstanding loan');
      return;
    }

    setIsBorrow(false);
    setIsConfirming(true);
  };

  const confirmTransaction = async () => {
    setIsProcessing(true);

    try {
      if (isBorrow) {
        await handleBorrowed(Number(borrowAmount));
        await borrowFunds(parseFloat(borrowAmount), requiredCollateral);
        toast.success(`Successfully borrowed ${borrowAmount} USDC`);
        setBorrowAmount('');
      } else {
        await handleRepayLoan();
        await repayLoan(parseFloat(repayAmount));
        toast.success(`Successfully repaid ${repayAmount} USDC`);
        setRepayAmount('');
      }
    } catch (error) {
      toast.error('Transaction failed');
      console.error(error);
    }

    setIsProcessing(false);
    setIsConfirming(false);
  };

  if (!connected) {
    return (
      <div className='container mx-auto max-w-7xl py-10'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>
              Please connect your wallet to use the borrowing feature
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isConfirming) {
    const details = isBorrow
      ? [
          { label: 'Amount to borrow', value: `${borrowAmount} USDC` },
          {
            label: 'Required collateral',
            value: `${requiredCollateral.toFixed(2)} ETH`,
          },
          {
            label: 'Collateral ratio',
            value: `${(userData.collateralRatio * 100).toFixed(0)}%`,
          },
          { label: 'Interest Rate', value: '6.5% APY' },
        ]
      : [
          { label: 'Amount to repay', value: `${repayAmount} USDC` },
          {
            label: 'Remaining debt',
            value: `${(borrowed - parseFloat(repayAmount)).toFixed(2)} USDC`,
          },
          {
            label: 'Collateral to return',
            value: `${(
              (parseFloat(repayAmount) / borrowed) *
              collateralBalance
            ).toFixed(2)} ETH`,
          },
        ];

    return (
      <div className='container mx-auto max-w-7xl py-10'>
        <TransactionConfirmation
          title={isBorrow ? 'Confirm Borrowing' : 'Confirm Repayment'}
          details={details}
          isLoading={isProcessing}
          onConfirm={confirmTransaction}
          onCancel={() => setIsConfirming(false)}
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-7xl'>
      <div className='flex flex-col space-y-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Borrowing</h1>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-6'>
            <CreditScoreCard />

            <Card>
              <CardHeader>
                <CardTitle>Borrowing Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Your Borrowed</p>
                      <p className='text-2xl font-bold'>
                        {borrowed.toFixed(2)} USDC
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Collateral Locked</p>
                      <p className='text-2xl font-bold'>
                        {collateralBalance.toFixed(2)} ETH
                      </p>
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Loan Status</p>
                    {borrowed > 0 ? (
                      <div className='flex items-center'>
                        <span className='rounded-full h-2 w-2 bg-green-500 mr-2'></span>
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className='flex items-center'>
                        <span className='rounded-full h-2 w-2 bg-gray-300 mr-2'></span>
                        <span>No Active Loan</span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2 border-t pt-4'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Interest Rate
                      </span>
                      <span>6.5% APY</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Your Collateralization
                      </span>
                      <span>
                        {userData.borrowedAmount > 0
                          ? `${(
                              (userData.collateralAmount /
                                userData.borrowedAmount) *
                              100
                            ).toFixed(2)}%`
                          : `${(userData.collateralRatio * 100).toFixed(
                              0
                            )}% (Required)`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manage Borrowing</CardTitle>
              <CardDescription>Borrow USDC or repay your loan</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={borrowed > 0 ? 'repay' : 'borrow'}
                className='w-full'
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='borrow'>Borrow</TabsTrigger>
                  <TabsTrigger value='repay' disabled={borrowed <= 0}>
                    Repay
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='borrow' className='pt-4 space-y-4'>
                  <TokenAmountInput
                    value={borrowAmount}
                    onChange={setBorrowAmount}
                    onMax={handleMaxBorrow}
                    token='USDC'
                    label='Borrow Amount'
                    disabled={activityScore < 700 && collateralBalance <=0}
                  />

                  {borrowAmount && parseFloat(borrowAmount) > 0 && (
                    <div className='rounded-md bg-accent p-3 text-sm'>
                      <p className='font-medium'>Borrowing Summary</p>
                      <div className='mt-2 space-y-1'>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Amount</span>
                          <span>{borrowAmount} USDC</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Required Collateral
                          </span>
                          <span>{requiredCollateral.toFixed(2)} ETH</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Collateral Ratio
                          </span>
                          <span>
                            {(userData.collateralRatio * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Interest Rate
                          </span>
                          <span>6.5% APY</span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='repay' className='pt-4 space-y-4'>
                  <TokenAmountInput
                    value={repayAmount}
                    onChange={setRepayAmount}
                    onMax={handleMaxRepay}
                    max={Math.min(borrowed)}
                    token='USDC'
                    label='Repay Amount'
                  />

                  {repayAmount && parseFloat(repayAmount) > 0 && (
                    <div className='rounded-md bg-accent p-3 text-sm'>
                      <p className='font-medium'>Repayment Summary</p>
                      <div className='mt-2 space-y-1'>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Amount to Repay
                          </span>
                          <span>{repayAmount} USDC</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Remaining Debt
                          </span>
                          <span>
                            {Math.max(
                              0,
                              borrowed - parseFloat(repayAmount)
                            ).toFixed(2)}{' '}
                            USDC
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Collateral to Return
                          </span>
                          <span>
                            {(
                              (parseFloat(repayAmount) / borrowed) *
                              collateralBalance
                            ).toFixed(2)}{' '}
                            ETH
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className='flex justify-end'>
              {activeTab === 'repay' ? (
                <Button
                  onClick={handleRepay}
                  disabled={
                    !repayAmount ||
                    parseFloat(repayAmount) <= 0 ||
                    parseFloat(repayAmount) > balanceUSDC ||
                    parseFloat(repayAmount) > borrowed
                  }
                >
                  Repay USDC
                </Button>
              ) : (
                <Button
                  onClick={handleBorrow}
                  disabled={
                    !borrowAmount ||
                    parseFloat(borrowAmount) <= 0 ||
                    (requiredCollateral) > balanceETH*2000
                  }
                >
                  Borrow USDC
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How Borrowing Works</CardTitle>
            <CardDescription>
              Understanding the PTTos Credit borrowing mechanism
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <div className='h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
                1
              </div>
              <h3 className='font-semibold'>Provide Collateral</h3>
              <p className='text-sm text-muted-foreground'>
                Deposit wBTC/ETH tokens as collateral based on your credit score.
                Higher scores require less collateral.
              </p>
            </div>
            <div className='space-y-2'>
              <div className='h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
                2
              </div>
              <h3 className='font-semibold'>Borrow USDC</h3>
              <p className='text-sm text-muted-foreground'>
                Borrow USDC against your collateral. The collateral is restaked
                to earn additional yield.
              </p>
            </div>
            <div className='space-y-2'>
              <div className='h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
                3
              </div>
              <h3 className='font-semibold'>Repay Loan</h3>
              <p className='text-sm text-muted-foreground'>
                Repay your loan at any time to retrieve your collateral.
                Interest is paid on the borrowed amount.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
