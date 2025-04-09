
import React from 'react';
import Navbar from './Navbar';
import SidebarNav from './SidebarNav';
import { useWallet } from '@/hooks/useWallet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isConnected } = useWallet();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {isConnected && (
          <>
            <aside 
              className={cn(
                "fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background transition-all duration-300 ease-in-out",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <SidebarNav />
            </aside>
            <button
              className="fixed left-0 top-1/2 z-30 h-10 w-6 -translate-y-1/2 rounded-r-md bg-primary text-primary-foreground shadow-md md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "←" : "→"}
            </button>
          </>
        )}
        <main 
          className={cn(
            "flex-1 pt-6 px-4", 
            isConnected && sidebarOpen ? "md:ml-64" : ""
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
