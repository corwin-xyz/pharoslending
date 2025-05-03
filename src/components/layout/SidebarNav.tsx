import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  DollarSign,
  Banknote,
  BarChart3,
  Settings,
  History,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem = ({ to, icon, label, end = false }: NavItemProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground'
      )
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default function SidebarNav() {
  return (
    <div className='space-y-6 py-6'>
      <div className='px-3 py-2'>
        <h2 className='mb-2 px-3 text-sm font-semibold'>Dashboard</h2>
        <div className='space-y-1'>
          <NavItem to='/' icon={<Home size={18} />} label='Overview' end />
          <NavItem to='/lend' icon={<DollarSign size={18} />} label='Lend' />
          <NavItem to='/borrow' icon={<Banknote size={18} />} label='Borrow' />
          {/* <NavItem to='/deposit' icon={<Banknote size={18} />} label='Deposit' /> */}
        </div>
      </div>
      <div className='px-3 py-2'>
        <h2 className='mb-2 px-3 text-sm font-semibold'>Reports</h2>
        <div className='space-y-1'>
          <NavItem
            to='/analytics'
            icon={<BarChart3 size={18} />}
            label='Analytics'
          />
          <NavItem to='/history' icon={<History size={18} />} label='History' />
        </div>
      </div>
      <div className='px-3 py-2'>
        <h2 className='mb-2 px-3 text-sm font-semibold'>Account</h2>
        <div className='space-y-1'>
          <NavItem
            to='/settings'
            icon={<Settings size={18} />}
            label='Settings'
          />
        </div>
      </div>
    </div>
  );
}
