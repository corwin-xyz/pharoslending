
import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface TokenBalanceCardProps {
  className?: string;
}

export default function TokenBalanceCard({ className }: TokenBalanceCardProps) {
  const { balance } = useWallet();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-pharos-500 flex items-center justify-center">
                <span className="font-bold text-white">P</span>
              </div>
              <span>PHAR</span>
            </div>
            <span className="font-semibold">{balance.PHAR.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="font-bold text-white">$</span>
              </div>
              <span>USDP</span>
            </div>
            <span className="font-semibold">{balance.USDP.toFixed(2)}</span>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Value</span>
              <span className="font-medium">
                {formatCurrency(balance.PHAR + balance.USDP)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
