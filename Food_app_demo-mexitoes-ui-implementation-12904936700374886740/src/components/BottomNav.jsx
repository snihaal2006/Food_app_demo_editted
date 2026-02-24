import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p) => path === p;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark border-t border-surface-highlight pb-6 pt-3 px-6 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex flex-col items-center gap-1 group">
          <span className={`material-symbols-outlined text-2xl transition-colors ${isActive('/') ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-white'}`} style={isActive('/') ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : {}}>home</span>
          <span className={`text-[10px] ${isActive('/') ? 'font-bold text-primary' : 'font-medium text-slate-400 group-hover:text-white transition-colors'}`}>Home</span>
        </Link>

        <Link to="/orders" className="flex flex-col items-center gap-1 group">
          <span className={`material-symbols-outlined text-2xl transition-colors ${isActive('/orders') ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-white'}`}>receipt_long</span>
          <span className={`text-[10px] ${isActive('/orders') ? 'font-bold text-primary' : 'font-medium text-slate-400 group-hover:text-white transition-colors'}`}>Orders</span>
        </Link>

        <div className="relative -top-8">
          <Link to="/cart" className="bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background-dark hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          </Link>
        </div>

        <Link to="/menu" className="flex flex-col items-center gap-1 group">
          <span className={`material-symbols-outlined text-2xl transition-colors ${isActive('/menu') ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-white'}`} style={isActive('/menu') ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : {}}>restaurant_menu</span>
          <span className={`text-[10px] ${isActive('/menu') ? 'font-bold text-primary' : 'font-medium text-slate-400 group-hover:text-white transition-colors'}`}>Menu</span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center gap-1 group">
          <span className={`material-symbols-outlined text-2xl transition-colors ${isActive('/profile') ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-white'}`}>person</span>
          <span className={`text-[10px] ${isActive('/profile') ? 'font-bold text-primary' : 'font-medium text-slate-400 group-hover:text-white transition-colors'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
