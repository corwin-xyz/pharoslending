import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SidebarNav from './SidebarNav';
import { useWallet } from '@/hooks/useWallet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Landing from '../../pages/Landing'; // <- kalau ini komponen, harusnya dari components

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { connected } = useWallet();
  const isMobile = useIsMobile();
  
  // Keep sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Adjust sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (!connected) {
    return (<Landing />);
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Pass state and setter to Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className='flex-1 flex relative'>
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:sticky md:translate-x-0'
          )}
        >
          <SidebarNav />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div
            className='fixed inset-0 top-16 z-20 bg-black/30 md:hidden'
            onClick={() => setSidebarOpen(false)}
            aria-hidden='true'
          />
        )}

        {/* Main Content Area */}
        <main
          className={cn(
            'flex-1 pt-6 px-4 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden',
            // Add margin-left only on desktop when sidebar is statically positioned
            connected ? 'lg:ml-1' : ''
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
