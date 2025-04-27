import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';





interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { currentAddress, connected, connect, disconnect, connectWallet } =
    useWallet();
  const { openConnectModal } = useConnectModal(); // <- ambil openConnectModal function

  return (
    <nav className='sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <div className='flex items-center gap-2'>
          {connected && (
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden mr-2'
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label='Toggle sidebar'
            >
              <Menu className='h-6 w-6' />
            </Button>
          )}
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pharos-600 to-pharos-400'>
            <span className='text-white font-bold'>P</span>
          </div>
          <span className='text-xl font-bold gradient-text'>Lend AI</span>
        </div>

        <div className='flex items-center space-x-4'>
          <div className='flex gap-x-10 p-4'>
            <a href='#' className='text-gray-700 font-semibold'>
              Products
            </a>
            <a href='#' className='text-gray-700 font-semibold'>
              Developers
            </a>
            <a href='#' className='text-gray-700 font-semibold'>
              Resources
            </a>
          </div>
          {connected ? (
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium hidden md:inline-block'>
                {formatAddress(currentAddress)}
              </span>
              <Button size='sm' variant='outline' onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button size='sm' variant='default' onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
