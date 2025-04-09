
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface TransactionConfirmationProps {
  title: string;
  details: { label: string; value: string }[];
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TransactionConfirmation({
  title,
  details,
  isLoading = false,
  onConfirm,
  onCancel,
}: TransactionConfirmationProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {details.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
          <Separator />
          <div className="text-xs text-muted-foreground">
            By confirming this transaction, you agree to the terms and conditions of the Pharos Credit protocol.
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Confirm'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
