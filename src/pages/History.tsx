
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWallet } from '@/hooks/useWallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, RefreshCw, PiggyBank, MinusCircle } from 'lucide-react';
import { formatAddress } from '@/lib/utils';

// Sample transaction data
const sampleTransactions = [
  {
    id: 'tx1',
    type: 'deposit',
    amount: '100.00',
    token: 'USDP',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'completed'
  },
  {
    id: 'tx2',
    type: 'borrow',
    amount: '50.00',
    token: 'USDP',
    collateral: '60.00',
    collateralToken: 'PHAR',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    hash: '0xabcdef1234567890abcdef1234567890abcdef12',
    status: 'completed'
  },
  {
    id: 'tx3',
    type: 'repay',
    amount: '25.00',
    token: 'USDP',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    hash: '0x7890abcdef1234567890abcdef1234567890abcd',
    status: 'completed'
  },
  {
    id: 'tx4',
    type: 'withdraw',
    amount: '30.00',
    token: 'USDP',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    hash: '0xdef1234567890abcdef1234567890abcdef123456',
    status: 'completed'
  },
  {
    id: 'tx5',
    type: 'reward',
    amount: '0.58',
    token: 'USDP',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    hash: '0x567890abcdef1234567890abcdef1234567890ab',
    status: 'completed'
  },
];

export default function History() {
  const { connected } = useWallet();
  const [transactions] = useState(sampleTransactions);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'withdraw':
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'borrow':
        return <ArrowDown className="h-4 w-4 text-blue-600" />;
      case 'repay':
        return <ArrowUp className="h-4 w-4 text-violet-600" />;
      case 'reward':
        return <PiggyBank className="h-4 w-4 text-yellow-600" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (transaction: any) => {
    switch (transaction.type) {
      case 'deposit':
        return `Deposited ${transaction.amount} ${transaction.token}`;
      case 'withdraw':
        return `Withdrew ${transaction.amount} ${transaction.token}`;
      case 'borrow':
        return `Borrowed ${transaction.amount} ${transaction.token} with ${transaction.collateral} ${transaction.collateralToken} collateral`;
      case 'repay':
        return `Repaid ${transaction.amount} ${transaction.token}`;
      case 'reward':
        return `Claimed ${transaction.amount} ${transaction.token} rewards`;
      default:
        return 'Transaction';
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto max-w-7xl py-10">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            Please connect your wallet to view transaction history.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="lending">Lending</TabsTrigger>
            <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  History of your interactions with the protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium">{getTransactionLabel(tx)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(tx.timestamp)} • 
                              <a 
                                href={`https://explorer.pharos.com/tx/${tx.hash}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="ml-1 text-primary hover:underline"
                              >
                                {formatAddress(tx.hash)}
                              </a>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${tx.type === 'withdraw' || tx.type === 'repay' ? 'text-red-600' : 'text-green-600'}`}>
                            {tx.type === 'withdraw' || tx.type === 'repay' ? '-' : '+'}{tx.amount} {tx.token}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <MinusCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No transactions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lending">
            <Card>
              <CardHeader>
                <CardTitle>Lending Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.filter(tx => tx.type === 'deposit' || tx.type === 'withdraw').length > 0 ? (
                  <div className="space-y-4">
                    {transactions
                      .filter(tx => tx.type === 'deposit' || tx.type === 'withdraw')
                      .map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center">
                            <div className="mr-3 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-medium">{getTransactionLabel(tx)}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(tx.timestamp)} • 
                                <a 
                                  href={`https://explorer.pharos.com/tx/${tx.hash}`} 
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-1 text-primary hover:underline"
                                >
                                  {formatAddress(tx.hash)}
                                </a>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${tx.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                              {tx.type === 'withdraw' ? '-' : '+'}{tx.amount} {tx.token}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <MinusCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No lending transactions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="borrowing">
            <Card>
              <CardHeader>
                <CardTitle>Borrowing Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.filter(tx => tx.type === 'borrow' || tx.type === 'repay').length > 0 ? (
                  <div className="space-y-4">
                    {transactions
                      .filter(tx => tx.type === 'borrow' || tx.type === 'repay')
                      .map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center">
                            <div className="mr-3 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-medium">{getTransactionLabel(tx)}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(tx.timestamp)} • 
                                <a 
                                  href={`https://explorer.pharos.com/tx/${tx.hash}`} 
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-1 text-primary hover:underline"
                                >
                                  {formatAddress(tx.hash)}
                                </a>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${tx.type === 'repay' ? 'text-red-600' : 'text-green-600'}`}>
                              {tx.type === 'repay' ? '-' : '+'}{tx.amount} {tx.token}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <MinusCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No borrowing transactions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Rewards Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.filter(tx => tx.type === 'reward').length > 0 ? (
                  <div className="space-y-4">
                    {transactions
                      .filter(tx => tx.type === 'reward')
                      .map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center">
                            <div className="mr-3 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-medium">{getTransactionLabel(tx)}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(tx.timestamp)} • 
                                <a 
                                  href={`https://explorer.pharos.com/tx/${tx.hash}`} 
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-1 text-primary hover:underline"
                                >
                                  {formatAddress(tx.hash)}
                                </a>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-yellow-600">
                              +{tx.amount} {tx.token}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <MinusCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No reward transactions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
