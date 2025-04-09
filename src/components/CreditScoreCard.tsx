
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/hooks/useUserData';

interface CreditScoreCardProps {
  className?: string;
}

export default function CreditScoreCard({ className }: CreditScoreCardProps) {
  const { userData } = useUserData();
  
  const getScoreColor = (score: number) => {
    if (score >= 700) return "text-green-600";
    if (score >= 500) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getCollateralText = (ratio: number) => {
    return `${(ratio * 100).toFixed(0)}% Collateral Required`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Credit Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-3xl font-bold ${getScoreColor(userData.creditScore)}`}>
            {userData.creditScore}
          </span>
          <span className="text-sm bg-secondary px-2 py-1 rounded-full">
            {getCollateralText(userData.collateralRatio)}
          </span>
        </div>
        <Progress value={(userData.creditScore / 800) * 100} className="h-2 mt-2" />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Based on your wallet activity and balance
        </p>
      </CardContent>
    </Card>
  );
}
