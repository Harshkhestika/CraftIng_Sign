import React, { useState } from 'react';
import { ShoppingCart, Menu, X, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { CATEGORIES } from '../../mockData';

const UserNavigation = ({ cartCount, onNavigate, onOpenCart, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-[#e8e2d9]">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-20">
        <button onClick={() => onNavigate('home')} className="text-2xl font-serif font-bold text-[#3a3a3a]">Crafting Sign</button>
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => onNavigate('home')} className="text-gray-700 hover:text-amber-600 transition">Home</button>
          <div className="relative group">
            <button className="text-gray-700 hover:text-amber-600 flex items-center gap-1 py-2 transition" onMouseEnter={() => setDropdown(true)}>Shop <ChevronDown size={14} /></button>
            {dropdown && (
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl p-4 border border-gray-100" onMouseLeave={() => setDropdown(false)}>
                <div className="flex flex-col space-y-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { onNavigate('category', cat.id); setDropdown(false); }} className="text-left text-sm text-gray-600 hover:text-amber-600 hover:bg-gray-50 p-2 rounded">{cat.name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="text-gray-700 hover:text-amber-600 transition">About</button>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-2">
              {user.isAdmin && <button onClick={() => onNavigate('admin')} className="text-sm font-bold text-amber-700 flex items-center gap-1"><LayoutDashboard size={16}/> Admin</button>}
              <button onClick={onLogout}><LogOut size={20} /></button>
            </div>
          ) : (
            <button onClick={() => onNavigate('login')} className="px-4 py-2 border rounded hover:bg-gray-100 transition">Login</button>
          )}
          <button onClick={onOpenCart} className="relative"><ShoppingCart size={22} />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}</button>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white p-4 space-y-4 border-t">
          <button onClick={() => onNavigate('home')} className="block w-full text-left">Home</button>
          <button onClick={() => onNavigate('category', 'all')} className="block w-full text-left">Shop</button>
          <button onClick={() => onNavigate('login')} className="block w-full text-left">Login</button>
        </div>
      )}
    </nav>
  );
};
export default UserNavigation;