
import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  TrendingUp,
  LineChart,
  PiggyBank,
  ShieldCheck,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';
import CreditScoreCard from '@/components/CreditScoreCard';
import TokenBalanceCard from '@/components/TokenBalanceCard';
import StatsCard from '@/components/StatsCard';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export default function Dashboard() {
  const { userData, refreshUserData } = useUserData();

  // Simulate updating data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserData();
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [refreshUserData]);

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreditScoreCard />
          <TokenBalanceCard />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Link to="/lend" className="flex items-center p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">
                    <PiggyBank size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Lend Funds</h3>
                    <p className="text-xs text-muted-foreground">Earn interest and rewards</p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground" />
                </Link>
                <Link to="/borrow" className="flex items-center p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                    <TrendingUp size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Borrow Funds</h3>
                    <p className="text-xs text-muted-foreground">Get instant liquidity</p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground" />
                </Link>
                <Link to="/history" className="flex items-center p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-3">
                    <History size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">View History</h3>
                    <p className="text-xs text-muted-foreground">Track your activities</p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lending">Lending</TabsTrigger>
            <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Value Locked"
                value={formatCurrency(userData.lendingBalance + userData.collateralAmount)}
                description="All your positions"
                icon={<ShieldCheck />}
              />
              <StatsCard
                title="Credit Score"
                value={userData.creditScore}
                description={`${userData.interactions} interactions`}
                icon={<LineChart />}
              />
              <StatsCard
                title="Total Earnings"
                value={formatCurrency(userData.interestEarned + userData.restakingRewards)}
                trend={{ value: 4.28, isPositive: true }}
                icon={<TrendingUp />}
              />
              <StatsCard
                title="Current APY"
                value={formatPercentage(0.12)}
                description="Combined interest rate"
                icon={<PiggyBank />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Protocol Statistics</CardTitle>
                <CardDescription>
                  Overview of the lending protocol performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Protocol TVL</p>
                    <p className="text-2xl font-bold">{formatCurrency(2450000)}</p>
                    <p className="text-xs text-muted-foreground">
                      +10.5% from last week
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">USDP Supply APY</p>
                    <p className="text-2xl font-bold">5.2%</p>
                    <p className="text-xs text-muted-foreground">
                      Base interest rate
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Restaking APY</p>
                    <p className="text-2xl font-bold">8.1%</p>
                    <p className="text-xs text-muted-foreground">
                      Additional yield from restaking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Lending Position</CardTitle>
                <CardDescription>
                  Current lending activity and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Supplied USDP</p>
                      <p className="text-2xl font-bold">{userData.lendingBalance.toFixed(2)} USDP</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Interest Earned</p>
                      <p className="text-xl font-bold">{userData.interestEarned.toFixed(4)} USDP</p>
                      <p className="text-xs text-muted-foreground">
                        Base interest rate: 5.2% APY
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Restaking Rewards</p>
                      <p className="text-xl font-bold">{userData.restakingRewards.toFixed(4)} USDP</p>
                      <p className="text-xs text-muted-foreground">
                        Restaking yield: 8.1% APY
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total Rewards</p>
                      <p className="text-xl font-bold">{userData.lendingRewards.toFixed(4)} USDP</p>
                      <p className="text-xs text-muted-foreground">
                        Combined APY: 13.3%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Link to="/lend">
                    <Button variant="default">
                      Manage Lending
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrowing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Borrowing Position</CardTitle>
                <CardDescription>
                  Current loan status and collateral
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userData.borrowedAmount > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Borrowed USDP</p>
                        <p className="text-2xl font-bold">{userData.borrowedAmount.toFixed(2)} USDP</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Interest Rate</p>
                        <p className="text-xl font-bold">6.5% APY</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Collateral Deposited</p>
                        <p className="text-xl font-bold">{userData.collateralAmount.toFixed(2)} PHAR</p>
                        <p className="text-xs text-muted-foreground">
                          Collateral Ratio: {(userData.collateralRatio * 100).toFixed(0)}%
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Health Factor</p>
                        <div className="flex items-center">
                          <span className="text-xl font-bold text-green-600">1.85</span>
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                            Safe
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Min safe value: 1.2
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                      <ShieldCheck size={32} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">No Active Loans</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You currently don't have any outstanding loans.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Link to="/borrow">
                    <Button variant="default">
                      {userData.borrowedAmount > 0 ? "Manage Loan" : "Borrow Funds"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
