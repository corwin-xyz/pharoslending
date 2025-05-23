import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@/hooks/useWallet';
import { useUserData } from '@/hooks/useUserData';
import TokenAmountInput from '@/components/TokenAmountInput';
import TransactionConfirmation from '@/components/TransactionConfirmation';
import { toast } from '@/lib/toast';
import { formatCurrency } from '@/lib/utils';

export default function Lend() {
  const { connected, balance, balanceUSDC, handleLend, handleWithdrawal, getSupplyUSDC, suplyUsdc } = useWallet();
  const { userData, lendFunds, withdrawLending } = useUserData();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeposit, setIsDeposit] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');


  const handleMaxDeposit = () => {
    setDepositAmount(balanceUSDC.toString());
  };

  const handleMaxWithdraw = () => {
    setWithdrawAmount((balance).toString());
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount to deposit");
      return;
    }
    
    if (parseFloat(depositAmount) > balanceUSDC) {
      toast.error("Insufficient balance");
      return;
    }
    
    setIsDeposit(true);
    setIsConfirming(true);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount to withdraw");
      return;
    }
    
    if (parseFloat(withdrawAmount) > userData.lentAmount) {
      toast.error("Insufficient lending balance");
      return;
    }
    
    setIsDeposit(false);
    setIsConfirming(true);
  };

 const confirmTransaction = async () => {
   setIsProcessing(true);

   try {
     if (isDeposit) {
       const amount = parseFloat(depositAmount);

       if (isNaN(amount) || amount <= 0) {
         toast.error('Please enter a valid deposit amount');
         return;
       }

       await handleLend(amount);
       await lendFunds(amount);

       toast.success(`Successfully deposited ${amount} USDC`);
       setDepositAmount('');
     } 
     
     if(!isDeposit) {
       const amount = parseFloat(withdrawAmount);

       if (isNaN(amount) || amount <= 0) {
         toast.error('Please enter a valid withdrawal amount');
         return;
       }

       await handleWithdrawal(amount);

       toast.success(`Successfully withdrawl ${amount} USDC`);
       setWithdrawAmount('');
     }
   } catch (err) {
     console.error('Transaction failed:', err);
     toast.error('Transaction failed or rejected');
   } finally {
     setIsProcessing(false);
     setIsConfirming(false);
   }
 };


  if (!connected) {
    return (
      <div className="container mx-auto max-w-7xl py-10">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>Please connect your wallet to use the lending feature</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isConfirming) {
    const details = isDeposit
      ? [
          { label: "Amount to deposit", value: `${depositAmount} USDC` },
          { label: "Current APY", value: "13.3%" },
          { label: "Base Interest Rate", value: "5.2%" },
          { label: "Restaking Rewards", value: "8.1%" },
        ]
      : [
          { label: "Amount to withdraw", value: `${withdrawAmount} USDC` },
          { label: "Current Balance", value: `${balance.toFixed(2)} USDC` },
          { label: "Total Earnings", value: `${(0)} USDC` }, // Placeholder
        ];

    return (
      <div className="container mx-auto max-w-7xl py-10">
        <TransactionConfirmation
          title={isDeposit ? "Confirm Deposit" : "Confirm Withdrawal"}
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
        <h1 className='text-3xl font-bold tracking-tight'>Lending</h1>

        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Lending Statistics</CardTitle>
              <CardDescription>
                Platform lending data and your position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Your Supplied</p>
                    <p className='text-2xl font-bold'>
                      {balance.toFixed(0)} USDC
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Total Earnings Estimate</p>
                    <p className='text-2xl font-bold'>
                      {(balance*13/200).toFixed(2)} PTT
                    </p>{' '}
                    {/* Placeholder */}
                  </div>
                </div>

                <div className='space-y-1'>
                  <p className='text-sm font-medium'>Current Rates</p>
                  <div className='grid grid-cols-3 gap-2'>
                    <div className='rounded-md bg-accent p-2'>
                      <p className='text-xs text-muted-foreground'>Base APY</p>
                      <p className='text-lg font-bold'>5.2%</p>
                    </div>
                    <div className='rounded-md bg-accent p-2'>
                      <p className='text-xs text-muted-foreground'>Restaking</p>
                      <p className='text-lg font-bold'>8.1%</p>
                    </div>
                    <div className='rounded-md bg-primary/10 p-2'>
                      <p className='text-xs text-primary'>Total APY</p>
                      <p className='text-lg font-bold text-primary'>13.3%</p>
                    </div>
                  </div>
                </div>

                <div className='space-y-1 border-t pt-4'>
                  <p className='text-sm font-medium'>Protocol Overview</p>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Total Supplied
                      </p>
                      <p className='text-lg font-bold'>{suplyUsdc}</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Utilization Rate
                      </p>
                      <p className='text-lg font-bold'>68.5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Lending</CardTitle>
              <CardDescription>Deposit or withdraw USDC</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue='deposit'
                className='w-full'
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='deposit'>Deposit</TabsTrigger>
                  <TabsTrigger value='withdraw'>Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value='deposit' className='pt-4 space-y-4'>
                  <TokenAmountInput
                    value={depositAmount}
                    onChange={setDepositAmount}
                    onMax={handleMaxDeposit}
                    max={balanceUSDC}
                    token='USDC'
                    label='Deposit Amount'
                  />

                  {depositAmount && parseFloat(depositAmount) > 0 && (
                    <div className='rounded-md bg-accent p-3 text-sm'>
                      <p className='font-medium'>Deposit Summary</p>
                      <div className='mt-2 space-y-1'>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Amount</span>
                          <span>{depositAmount} USDC</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Current APY
                          </span>
                          <span>13.3%</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Est. Daily Earnings
                          </span>
                          <span>
                            {(
                              (parseFloat(depositAmount) * 0.133) /
                              365
                            ).toFixed(4)}{' '}
                            USDC
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='withdraw' className='pt-4 space-y-4'>
                  <TokenAmountInput
                    value={withdrawAmount}
                    onChange={setWithdrawAmount}
                    onMax={handleMaxWithdraw}
                    max={balance}
                    token='USDC'
                    label='Withdraw Amount'
                  />

                  {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                    <div className='rounded-md bg-accent p-3 text-sm'>
                      <p className='font-medium'>Withdrawal Summary</p>
                      <div className='mt-2 space-y-1'>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Amount</span>
                          <span>{withdrawAmount} USDC</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Remaining Balance
                          </span>
                          <span>
                            {Math.max(
                              0,
                              userData.lentAmount - parseFloat(withdrawAmount)
                            ).toFixed(2)}{' '}
                            USDC
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Earnings to Date
                          </span>
                          <span>{(0).toFixed(4)} USDC</span> {/* Placeholder */}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className='flex justify-end'>
              {activeTab === 'deposit' ? (
                <Button
                  onClick={handleDeposit}
                  disabled={
                    !depositAmount ||
                    parseFloat(depositAmount) <= 0 ||
                    parseFloat(depositAmount) > balanceUSDC
                  }
                >
                  Deposit USDC
                </Button>
              ) : (
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    isProcessing ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    parseFloat(withdrawAmount) > userData.lentAmount
                  }
                >
                  Withdraw USDC
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How Lending Works</CardTitle>
            <CardDescription>
              Understanding the PTTos Credit lending mechanism
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <div className='h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
                1
              </div>
              <h3 className='font-semibold'>Deposit USDC</h3>
              <p className='text-sm text-muted-foreground'>
                Supply liquidity to the protocol by depositing USDC stablecoins
                into the lending pool.
              </p>
            </div>
            <div className='space-y-2'>
              <div className='h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
                2
              </div>
              <h3 className='font-semibold'>Earn Interest</h3>
              <p className='text-sm text-muted-foreground'>
                Receive interest payments from borrowers based on the current
                supply APY rate.
              </p>
            </div>
            <div className='space-y-2'>
              <div className='h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
                3
              </div>
              <h3 className='font-semibold'>Earn Restaking Rewards</h3>
              <p className='text-sm text-muted-foreground'>
                Get additional yield from the PTT collateral restaking mechanism
                unique to PTTos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
