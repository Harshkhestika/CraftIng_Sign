import React, { useState } from 'react';
import { ShoppingCart, Menu, X, ChevronDown, ChevronRight, Facebook, Instagram, Twitter, MapPin, Mail, Phone, Star, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';
import { CATEGORIES } from '../../mockData';

// --- Navigation ---
export const UserNavigation = ({ cartCount, onNavigate, onOpenCart, user, onLogout }) => {
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

// --- Hero ---
export const Hero = ({ onCta }) => (
  <div className="relative py-24 bg-[#f8f4f0] overflow-hidden">
    <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
      <div className="md:w-1/2 space-y-6 text-center md:text-left">
        <h1 className="text-5xl font-serif font-bold text-[#3a3a3a]">Premium Acrylic <br/> Wedding Signs</h1>
        <p className="text-lg text-gray-600">Crafted with precision. Designed for elegance. Make your special day unforgettable.</p>
        <button onClick={onCta} className="bg-[#3a3a3a] text-white px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors shadow-lg">Shop Collection</button>
      </div>
      <div className="md:w-1/2 relative">
         <div className="bg-white p-4 rounded-xl shadow-2xl transform rotate-2">
            <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="rounded-lg w-full" alt="Hero"/>
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
               <Star className="text-amber-500 fill-current" size={16} />
               <span className="text-xs font-bold">Top Rated Collection</span>
            </div>
         </div>
      </div>
    </div>
  </div>
);

// --- Footer ---
export const Footer = () => (
  <footer className="bg-[#3a3a3a] text-white py-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-2xl font-serif font-bold mb-4">Crafting Sign</h3>
        <p className="text-gray-400 text-sm">Premium acrylic wedding cards.</p>
        <div className="flex gap-4 mt-4 text-gray-400"><Facebook size={18}/><Instagram size={18}/><Twitter size={18}/></div>
      </div>
      <div><h4 className="font-bold mb-4">Quick Links</h4><ul className="space-y-2 text-gray-400 text-sm"><li>Shop</li><li>Contact</li></ul></div>
      <div><h4 className="font-bold mb-4">Contact</h4><ul className="space-y-3 text-gray-400 text-sm"><li className="flex gap-2"><MapPin size={16}/> Jaipur, India</li><li className="flex gap-2"><Phone size={16}/> +91 9079199046</li></ul></div>
      <div><h4 className="font-bold mb-4">Newsletter</h4><div className="flex"><input type="email" placeholder="Email" className="bg-gray-700 text-white px-3 py-2 rounded-l w-full outline-none" /><button className="bg-amber-600 px-4 rounded-r"><ChevronRight /></button></div></div>
    </div>
  </footer>
);

// --- Product Card ---
export const ProductCard = ({ product, onClick }) => (
  <div onClick={() => onClick(product)} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 relative">
    <div className="relative h-64 overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      {product.isBestseller && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Bestseller</span>}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-amber-700 transition-colors">{product.name}</h3>
      <div className="flex justify-between items-center">
        <span className="font-bold text-amber-600 text-lg">${product.price}</span>
        <button className="p-2 rounded-full bg-gray-100 hover:bg-amber-600 hover:text-white transition-colors"><ShoppingBag size={16} /></button>
      </div>
    </div>
  </div>
);