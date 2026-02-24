import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const showBottomNav = ['/', '/menu', '/orders', '/profile'].includes(location.pathname);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto border-x border-surface-highlight shadow-2xl bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-white">
      <Outlet />
      {showBottomNav && <BottomNav />}
    </div>
  );
}
