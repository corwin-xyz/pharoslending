
import React from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/utils';

export default function Navbar() {
  const { address, isConnected, connect, disconnect } = useWallet();
  
  return (
    <nav className="border-b border-border backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pharos-600 to-pharos-400">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="text-xl font-bold gradient-text">Pharos Credit</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:inline-block">{formatAddress(address)}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="default" 
              onClick={connect}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
