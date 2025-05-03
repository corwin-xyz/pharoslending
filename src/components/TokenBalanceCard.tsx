
import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';


interface TokenBalanceCardProps {
  className?: string;
}

export default function TokenBalanceCard({ className }: TokenBalanceCardProps) {
  const { balance, balanceETH, balanceUSDC } = useWallet();

  const ETHtoUSDC = balanceETH*2000;
  const totalBalance = ETHtoUSDC+balanceUSDC;

  return (
    <Card className={className}>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg'>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center'>
                <span className='font-bold text-white'>
                  <FontAwesomeIcon icon={faEthereum} />
                  <></>
                </span>
              </div>
              <span>ETH</span>
            </div>
            <span className='font-semibold'>{formatCurrency(balanceETH)}</span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-full bg-pharos-500 flex items-center justify-center'>
                <span className='font-bold text-white'>$</span>
              </div>
              <span>USDC</span>
            </div>
            <span className='font-semibold'>{formatCurrency(balanceUSDC)}</span>
          </div>

          <div className='pt-2 border-t'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Total Value</span>
              <span className='font-medium'>
                {formatCurrency(totalBalance)} USD
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
