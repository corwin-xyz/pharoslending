import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/hooks/useUserData';
import { Link } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';

interface CreditScoreCardProps {
  className?: string;
}

export default function CreditScoreCard({ className }: CreditScoreCardProps) {
  const { userData } = useUserData();
  const { balanceETH, balanceUSDC, balance, currentAddress, activityScore } =
    useWallet();

  // Calculate the credit score dynamically based on the balance and activity score
  
  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCollateralText = (creditScore: number) => {
    let collateralRatio = 1.0;

    if (creditScore >= 800) {
      collateralRatio = 0;
    } else if (creditScore >= 700) {
      collateralRatio = 0.1;
    } else if (creditScore >= 500) {
      collateralRatio = 0.5;
    } else {
      collateralRatio = 1;
    }

    return `${(collateralRatio * 100).toFixed(0)}% Collateral Required`;
  };


  const shouldShowDepositButton = activityScore < 800; // Show deposit button if credit score is less than 700

  return (
    <Card className={className}>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg'>Credit Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between mb-2'>
          <span className={`text-3xl font-bold ${getScoreColor(activityScore)}`}>
            {activityScore}
          </span>
          <span className='text-sm bg-secondary px-2 py-1 rounded-full'>
            {getCollateralText(activityScore)}
          </span>
        </div>
        <Progress value={(activityScore / 800) * 100} className='h-2 mt-2' />
        <div className='flex justify-between mt-1 text-xs text-muted-foreground'>
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <p className='text-sm text-muted-foreground mt-3'>
          Based on your wallet activity and balance
        </p>

        {/* Display the button only if credit score is less than 700 */}
        {shouldShowDepositButton && (
          <button className='text-base text-white px-5 py-2 rounded-md bg-primary hover:bg-opacity-500 hover:scale-105 transition duration-300 mt-8'>
            <Link to='/deposit' className='text-white'>
              Deposit Collateral
            </Link>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
