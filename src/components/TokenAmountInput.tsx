import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useWallet } from '../../src/hooks/useWallet';

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onMax?: () => void;
  max?: number;
  token: 'PHAR' | 'USDP' | 'USDC' | 'ETH';
  label?: string;
  disabled?: boolean;
}

export default function TokenAmountInput({
  value,
  onChange,
  onMax,
  max,
  token,
  label = 'Amount',
  disabled = false,
}: TokenAmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers and decimal points
    if (inputValue === '' || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };
  const { balance, balanceUSDC } = useWallet();
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label htmlFor='amount'>{label}</Label>
        {max !== undefined && (
          <span className='text-xs text-muted-foreground'>
            Available: {balanceUSDC.toFixed(2)}
          </span>
        )}
      </div>
      <div className='flex items-center space-x-2'>
        <div className='relative flex-1'>
          <Input
            id='amount'
            type='text'
            value={value}
            onChange={handleChange}
            placeholder='0.00'
            disabled={disabled}
            className='pr-16'
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
            <span className='text-sm text-muted-foreground'>{token}</span>
          </div>
        </div>
        {onMax && (
          <Button
            variant='outline'
            size='sm'
            onClick={onMax}
            disabled={disabled}
          >
            Max
          </Button>
        )}
      </div>
    </div>
  );
}
