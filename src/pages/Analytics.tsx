
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/utils';

// Sample data for charts
const tvlData = [
  { name: 'Jan', value: 1000000 },
  { name: 'Feb', value: 1200000 },
  { name: 'Mar', value: 1150000 },
  { name: 'Apr', value: 1300000 },
  { name: 'May', value: 1450000 },
  { name: 'Jun', value: 1600000 },
  { name: 'Jul', value: 1750000 },
  { name: 'Aug', value: 2000000 },
  { name: 'Sep', value: 2250000 },
  { name: 'Oct', value: 2400000 },
  { name: 'Nov', value: 2450000 },
  { name: 'Dec', value: 2500000 },
];

const utilizationData = [
  { name: 'Jan', value: 62 },
  { name: 'Feb', value: 65 },
  { name: 'Mar', value: 60 },
  { name: 'Apr', value: 63 },
  { name: 'May', value: 68 },
  { name: 'Jun', value: 72 },
  { name: 'Jul', value: 70 },
  { name: 'Aug', value: 69 },
  { name: 'Sep', value: 71 },
  { name: 'Oct', value: 68 },
  { name: 'Nov', value: 67 },
  { name: 'Dec', value: 68 },
];

const ratesData = [
  { name: 'Jan', supplyRate: 4.8, borrowRate: 6.2, restakeRate: 7.9 },
  { name: 'Feb', supplyRate: 4.9, borrowRate: 6.3, restakeRate: 8.0 },
  { name: 'Mar', supplyRate: 5.0, borrowRate: 6.4, restakeRate: 8.0 },
  { name: 'Apr', supplyRate: 5.1, borrowRate: 6.5, restakeRate: 8.1 },
  { name: 'May', supplyRate: 5.2, borrowRate: 6.5, restakeRate: 8.2 },
  { name: 'Jun', supplyRate: 5.2, borrowRate: 6.5, restakeRate: 8.2 },
  { name: 'Jul', supplyRate: 5.2, borrowRate: 6.5, restakeRate: 8.1 },
  { name: 'Aug', supplyRate: 5.1, borrowRate: 6.4, restakeRate: 8.0 },
  { name: 'Sep', supplyRate: 5.1, borrowRate: 6.4, restakeRate: 8.0 },
  { name: 'Oct', supplyRate: 5.2, borrowRate: 6.5, restakeRate: 8.1 },
  { name: 'Nov', supplyRate: 5.2, borrowRate: 6.5, restakeRate: 8.1 },
  { name: 'Dec', supplyRate: 5.2, borrowRate: 6.5, restakeRate: 8.1 },
];

const creditDistributionData = [
  { score: '300-400', users: 15 },
  { score: '400-500', users: 25 },
  { score: '500-600', users: 45 },
  { score: '600-700', users: 65 },
  { score: '700-800', users: 30 },
];

export default function Analytics() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="container mx-auto max-w-7xl py-10">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            Please connect your wallet to view analytics.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Value Locked (TVL)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tvlData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)} 
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utilization Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => `${value}%`} 
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea2e9"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interest Rates Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="supplyRate"
                  name="Supply APY"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="borrowRate"
                  name="Borrow APY"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="restakeRate"
                  name="Restaking APY"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditDistributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip labelFormatter={(label) => `Score Range: ${label}`} />
                <Bar dataKey="users" name="Number of Users" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
