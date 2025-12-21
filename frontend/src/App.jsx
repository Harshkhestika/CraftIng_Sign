import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Menu, X, ChevronDown,
  Facebook, Instagram, Twitter, MapPin, Mail, Phone,
  Trash2, Plus, Minus, LogOut,
  Search, Upload, List, Users,
  Truck, RefreshCw, CreditCard, Lock, Edit3, 
  Gift, Globe, Download, MessageCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import factoryImg from './pic.jpeg'; // adjust path if needed
import welcomeImg from './assets/welcome.jpeg';
import seatingImg from './assets/seating.jpeg';
import barImg from './assets/bar.jpg';
import menuImg from './assets/menucards.webp';
import placeCardImg from './assets/placecards.jpg';
import thankYouImg from './assets/thankyou.jpg';
import decorImg from './assets/tabledecor.jpg';
import tableNumberImg from './assets/tablenumbers.webp';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { productsAPI, ordersAPI, customersAPI, authAPI, removeToken, normalizeImageUrl, paymentsAPI } from './services/api';

// --- CURRENCY HELPERS ---

const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.80,
  INR: 83,
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

const convertCurrency = (amount, currency) => {
  const rate = CURRENCY_RATES[currency] || 1;
  return amount * rate;
};

const formatCurrency = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  return `${symbol}${amount.toFixed(2)}`;
};

const getDisplayPriceFromBase = ({
  basePrice,
  currency,
  specialDiscount,
  originalBasePrice,
}) => {
  const base = Number(basePrice) || 0;
  const originalBase = originalBasePrice != null ? Number(originalBasePrice) : null;

  const convertedBase = convertCurrency(base, currency);

  if (specialDiscount > 0) {
    const discounted = convertedBase * (1 - specialDiscount / 100);
    return {
      hasDiscount: true,
      original: convertedBase,
      final: discounted,
    };
  }

  if (originalBase != null) {
    const convertedOriginal = convertCurrency(originalBase, currency);
    return {
      hasDiscount: true,
      original: convertedOriginal,
      final: convertedBase,
    };
  }

  return {
    hasDiscount: false,
    original: null,
    final: convertedBase,
  };
};

// --- DATA & CONSTANTS ---

const CATEGORIES = [
  { id: 'welcome', name: 'Welcome Sign', img: welcomeImg },
  { id: 'seating', name: 'Seating Chart', img: seatingImg },
  { id: 'bar', name: 'Bar Sign', img: barImg },
  { id: 'menucards', name: 'Menu Cards', img: menuImg },
  { id: 'placecards', name: 'Place Cards', img: placeCardImg },
  { id: 'thankyou', name: 'Thank You Cards', img: thankYouImg },
  { id: 'tabledecor', name: 'Table Decor', img: decorImg },
  { id: 'tablenumbers', name: 'Table Numbers', img: tableNumberImg },
];

// --- TOP BAR & USER NAVIGATION ---

const TopBar = ({ specialDiscount, offerName }) => {
  if (specialDiscount <= 0) return null;

  return (
    <div className="bg-[#3a3a3a] text-white text-sm py-2 border-b border-gray-700">
      <div className="container mx-auto px-4 flex items-center justify-center text-center gap-3">
        <Gift size={18} className="text-[#d4b896]" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4b896] font-semibold">
            {offerName || 'Limited Time Offer'}
          </p>
          <p className="text-sm font-semibold">
            Flat {specialDiscount}% off on all products!
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoBar = () => (
  <div className="bg-[#3a3a3a] text-white text-sm py-2 sm:py-3 border-b border-gray-700">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row items-center justify-evenly gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm">
        <span className="flex items-center gap-1 sm:gap-2">
          <Truck size={12} className="sm:w-[14px] sm:h-[14px] text-[#d4b896] flex-shrink-0" /> 
          <span className="whitespace-nowrap">Free Shipping</span>
        </span>
        <span className="flex items-center gap-1 sm:gap-2">
          <Phone size={12} className="sm:w-[14px] sm:h-[14px] text-[#d4b896] flex-shrink-0" /> 
          <span className="whitespace-nowrap">24/7 Support</span>
        </span>
        <span className="flex items-center gap-1 sm:gap-2">
          <RefreshCw size={12} className="sm:w-[14px] sm:h-[14px] text-[#d4b896] flex-shrink-0" /> 
          <span className="whitespace-nowrap">7 Days Return</span>
        </span>
        <button
          className="flex items-center hover:text-[#d4b896] transition-colors font-medium whitespace-nowrap"
          onClick={() => window.open('https://www.dhl.com/in-en/home/tracking.html', '_blank')}
        >
          Track Order
        </button>
      </div>
    </div>
  </div>
);

const UserNavigation = ({ cartCount, onNavigate, onOpenCart, user, onLogout, currency, onCurrencyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#e8e2d9] transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 flex justify-between items-center h-16 sm:h-20">
        <div className="logo">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1 sm:gap-2">
            <div className="bg-[#d4b896] w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-tl-lg rounded-br-lg flex-shrink-0">
              <span className="text-white font-serif font-bold text-sm sm:text-xl">CS</span>
            </div>
            <span className="text-base sm:text-2xl font-serif font-bold text-[#3a3a3a] tracking-tight whitespace-nowrap">Crafting Sign</span>
          </button>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <button onClick={() => onNavigate('home')} className="text-[#3a3a3a] hover:text-[#d4b896] font-medium transition-colors text-sm uppercase tracking-wider">Home</button>
          
          <div className="relative group">
            <button 
              className="text-[#3a3a3a] hover:text-[#d4b896] flex items-center font-medium transition-colors text-sm uppercase tracking-wider h-20"
              onMouseEnter={() => setDropdown(true)}
            >
              Shop <ChevronDown size={12} className="ml-1" />
            </button>

            <div 
              className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-0 w-[90vw] max-w-[600px] bg-white rounded-b-xl shadow-xl p-4 sm:p-8 border-t-4 border-[#d4b896] transition-all duration-300 origin-top ${dropdown ? 'opacity-100 visible scale-y-100' : 'opacity-0 invisible scale-y-95'}`}
              onMouseLeave={() => setDropdown(false)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <h4 className="font-serif font-bold text-base mb-3 text-[#3a3a3a] border-b border-gray-100 pb-2">Main Collections</h4>
                  <div className="flex flex-col space-y-2">
                    {CATEGORIES.slice(0, 4).map(cat => (
                      <button key={cat.id} onClick={() => { onNavigate('category', cat.id); setDropdown(false); }} className="text-left text-gray-600 hover:text-[#d4b896] transition-colors text-sm">{cat.name}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-3 text-[#3a3a3a] border-b border-gray-100 pb-2">More Collections</h4>
                  <div className="flex flex-col space-y-2">
                    {CATEGORIES.slice(4).map(cat => (
                      <button key={cat.id} onClick={() => { onNavigate('category', cat.id); setDropdown(false); }} className="text-left text-gray-600 hover:text-[#d4b896] transition-colors text-sm">{cat.name}</button>
                    ))}
                    <button onClick={() => { onNavigate('category', 'all'); setDropdown(false); }} className="text-left text-[#d4b896] font-bold mt-4 hover:underline text-sm uppercase tracking-wide">View All Products →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => onNavigate('about')} className="text-[#3a3a3a] hover:text-[#d4b896] font-medium transition-colors text-sm uppercase tracking-wider">About</button>
          <button onClick={() => onNavigate('contact')} className="text-[#3a3a3a] hover:text-[#d4b896] font-medium transition-colors text-sm uppercase tracking-wider">Contact</button>
        </nav>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative block">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-white text-[#3a3a3a] text-xs font-semibold border border-gray-300 rounded px-2 py-1 pr-6 appearance-none cursor-pointer hover:border-[#d4b896] transition-colors"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EURO (€)</option>
              <option value="GBP">POUND (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative cursor-pointer group" onClick={onOpenCart}>
            <ShoppingCart size={18} className="text-[#3a3a3a] group-hover:text-[#d4b896] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#d4b896] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>
            )}
          </div>

          {user ? (
             <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
               {user.isAdmin && <button onClick={() => onNavigate('admin')} className="hidden md:flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#3a3a3a] hover:text-[#d4b896]">Admin</button>}
               <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogOut size={16} /></button>
             </div>
          ) : (
             <button onClick={() => onNavigate('login')} className="hidden md:block text-[#3a3a3a] font-bold text-xs hover:text-[#d4b896] uppercase tracking-wide border border-[#3a3a3a] px-3 py-1 rounded hover:bg-[#3a3a3a] hover:text-white transition-colors">Login</button>
          )}
          
          <button className="md:hidden text-[#3a3a3a] p-2 -mr-2" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg z-50 fixed top-20 left-0 right-0 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-4 space-y-0">
            <button onClick={() => { onNavigate('home'); setIsOpen(false); }} className="block py-3 w-full text-left font-medium border-b border-gray-100 text-sm">Home</button>
            <button onClick={() => { onNavigate('category', 'all'); setIsOpen(false); }} className="block py-3 w-full text-left font-medium border-b border-gray-100 text-sm">Shop</button>
            <button onClick={() => { onNavigate('about'); setIsOpen(false); }} className="block py-3 w-full text-left font-medium border-b border-gray-100 text-sm">About</button>
            <button onClick={() => { onNavigate('contact'); setIsOpen(false); }} className="block py-3 w-full text-left font-medium border-b border-gray-100 text-sm">Contact</button>
            {!user && (
              <button onClick={() => { onNavigate('login'); setIsOpen(false); }} className="block py-3 w-full text-left font-medium text-sm">Login</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = ({ footerRef, onNavigate }) => (
  <footer ref={footerRef} className="bg-[#3a3a3a] text-white pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-700 pb-12">
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-[#d4b896]">Crafting Sign</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            We specialize in creating custom wedding signs and decorative products that are more than just decor.
          </p>
          <div className="flex space-x-3 pt-1">
            <Facebook className="text-white hover:text-[#d4b896] cursor-pointer transition-colors" size={20} />
            <Instagram className="text-white hover:text-[#d4b896] cursor-pointer transition-colors" size={20} />
            <Twitter className="text-white hover:text-[#d4b896] cursor-pointer transition-colors" size={20} />
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Shop</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li onClick={() => onNavigate('category', 'all')} className="hover:text-[#d4b896] cursor-pointer transition-colors">All Categories</li>
            <li onClick={() => onNavigate('category', 'welcome')} className="hover:text-[#d4b896] cursor-pointer transition-colors">Welcome Signs</li>
            <li onClick={() => onNavigate('category', 'seating')} className="hover:text-[#d4b896] cursor-pointer transition-colors">Seating Charts</li>
            <li onClick={() => onNavigate('category', 'bar')} className="hover:text-[#d4b896] cursor-pointer transition-colors">Bar Signs</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Information</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li onClick={() => onNavigate('about')} className="hover:text-[#d4b896] cursor-pointer transition-colors">About Us</li>
            <li onClick={() => onNavigate('contact')} className="hover:text-[#d4b896] cursor-pointer transition-colors">Contact Us</li>
            <li className="hover:text-[#d4b896] cursor-pointer transition-colors">Shipping Policy</li>
            <li className="hover:text-[#d4b896] cursor-pointer transition-colors">Returns & Refunds</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Contact Us</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-start gap-2"><MapPin size={18} className="text-[#d4b896] mt-0.5 flex-shrink-0" /> <span>Plot no. 121, Jaipur</span></li>
            <li className="flex items-center gap-2"><Mail size={18} className="text-[#d4b896] flex-shrink-0" /> craftingsign@gmail.com</li>
            <li className="flex items-center gap-2"><Phone size={18} className="text-[#d4b896] flex-shrink-0" /> +91 9079199046</li>
          </ul>
        </div>
      </div>
      <div className="pt-6 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2025 Crafting Sign. All rights reserved. | Designed for Excellence</p>
        <div className="flex gap-6">
           <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
           <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- PRODUCT CARD (with WhatsApp) ---

const ProductCard = ({ product, onClick, currency, specialDiscount }) => {
  const { hasDiscount, original, final } = getDisplayPriceFromBase({
    basePrice: product.price,
    currency,
    specialDiscount,
    originalBasePrice: product.originalPrice,
  });

  const waMessage = encodeURIComponent(
    `Hi, I'm interested in "${product.name}" from your website. Could you share more details?`
  );
  const waLink = `https://wa.me/919079199046?text=${waMessage}`;

  return (
    <div className="group cursor-pointer relative">
      <div onClick={() => onClick(product)} className="relative overflow-hidden rounded-2xl mb-3 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
        <img src={normalizeImageUrl(product.image)} alt={product.name} className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-700 group-hover:scale-105" />
        
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4">
          <button className="w-full bg-[#3a3a3a] text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#d4b896] transition-colors shadow-lg">
            Quick View
          </button>
        </div>
      </div>

      {/* WhatsApp badge on card */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 bg-[#25D366] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={18} />
      </a>

      <div className="text-center px-1 sm:px-2">
        <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest mb-1">{product.category}</div>
        <h3 className="font-serif text-sm sm:text-base text-[#3a3a3a] mb-1 group-hover:text-[#d4b896] transition-colors line-clamp-2">{product.name}</h3>
        <div className="flex justify-center items-center gap-2">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(original, currency)}
            </span>
          )}
          <span className="font-bold text-[#3a3a3a] text-sm">
            {formatCurrency(final, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- HOME / CATEGORY / PRODUCT VIEWS ---

const HomeView = ({ onNavigate, products, aboutRef, currency, specialDiscount, offerName, specialOfferImage }) => {

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];
  // Take the last 4 products in the array as "New Arrivals" (newest first)
  const newArrivals = [...safeProducts].slice(-4).reverse();

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[400px] sm:h-[500px] flex items-center bg-[#f8f4f0] overflow-hidden py-8 sm:py-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 w-2/3 h-full bg-[#e8e2d9] opacity-30 -skew-x-12 translate-x-10 sm:translate-x-20 rounded-bl-[50px] sm:rounded-bl-[100px]" />
        </div>
        <div className="container mx-auto px-3 sm:px-4 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-3 sm:space-y-4 animate-fadeIn text-center md:text-left w-full">
            <span className="text-[#d4b896] font-bold tracking-[0.2em] uppercase text-[9px] sm:text-[10px]">
              Handcrafted Elegance
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-[#3a3a3a] leading-[1.1] px-2 sm:px-0">
              Premium Acrylic Wedding<br className="hidden sm:block" /> Cards & Decor Signs
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-md mx-auto md:mx-0 leading-relaxed px-2 sm:px-0">
              Premium acrylic signage designed to add a touch of luxury to your weddings,
              parties, and special occasions.
            </p>
            <div className="pt-2 sm:pt-4">
              <button
                onClick={() => onNavigate('category', 'all')}
                className="bg-[#3a3a3a] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-[#d4b896] transition-colors shadow-lg transform hover:-translate-y-1"
              >
                Shop Collection
              </button>
            </div>
          </div>
          <div className="md:w-1/2 mt-6 sm:mt-8 md:mt-0 relative w-full max-w-sm md:ml-8 md:mr-auto">
            <img
              src="https://i.pinimg.com/736x/49/cd/d7/49cdd7c307f8c890be822f5f99371a7c.jpg"
              alt="Hero"
              className="rounded-2xl shadow-2xl w-full mx-auto md:mx-0 transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      <InfoBar />

      {/* New Arrivals */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[#d4b896] font-bold tracking-widest uppercase text-xs">
                Fresh In
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3a3a3a] mt-1">
                New Arrivals
              </h2>
            </div>
            <button
              onClick={() => onNavigate('category', 'all')}
              className="text-[#3a3a3a] font-bold border-b-2 border-[#3a3a3a] pb-0.5 hover:text-[#d4b896] hover:border-[#d4b896] transition-all text-[10px] uppercase tracking-wider"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((p) => (
              <ProductCard
                key={p._id || p.id}
                product={p}
                onClick={(prod) => onNavigate('product', prod)}
                currency={currency}
                specialDiscount={specialDiscount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-8 sm:py-12 md:py-16 bg-[#f8f4f0]">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-10">
            <span className="text-[#d4b896] font-bold tracking-widest uppercase text-[10px]">
              Collections
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3a3a3a] mt-1">
              Shop By Category
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate('category', cat.id)}
                className="group relative h-40 sm:h-48 md:h-64 overflow-hidden cursor-pointer rounded-lg sm:rounded-xl shadow-sm"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <h3 className="text-white text-lg font-serif font-bold mb-1">
                    {cat.name}
                  </h3>
                  <span className="text-white/80 text-[9px] uppercase tracking-widest border-b border-white/50 pb-0.5 group-hover:text-white group-hover:border-white transition-all">
                    Shop Now
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Special Offers Section - Always show if there's an offer */}
      {(specialDiscount > 0 || offerName) && (
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-[#d4b896] to-[#c9a876]">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="relative h-64 sm:h-80 md:h-96 rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl bg-cover bg-center" 
              style={{
                backgroundImage: `url('${specialOfferImage || 'https://i.pinimg.com/1200x/17/82/a9/1782a98add04ec24ee2145f9baf43e76.jpg'}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Special Offer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                <span className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-widest mb-2 sm:mb-4 opacity-90">
                  {offerName ? offerName : 'Limited Time Offer'}
                </span>
                {specialDiscount > 0 && (
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 sm:mb-4 drop-shadow-lg">
                    {specialDiscount}% OFF
                  </h2>
                )}
                <p className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6 drop-shadow-md max-w-2xl">
                  {offerName && specialDiscount > 0 ? `${offerName} - ${specialDiscount}% Discount on All Products` : (offerName || 'Exclusive Discount on All Products')}
                </p>
                <button 
                  onClick={() => onNavigate('category', 'all')}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#3a3a3a] font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-sm sm:text-base uppercase tracking-widest"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3a3a3a]">
              Best Seller Products
            </h2>
            <p className="text-gray-500 mt-1 text-[10px] sm:text-xs">Our most loved designs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {(Array.isArray(products) ? products : [])
              .filter((p) => p && p.isBestseller)
              .slice(0, 4)
              .map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={(prod) => onNavigate('product', prod)}
                  currency={currency}
                  specialDiscount={specialDiscount}
                />
              ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
          <div className="lg:w-2/3 w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative bg-gray-100" style={{ height: '350px', minHeight: '350px' }}>
            {/* Embedded Google Map Iframe */}
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3537.5429644324497!2d75.78450767346221!3d26.912450068313457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db69af3dd9cbd%3A0xf3b3b3b3b3b3b3b3!2sKhanchan%20Vihar%2C%20Jaipur!5e0!3m2!1sen!2sin!4v1234567890"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="lg:w-1/3 w-full space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#3a3a3a]">
              Visit Our Studio
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                PLOT NO.121 KHANCHAN VIHAR,
                <br /> BENAR ROAD, NEAR BENAR RAILWAY STATION,
                <br /> JAIPUR, RAJASTHAN, 302012
              </p>
              <a
                href="https://www.google.com/maps?q=PLOT+NO.121+KHANCHAN+VIHAR,+BENAR+ROAD,+NEAR+BENAR+RAILWAY+STATION,+JAIPUR,+RAJASTHAN+302012"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4b896] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors font-medium text-sm"
              >
                <MapPin size={16} /> View on Google Maps
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Open by appointment only. Get in touch with us to schedule a visit
                to our studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section ref={aboutRef} className="py-20 bg-[#f8f4f0]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-[#3a3a3a] mb-8">
            Buy Customized Decorative Signs | Crafting Sign
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg max-full">
            Welcome to Crafting Sign, Where we believe your love story deserves to be celebrated with artistry and elegance. We specialize in creating custom wedding signs and decorative products that are more than just decor—They are a reflection of your unique journey. Each piece is handcrafted to add a personal and artistic touch to your celebration, Ensuring every detail tells a part of your story. From your welcome sign to your seating chart and other decorative product, let us transform your vision into a beautiful reality that you and your guests will cherish forever.
          </p>
        </div>
      </section>
    </>
  );
};



const CategoryView = ({ category, products, onNavigate, currency, specialDiscount }) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const displayProducts = category === 'all' ? safeProducts : safeProducts.filter(p => p && p.category === category);
  const catName = category === 'all' ? 'Shop All' : CATEGORIES.find(c => c.id === category)?.name || category;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#f8f4f0] py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3a3a3a] mb-3">{catName}</h1>
        <div className="flex justify-center items-center text-xs text-gray-500 space-x-2 uppercase tracking-wide">
            <span className="cursor-pointer hover:text-[#d4b896]" onClick={() => onNavigate('home')}>Home</span>
            <span>/</span>
            <span className="text-[#3a3a3a]">{catName}</span>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 border-b border-gray-100 gap-3">
              <p className="text-gray-500 text-sm">Showing {displayProducts.length} results</p>
              <div className="relative">
                <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-xs text-[#3a3a3a] font-medium focus:ring-0 focus:border-[#d4b896] cursor-pointer bg-white appearance-none outline-none hover:border-[#d4b896]">
                    <option>Default Sorting</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
          </div>
          
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-10">
                {displayProducts.map(product => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onClick={(prod) => onNavigate('product', prod)}
                    currency={currency}
                    specialDiscount={specialDiscount}
                  />
                ))}
            </div>
          ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <h3 className="text-xl font-serif text-gray-400">No products found in this category.</h3>
                <button onClick={() => onNavigate('category', 'all')} className="mt-4 text-[#d4b896] border-b border-[#d4b896] pb-1">View All</button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PRODUCT DETAIL (with WhatsApp + proper suggestions) ---

const ProductDetail = ({ product, products, onBack, onAddToCart, currency, specialDiscount }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [customText, setCustomText] = useState('');

  const [primaryValue, setPrimaryValue] = useState('');
  const [color, setColor] = useState('');
  const [activeImage, setActiveImage] = useState(product?.image || '');

  const navigate = useNavigate();

  if (!product) return null;

  const hasFeatures = product?.features && product.features.length > 0;
  const primaryLabel = product.featureType === 'number' ? 'Number' : 'Size';

  const uniquePrimaries = hasFeatures
    ? [...new Set(product.features.map((f) => f.size))]
    : ['12" x 18"', '18" x 24"', '24" x 36"'];

  const uniqueColors = hasFeatures
    ? [...new Set(product.features.map((f) => f.color))]
    : ['White', 'Clear', 'Black', 'Frosted'];

  useEffect(() => {
    if (uniquePrimaries.length > 0) setPrimaryValue(uniquePrimaries[0]);
    if (uniqueColors.length > 0) setColor(uniqueColors[0]);
    setQuantity(1);
    setCustomText('');
    const firstImage = product?.images?.[0] || product?.image || '';
    setActiveImage(firstImage);
  }, [product]); // reset when product changes

  const getBaseVariantPrice = () => {
    if (!hasFeatures) return Number(product.price) || 0;
    const matched = product.features.find(
      (f) => f.size === primaryValue && f.color === color
    );
    const candidate = matched
      ? matched.price
      : product.features.find((f) => f.size === primaryValue)?.price || product.price;
    return Number(candidate) || 0;
  };

  const basePrice = getBaseVariantPrice();

  const { hasDiscount, original, final } = getDisplayPriceFromBase({
    basePrice,
    currency,
    specialDiscount,
    originalBasePrice: product.originalPrice,
  });

  const handleAddToCartClick = () => {
    const itemToAdd = {
      ...product,
      quantity,
      selectedSize: primaryValue,
      selectedColor: color,
      customization: customText,
      price: basePrice, // base price in default currency
    };
    onAddToCart(itemToAdd);
  };

  const waMessage = encodeURIComponent(
    `Hi, I'm interested in "${product.name}" (${primaryLabel}: ${primaryValue}, Color: ${color}). Can you please share more details?`
  );
  const waLink = `https://wa.me/919079199046?text=${waMessage}`;

  // Similar products (same category, different product)
  const similarProducts = (products || [])
    .filter((p) => (p._id || p.id) !== (product._id || product.id) && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="bg-white min-h-screen animate-fadeIn">
      <div className="bg-[#f8f4f0] py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4 text-[10px] sm:text-xs text-gray-500">
          <span className="cursor-pointer hover:text-[#3a3a3a]" onClick={onBack}>
            Home
          </span>{' '}
          / <span className="cursor-pointer hover:text-[#3a3a3a]">Shop</span> /{' '}
          <span className="text-[#3a3a3a]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-12">

          {/* Image gallery: Amazon-style with thumbnails on left, main image on right */}
          <div className="lg:w-1/2 w-full">
            <div className="flex gap-3 sm:gap-4">
              {/* Thumbnails on the left - vertical stack */}
              <div className="flex flex-col gap-2 sm:gap-3 flex-shrink-0">
                {(product.images && product.images.length > 0 ? product.images : [product.image]).slice(0, 8).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img 
                        ? 'border-[#d4b896] ring-2 ring-[#d4b896] ring-opacity-50 opacity-100' 
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={normalizeImageUrl(img)} 
                      className="w-full h-full object-cover" 
                      alt={`Thumbnail ${i + 1}`} 
                    />
                  </button>
                ))}
              </div>

              {/* Main image on the right */}
              <div className="flex-1 bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={normalizeImageUrl(activeImage || product.image)}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                  style={{ minHeight: '380px', maxHeight: '680px' }}
                />
              </div>
            </div>
            
            <div className="mt-3 flex justify-center">
                 <a
                href={normalizeImageUrl(activeImage || product.image)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3a3a3a] underline font-medium hover:text-[#d4b896] transition-colors"
              >
                Click to see full view
              </a>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:w-1/2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#3a3a3a] mb-3 sm:mb-4 break-words">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              {hasDiscount && (
                <span className="text-lg sm:text-xl text-gray-400 line-through">
                  {formatCurrency(original, currency)}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-bold text-[#d4b896]">
                {formatCurrency(final, currency)}
              </span>
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-6 space-y-6">
              {/* Primary (Size/Number) */}
              <div>
                <label className="block text-sm font-bold text-[#3a3a3a] uppercase tracking-wider mb-2">
                  {primaryLabel}
                </label>
                <div className="relative">
                  <select
                    value={primaryValue}
                    onChange={(e) => setPrimaryValue(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#d4b896] appearance-none bg-white text-gray-700 cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
                  >
                    {uniquePrimaries.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-bold text-[#3a3a3a] uppercase tracking-wider mb-2">
                  Color
                </label>
                <div className="relative">
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#d4b896] appearance-none bg-white text-gray-700 cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
                  >
                    {uniqueColors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* Personalization */}
              <div>
                <label className="block text-sm font-bold text-[#3a3a3a] uppercase tracking-wider mb-2">
                  Personalization
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#d4b896] text-sm shadow-sm resize-none"
                  rows="3"
                  placeholder="Enter names, dates, or specific requests here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex items-center border border-gray-300 w-32 rounded-xl overflow-hidden h-14">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCartClick}
                className="flex-1 bg-[#3a3a3a] text-white h-14 rounded-xl font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>

            {/* WhatsApp button */}
            <div className="mb-8">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle size={18} />
                Ask on WhatsApp
              </a>
            </div>

            {/* Tabs moved below images to appear under the photo section */}
          </div>
        </div>

        {/* Tabs (Description / Shipping) - placed below photos/details */}
        <div className="mt-8 container mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 mr-8 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'desc'
                    ? 'border-b-2 border-[#3a3a3a] text-[#3a3a3a]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('ship')}
                className={`pb-3 mr-8 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'ship'
                    ? 'border-b-2 border-[#3a3a3a] text-[#3a3a3a]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Shipping
              </button>
            </div>

            <div className="py-6 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {activeTab === 'desc' ? (
                <div className="whitespace-pre-wrap">
                  <p>{product.description}</p>
                  <p className="mt-4">
                    Our signs are made from high-quality, shatter-resistant acrylic. The
                    lettering is UV printed for a durable, long-lasting finish that won't
                    peel or fade. Perfect for adding a modern, elegant touch to your
                    special event.
                  </p>
                </div>
              ) : (
                <p>
                  We ship worldwide! Orders are processed within 3-5 business days.
                  Express shipping options available at checkout. All items are securely
                  packaged to ensure they arrive in perfect condition.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-[#3a3a3a] mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onClick={(prod) => {
                    navigate(`/product/${prod._id || prod.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  currency={currency}
                  specialDiscount={specialDiscount}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- LOGIN VIEW ---

const LoginView = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const email = e.target.email.value;
    const password = e.target.password?.value || '';
    
    try {
      if (isLogin) {
        // Login
        const userData = await authAPI.login(email, password);
        onLogin({
          email: userData.email,
          name: userData.name,
          isAdmin: userData.isAdmin,
          _id: userData._id
        });
      } else {
        // Register
        const name = e.target.name?.value || email.split('@')[0];
        const userData = await authAPI.register(email, password, name, false);
        onLogin({
          email: userData.email,
          name: userData.name,
          isAdmin: userData.isAdmin,
          _id: userData._id
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f4f0] px-3 sm:px-4 py-6">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 md:p-10 shadow-2xl rounded-xl sm:rounded-2xl">
        <div className="flex border-b border-gray-100 mb-8">
           <button 
             onClick={() => setIsLogin(true)} 
             className={`flex-1 py-3 text-center font-bold text-sm uppercase tracking-wider transition-colors ${isLogin ? 'text-[#3a3a3a] border-b-2 border-[#d4b896]' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Login
           </button>
           <button 
             onClick={() => setIsLogin(false)} 
             className={`flex-1 py-3 text-center font-bold text-sm uppercase tracking-wider transition-colors ${!isLogin ? 'text-[#3a3a3a] border-b-2 border-[#d4b896]' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Sign Up
           </button>
        </div>

        <h2 className="text-3xl font-serif font-bold text-center mb-8 text-[#3a3a3a]">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
             <div>
                <label className="block text-xs font-bold text-[#3a3a3a] uppercase tracking-wider mb-2">Full Name</label>
                <input name="name" type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#d4b896] focus:outline-none text-sm" required />
             </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#3a3a3a] uppercase tracking-wider mb-2">Email Address</label>
            <input name="email" type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#d4b896] focus:outline-none text-sm" required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#3a3a3a] uppercase tracking-wider mb-2">Password</label>
            <input name="password" type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#d4b896] focus:outline-none text-sm" required disabled={loading} minLength={6} />
          </div>

          {isLogin && (
             <div className="flex justify-between items-center text-xs text-gray-500">
                <label className="flex items-center cursor-pointer"><input type="checkbox" className="mr-2 accent-[#d4b896]"/> Remember me</label>
                <a href="#" className="hover:text-[#d4b896] underline">Forgot Password?</a>
             </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#3a3a3a] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>
        
        {isLogin && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Default admin: admin@craftingsign.com / admin123
          </p>
        )}
      </div>
    </div>
  );
};

const AboutView = ({ onNavigate }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8f4f0] px-3 sm:px-4 py-6">
    <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-lg max-w-xl text-center w-full">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-4 text-[#3a3a3a]">About Crafting Sign</h1>
      <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
        At Crafting Sign, our journey began with a simple but powerful belief: that the true beauty of any event or space lies in the nuances. What originated as a modest passion project—fueled by a genuine love for design and typography—has naturally evolved into a dedicated studio. We have grown from a small workspace into a specialized hub for premium acrylic signage, yet we have remained steadfast in our commitment to the idea that every single detail matters. We don't just manufacture products; we pour intention into every curve and corner, ensuring that our growth never compromises the intimate attention to detail that defined our very first creation.

Our approach to manufacturing is a careful orchestration of two worlds, seamlessly blending the precision of modern technology with the soul of traditional craftsmanship. We leverage advanced cutting techniques to achieve flawless accuracy, but we rely on the artisan’s hand to finish and perfect every piece. This hybrid method allows us to transform high-quality acrylics into elegant, durable structures that feel both contemporary and timeless. It is this dedication to process that ensures every item leaving our studio meets an uncompromising standard of excellence.

Ultimately, our goal is to transcend the functional purpose of signage. We view our creations not merely as directional markers or displays, but as cherished keepsakes that capture the essence of your most important moments. Whether it is a welcoming sign for a wedding or a bespoke statement piece for a business, we strive to craft items that resonate emotionally and stand the test of time. We are proud to create pieces that aren't just signs, but lasting symbols of your unique story.
      </p>
      <button
        onClick={() => onNavigate('home')}
        className="px-6 py-3 rounded-full bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
      >
        Back to Home
      </button>
    </div>
  </div>
);

// --- CHECKOUT WITH PAYMENT FLOW (Stripe Integration) ---

const CheckoutView = ({ onNavigate, cart, currency, specialDiscount, onPlaceOrder }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    paymentMethod: 'card',
  });
  const [shipping, setShipping] = useState({
    method: 'free',
    label: 'Free Shipping',
    cost: 0,
  });
  const [processing, setProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);

  // Load Stripe
  useEffect(() => {
    const loadStripe = () => {
      if (window.Stripe) {
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!stripeKey) {
          console.warn('⚠️  Stripe publishable key not configured. Payment will not work.');
          return;
        }
        try {
          const stripeInstance = window.Stripe(stripeKey);
          setStripe(stripeInstance);
          const elementsInstance = stripeInstance.elements();
          setElements(elementsInstance);
          setStripeLoaded(true);
        } catch (error) {
          console.error('Error initializing Stripe:', error);
        }
      } else {
        // Wait for Stripe.js to load
        const checkStripe = setInterval(() => {
          if (window.Stripe) {
            clearInterval(checkStripe);
            const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
            if (stripeKey) {
              try {
                const stripeInstance = window.Stripe(stripeKey);
                setStripe(stripeInstance);
                const elementsInstance = stripeInstance.elements();
                setElements(elementsInstance);
                setStripeLoaded(true);
              } catch (error) {
                console.error('Error initializing Stripe:', error);
              }
            }
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkStripe);
          if (!stripeLoaded) {
            console.error('Stripe.js failed to load');
          }
        }, 5000);
      }
    };
    loadStripe();
  }, []);

  // Initialize card element when Stripe is loaded
  useEffect(() => {
    if (elements && form.paymentMethod === 'card') {
      const card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: 'system-ui, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });
      
      const cardElementDiv = document.getElementById('card-element');
      if (cardElementDiv) {
        card.mount('#card-element');
        setCardElement(card);
        
        // Handle card errors
        card.on('change', ({error}) => {
          const displayError = document.getElementById('card-errors');
          if (error) {
            displayError.textContent = error.message;
          } else {
            displayError.textContent = '';
          }
        });
      }
      
      return () => {
        if (card) {
          card.unmount();
        }
      };
    }
  }, [elements, form.paymentMethod]);

  const calcItemFinal = (item) => {
    const base = Number(item.price) || 0;
    const converted = convertCurrency(base, currency);
    return specialDiscount > 0 ? converted * (1 - specialDiscount / 100) : converted;
  };

  const safeCart = Array.isArray(cart) ? cart : [];
  const subtotal = safeCart.reduce((sum, item) => {
    const perUnit = calcItemFinal(item);
    const qty = item.quantity || 1;
    return sum + perUnit * qty;
  }, 0);
  const shippingConverted = convertCurrency(shipping.cost || 0, currency);
  const totalWithShipping = subtotal + shippingConverted;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'radio' ? e.target.value : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert('Please fill all required fields.');
      return;
    }
    const safeCart = Array.isArray(cart) ? cart : [];
    if (safeCart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setProcessing(true);

    try {
      // Convert currency code for Stripe (USD, EUR, GBP, INR)
      const stripeCurrency = currency.toLowerCase();

      // Create payment intent
      const { clientSecret, paymentIntentId } = await paymentsAPI.createIntent(
        totalWithShipping,
        stripeCurrency
      );

      setPaymentIntent(paymentIntentId);

      if (form.paymentMethod === 'card') {
        if (!stripe || !cardElement) {
          alert('Payment system is loading. Please wait a moment and try again.');
          setProcessing(false);
          return;
        }
        
        if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
          alert('Payment gateway is not configured. Please contact support.');
          setProcessing(false);
          return;
        }

        // Confirm payment with Stripe
        const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: {
                  line1: form.address,
                  city: form.city,
                  postal_code: form.zip,
                  country: form.country || 'US',
                },
              },
            },
          }
        );

        if (stripeError) {
          alert(`Payment failed: ${stripeError.message}`);
          setProcessing(false);
          return;
        }

        if (confirmedPayment.status === 'succeeded') {
          // Confirm payment and create order
          const result = await paymentsAPI.confirmPayment(paymentIntentId, {
            customer: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              address: form.address,
              city: form.city || '',
              country: form.country || '',
            },
            items: safeCart.map(item => ({
              productId: item._id || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              customization: item.customization,
            })),
            total: totalWithShipping,
            shipping: {
              method: shipping.method === 'fast' ? 'Fast Delivery' : 'Free Shipping',
              cost: shipping.cost,
            },
          });

          if (result.success) {
            // Clear cart and navigate
            onPlaceOrder(form, {
              shippingCost: shipping.cost,
              shippingMethod: shipping.method === 'fast' ? 'Fast Delivery' : 'Free Shipping',
              paymentStatus: 'Complete',
              items: cart,
            });
            
            alert(`Payment successful! Order ${result.order.orderId} has been confirmed.`);
            onNavigate('home');
          }
        }
      } else if (form.paymentMethod === 'paypal') {
        // For PayPal, you would integrate PayPal SDK here
        alert('PayPal integration coming soon. Please use card payment for now.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message || 'Unknown error'}`);
      setProcessing(false);
    }
  };

  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f4f0] px-4">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-xl text-center">
          <h1 className="text-3xl font-serif font-bold mb-4 text-[#3a3a3a]">Checkout</h1>
          <p className="text-sm text-gray-600 mb-6">Your cart is empty.</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 rounded-full bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4f0] py-6 sm:py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-4 sm:mb-6 text-[#3a3a3a] text-center">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h2 className="text-lg font-semibold text-[#3a3a3a] mb-2">Billing & Shipping Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    Full Name*
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    Email*
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    Phone*
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    Country
                  </label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                  Address*
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    City
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                    ZIP / PIN
                  </label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-4">
                <h3 className="text-sm font-semibold text-[#3a3a3a] mb-3 flex items-center gap-2">
                  <CreditCard size={16} /> Payment Details
                </h3>

                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={form.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="accent-[#d4b896]"
                    />
                    Card
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={form.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className="accent-[#d4b896]"
                    />
                    PayPal
                  </label>
                </div>

                {form.paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                        Card Details
                      </label>
                      {stripeLoaded ? (
                        <div 
                          id="card-element" 
                          className="p-3 border rounded-xl focus-within:border-[#d4b896] transition-colors"
                        />
                      ) : (
                        <div className="p-3 border rounded-xl bg-gray-50 text-sm text-gray-500">
                          Loading secure payment form...
                        </div>
                      )}
                      <div id="card-errors" className="text-red-500 text-xs mt-2"></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      💳 Test card: 4242 4242 4242 4242 | Expiry: Any future date | CVV: Any 3 digits
                    </p>
                  </div>
                )}

                {form.paymentMethod === 'paypal' && (
                  <div className="mt-2 p-3 border rounded-xl bg-[#f8f4f0] text-xs text-gray-700">
                    You chose <span className="font-semibold">PayPal</span>. In a real integration,
                    the PayPal popup or redirect would open here to complete the payment.
                  </div>
                )}

                <p className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
                  <Lock size={12} /> Your payment information is secure and encrypted.
                </p>

              <div className="mt-4 bg-[#f8f4f0] border border-[#e8e2d9] rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Shipping Options</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setShipping({ method: 'free', label: 'Free Shipping', cost: 0 })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${shipping.method === 'free' ? 'bg-white border-[#d4b896] text-[#3a3a3a]' : 'bg-transparent border-gray-300 text-gray-600 hover:border-[#d4b896]'}`}
                  >
                    Free Shipping
                  </button>
                  <button
                    type="button"
                    onClick={() => setShipping({ method: 'fast', label: 'Fast Shipping', cost: 35 })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${shipping.method === 'fast' ? 'bg-white border-[#d4b896] text-[#3a3a3a]' : 'bg-transparent border-gray-300 text-gray-600 hover:border-[#d4b896]'}`}
                  >
                    Fast Shipping (+$35)
                  </button>
                </div>
                <p className="text-xs text-gray-500">Current shipping: {shipping.label}</p>
              </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-xs uppercase tracking-widest font-semibold text-gray-500 hover:text-[#d4b896]"
                >
                  ← Continue Shopping
                </button>
                <button
                  type="submit"
                  disabled={processing || !stripeLoaded}
                  className="px-6 py-3 rounded-xl bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing Payment...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#3a3a3a] mb-2">Order Summary</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {safeCart.map((item, idx) => {
                const perUnit = calcItemFinal(item);
                const qty = item.quantity || 1;
                return (
                  <div key={idx} className="flex gap-3 items-center border-b pb-2">
                    <img
                      src={normalizeImageUrl(item.image)}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#3a3a3a]">{item.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.selectedSize} • {item.selectedColor} • Qty: {qty}
                      </p>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(perUnit * qty, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold">{shipping.method === 'fast' ? `${formatCurrency(shippingConverted, currency)} (Fast Delivery)` : 'Free Shipping'}</span>
              </div>
              {specialDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Offer Applied</span>
                  <span className="font-semibold text-green-600">
                    -{specialDiscount}% included
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t mt-2 text-base">
                <span className="font-bold text-[#3a3a3a]">Total</span>
                <span className="font-bold text-[#3a3a3a]">
                  {formatCurrency(totalWithShipping, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CART SIDEBAR ---

const CartSidebar = ({ isOpen, onClose, items, onRemove, currency, specialDiscount, onCheckout, selectedIndexes = [], onToggleSelect }) => {
  if (!isOpen) return null;

  // Close on mobile when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e) => {
        if (window.innerWidth < 768 && !e.target.closest('.cart-sidebar')) {
          onClose();
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const calcItemFinal = (item) => {
    const base = Number(item.price) || 0;
    const converted = convertCurrency(base, currency);
    return specialDiscount > 0 ? converted * (1 - specialDiscount / 100) : converted;
  };

  const selectedItems = selectedIndexes.length > 0 ? items.filter((_, idx) => selectedIndexes.includes(idx)) : items;

  const total = selectedItems.reduce((sum, item) => {
    const perUnit = calcItemFinal(item);
    const qty = item.quantity || 1;
    return sum + perUnit * qty;
  }, 0);

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    if (onCheckout) onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b">
          <h2 className="font-bold text-base sm:text-lg">Your Cart</h2>
          <button onClick={onClose} className="p-1" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            items.map((item, idx) => {
              const perUnit = calcItemFinal(item);
              const qty = item.quantity || 1;
              return (
                <div
                  key={idx}
                  className="flex gap-2 sm:gap-3 items-center border rounded-lg p-2 sm:p-3"
                >
                  <input
                    type="checkbox"
                    className="accent-[#d4b896] w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    checked={selectedIndexes.includes(idx)}
                    onChange={() => onToggleSelect && onToggleSelect(idx)}
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {item.selectedSize} • {item.selectedColor}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Qty: {qty}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold">
                      {formatCurrency(perUnit * qty, currency)}
                    </span>
                    <button
                      onClick={() => onRemove(idx)}
                      className="text-[10px] sm:text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t px-3 sm:px-4 py-3">
          <div className="flex justify-between text-xs sm:text-sm mb-3">
            <span className="font-medium">Total</span>
            <span className="font-bold">{formatCurrency(total, currency)}</span>
          </div>
          <button
            className="w-full bg-[#3a3a3a] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={items.length === 0 || selectedIndexes.length === 0}
            onClick={handleCheckoutClick}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN SIDEBAR (responsive) ---

const SidebarLink = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center px-4 lg:px-6 py-3 lg:py-4 rounded-xl text-sm lg:text-base font-medium transition-all duration-200 mb-1 border-l-4 ${
      activeTab === id
        ? 'bg-amber-50 text-amber-700 border-amber-600'
        : 'text-gray-700 hover:bg-gray-50 border-transparent'
    }`}
  >
    <Icon size={18} className="mr-3 flex-shrink-0" />
    <span className="xl:inline">{label}</span>
  </button>
);

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isMobileOpen, onMobileClose }) => (
  <>
    {/* Backdrop for mobile */}
    {isMobileOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onMobileClose}
      />
    )}
    <aside className={`fixed left-0 top-12 h-screen w-64 lg:w-20 xl:w-64 bg-white shadow-xl z-50 lg:z-30 transition-all duration-300 flex flex-col justify-between border-r border-gray-200 ${
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
    <div className="p-3 lg:p-4 overflow-y-auto">
      {/* Mobile header inside sidebar */}
      <div className="lg:hidden mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 px-2">
          <div className="bg-[#d4b896] w-8 h-8 flex items-center justify-center rounded-lg text-white font-bold text-base">
            CS
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-[#3a3a3a]">Crafting Sign</span>
            <span className="text-[10px] font-semibold text-amber-700">Admin Panel</span>
          </div>
        </div>
      </div>
      <div className="mb-4 px-1 lg:px-2">
        <p className="text-[9px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">
          Main Menu
        </p>
      </div>
      <SidebarLink 
        id="products" 
        icon={List} 
        label="Products" 
        activeTab={activeTab} 
        setActiveTab={(id) => {
          setActiveTab(id);
          onMobileClose();
        }} 
      />
      <SidebarLink 
        id="customers" 
        icon={Users} 
        label="Details" 
        activeTab={activeTab} 
        setActiveTab={(id) => {
          setActiveTab(id);
          onMobileClose();
        }} 
      />
      <SidebarLink 
        id="offers" 
        icon={Gift} 
        label="Special Offers" 
        activeTab={activeTab} 
        setActiveTab={(id) => {
          setActiveTab(id);
          onMobileClose();
        }} 
      />
    </div>
    {/* Close button for mobile */}
    <button
      onClick={onMobileClose}
      className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
      aria-label="Close menu"
    >
      <X size={20} />
    </button>
  </aside>
  </>
);

// --- CUSTOMER DETAILS PANEL ---

const CustomerDetailsPanel = ({ customers, orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(customers || []);

  useEffect(() => {
    if (customers) {
      setFilteredCustomers(
        customers.filter((c) =>
          c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, customers]);

  const handleDownloadReceipt = (customer) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Crafting Sign - Customer Receipt', 14, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${customer.customerName}`, 14, 30);
    doc.text(`Email: ${customer.email}`, 14, 37);
    doc.text(`Phone: ${customer.phone}`, 14, 44);
    doc.text(`Location: ${customer.location}`, 14, 51);
    doc.text(`Payment Status: ${customer.paymentStatus}`, 14, 58);

    const customerOrders = (orders || []).filter(
      (o) => o.customer === customer.customerName
    );
    const rows = customerOrders.map((o, idx) => [
      idx + 1,
      o.id,
      o.items,
      `$${o.total.toFixed(2)}`,
      o.status,
    ]);

    if (rows.length > 0) {
      autoTable(doc, {
        head: [['#', 'Order ID', 'Items', 'Total', 'Status']],
        body: rows,
        startY: 70,
      });
    } else {
      doc.text('No orders found for this customer.', 14, 72);
    }

    doc.save(`${customer.id}_receipt.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn bg-[#f8f4f0] p-4 md:p-6 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search customers..."
            className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#d4b896] text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-[#e8e2d9]">
            <tr>
              <th className="p-3 font-bold text-[#3a3a3a]">Name</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Contact</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Orders</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Total Spent</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Payment</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-[#f8f4f0]">
                <td className="p-3 font-medium">
                  <div className="flex flex-col">
                    <span>{c.customerName}</span>
                    <span className="text-[11px] text-gray-500">
                      {c.location}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-gray-600">
                  <div className="flex flex-col">
                    <span className="text-[11px] md:text-xs">{c.email}</span>
                    <span className="text-[11px]">{c.phone}</span>
                  </div>
                </td>
                <td className="p-3">{c.totalOrders}</td>
                <td className="p-3">${c.totalSpent.toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                      c.paymentStatus === 'Complete'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDownloadReceipt(c)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50 text-[11px] md:text-xs"
                  >
                    <Download size={14} />
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-xs text-gray-500"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- ORDERS PANEL ---

const OrdersPanel = ({ orders, onChangeStatus }) => {
  const latestOrders = [...(orders || [])];

  return (
    <div className="space-y-6 animate-fadeIn bg-[#f8f4f0] p-4 md:p-6 rounded-xl">
      <h2 className="text-xl md:text-2xl font-bold text-[#3a3a3a] mb-2">
        Latest Orders
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-[#e8e2d9]">
            <tr>
              <th className="p-3 font-bold text-[#3a3a3a]">Order ID</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Customer</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Items</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Total</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Status</th>
              <th className="p-3 font-bold text-[#3a3a3a]">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {latestOrders.map((o) => (
              <tr key={o._id || o.id} className="hover:bg-[#f8f4f0]">
                <td className="p-3 font-semibold">{o.orderId || o.id}</td>
                <td className="p-3">{o.customer?.name || o.customer}</td>
                <td className="p-3">{o.items?.length || o.items || 0} Items</td>
                <td className="p-3 font-bold">${Number(o.total || 0).toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                      o.status === 'Shipped' || o.status === 'Delivered'
                        ? 'bg-blue-100 text-blue-700'
                        : o.status === 'Processing'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="p-3">
                  {onChangeStatus && (
                    <select
                      value={o.status}
                      onChange={(e) => onChangeStatus(o._id || o.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {latestOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-xs text-gray-500"
                >
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- SPECIAL OFFERS PANEL ---

const SpecialOffersPanel = ({ specialDiscount, onChangeSpecialOffer, offerName, onChangeOfferName, specialOfferImage, onChangeSpecialOfferImage }) => {
  const [localValue, setLocalValue] = useState(
    specialDiscount != null ? specialDiscount : 0
  );
  const [localOfferName, setLocalOfferName] = useState(
    offerName || ''
  );
  const [localImage, setLocalImage] = useState(specialOfferImage || '');
  const [imagePreview, setImagePreview] = useState(specialOfferImage || '');

  // keep local input in sync if specialDiscount changes from outside
  useEffect(() => {
    setLocalValue(specialDiscount != null ? specialDiscount : 0);
  }, [specialDiscount]);

  useEffect(() => {
    setLocalOfferName(offerName || '');
  }, [offerName]);

  useEffect(() => {
    setLocalImage(specialOfferImage || '');
    setImagePreview(specialOfferImage || '');
  }, [specialOfferImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImagePreview(imageUrl);
        setLocalImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let num = Number(localValue);
    if (Number.isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 90) num = 90;

    onChangeSpecialOffer(num);
    onChangeOfferName(localOfferName);
    onChangeSpecialOfferImage(localImage);
    alert(`Special offer updated to ${num}%${localOfferName ? ` - ${localOfferName}` : ''}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn bg-[#f8f4f0] p-6 rounded-xl max-w-xl">
      <h2 className="text-2xl font-bold text-[#3a3a3a] mb-2">Special Offers</h2>
      <p className="text-sm text-gray-600 mb-2">
        Set a global discount percentage. This will update prices and banners
        across the main website automatically.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4 text-sm"
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Offer Name
          </label>
          <input
            type="text"
            value={localOfferName}
            onChange={(e) => setLocalOfferName(e.target.value)}
            className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
            placeholder="Enter offer name, e.g. Diwali, Holi, Christmas"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be displayed on the top bar (e.g., "Diwali Sale", "Holi Special")
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Discount Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="90"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
            placeholder="Enter percentage, e.g. 20"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: 20 will show a 20% discount on all products.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Special Offer Banner Image
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-4 text-xs cursor-pointer hover:border-[#d4b896] transition-colors">
              <Upload size={16} />
              <span>Upload Banner Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Banner preview" className="w-full h-48 object-cover" />
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This image will be displayed in the special offer section below "Shop By Category".
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
          >
            Save Offer
          </button>
        </div>
      </form>

      {specialDiscount > 0 && (
        <div className="bg-[#3a3a3a] text-white rounded-xl p-4 flex items-center gap-3">
          <Gift size={24} className="text-[#d4b896]" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4b896] font-semibold">
              {offerName || 'Current Live Offer'}
            </p>
            <p className="text-sm font-semibold">
              {specialDiscount}% off is currently applied across the storefront.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN DASHBOARD (uses shared products state) ---

const AdminDashboard = ({
  products,
  orders,
  customers,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onLogout,
  onChangeStatus,
  specialDiscount,
  onChangeSpecialOffer,
  currency,
  onCurrencyChange,
  offerName,
  onChangeOfferName,
  specialOfferImage,
  onChangeSpecialOfferImage,
}) => {
  const [activeTab, setActiveTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: 'welcome',
    price: '',
    size: '12x18',
    color: 'White',
    images: [],
    imageFiles: [], // Store actual File objects
    features: [],
    featureLabelType: 'size',
    isBestseller: false,
  });
  const [selectedUpdateCategory, setSelectedUpdateCategory] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- variant count + features helpers (same as before) ---
  const handleVariantCountChange = (e) => {
    const count = Math.max(0, Math.min(20, Number(e.target.value) || 0));
    const newFeatures = Array(count)
      .fill(null)
      .map((_, i) => {
        const existing = formData.features[i] || { size: '', color: '', price: '' };
        return { ...existing };
      });
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    const urls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: urls, // For preview
      imageFiles: files, // Store actual File objects for upload
      image: urls[0] || prev.image,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const baseExisting = isUpdate
      ? products.find((prod) => (prod._id === formData.id || prod.id === formData.id)) || {}
      : {};

    const finalPrice =
      formData.features.length > 0
        ? Number(formData.features[0].price || 0)
        : Number(formData.price || 0);

    const productData = {
      name: formData.name,
      category: formData.category,
      price: finalPrice,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      description: formData.description || '',
      isBestseller: formData.isBestseller || false,
      isNew: isUpdate ? baseExisting.isNew : true,
      features: formData.features || [],
      featureType: formData.featureLabelType || 'size',
      stock: formData.stock ? parseInt(formData.stock) : 0,
      images: formData.images || [],
      image: (formData.images && formData.images[0]) || prev?.image || ''
    };

    try {
      // Check if user is logged in before proceeding
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('You must be logged in to add products. Please log in first.');
        return;
      }

      // Use imageFiles array which contains actual File objects
      const imageFiles = formData.imageFiles && formData.imageFiles.length > 0 ? formData.imageFiles : null;

      if (isUpdate) {
        await onUpdateProduct(formData.id, productData, imageFiles);
      } else {
        // For new products, image is optional but recommended
        await onAddProduct(productData, imageFiles);
      }

      setShowForm(false);
      // Reset form after successful submission
      setFormData({
        id: '',
        name: '',
        description: '',
        category: 'welcome',
        price: '',
        originalPrice: '',
        size: '12x18',
        color: 'White',
        images: [],
        imageFiles: [],
        features: [],
        featureLabelType: 'size',
        isBestseller: false,
        stock: 0,
      });
      alert(isUpdate ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
      alert('Error saving product: ' + errorMessage);
    }
  };

  const openAddForm = () => {
    setIsUpdate(false);
    setShowForm(true);
      setFormData({
        id: '',
        name: '',
        description: '',
        category: 'welcome',
        price: '',
        originalPrice: '',
        size: '12x18',
        color: 'White',
        images: [],
        imageFiles: [],
        features: [],
        featureLabelType: 'size',
        isBestseller: false,
        stock: 0,
      });
  };

  const openUpdateForm = (product) => {
    setIsUpdate(true);
    setShowForm(true);
    setFormData({
      id: product._id || product.id,
      name: product.name,
      description: product.description || '',
      category: product.category || 'welcome',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      size: product.features?.[0]?.size || '12x18',
      color: product.features?.[0]?.color || 'White',
      images: product.images || (product.image ? [product.image] : []),
      imageFiles: [], // Reset file objects for update
      image: product.image,
      features: product.features || [],
      featureLabelType: product.featureType || 'size',
      isBestseller: product.isBestseller || false,
      stock: product.stock || 0
    });
  };

  const updateTabProducts =
    selectedUpdateCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedUpdateCategory);

  // --- small form box kept inside like before ---
  const FormBox = (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{isUpdate ? 'Update Product' : 'Add New Product'}</h3>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Product Title
          </label>
          <input
            className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Category
          </label>
          <select
            className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:border-[#d4b896]"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Description
          </label>
          <textarea
            className="w-full p-3 border rounded-xl h-24 text-sm focus:outline-none focus:border-[#d4b896]"
            placeholder="Describe the product..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Best seller flag */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!formData.isBestseller}
            onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
            className="accent-[#d4b896] h-4 w-4"
          />
          <span className="text-sm text-gray-700">Show this product in the Best Seller section</span>
        </div>

        {/* Features (same behavior as before) */}
        <div className="border p-4 rounded-xl bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="font-bold text-sm text-gray-700">Features (Variants)</label>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="inline-flex rounded-full border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, featureLabelType: 'size' }))
                  }
                  className={`px-3 py-1 ${
                    formData.featureLabelType === 'size'
                      ? 'bg-[#3a3a3a] text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Sizes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, featureLabelType: 'number' }))
                  }
                  className={`px-3 py-1 ${
                    formData.featureLabelType === 'number'
                      ? 'bg-[#3a3a3a] text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Numbers
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Variants:</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.features.length}
                  onChange={handleVariantCountChange}
                  className="w-16 p-1.5 border rounded text-xs focus:outline-none focus:border-[#d4b896]"
                />
              </div>
            </div>
          </div>

          {formData.features.length > 0 && (
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-3 text-xs font-bold bg-[#f8f4f0] border-b">
                <div className="px-3 py-2 border-r">
                  {formData.featureLabelType === 'number' ? 'Number' : 'Size'}
                </div>
                <div className="px-3 py-2 border-r">Color</div>
                <div className="px-3 py-2">Price ($)</div>
              </div>
              {formData.features.map((f, i) => (
                <div key={i} className="grid grid-cols-3 text-xs">
                  <div className="border-r p-1.5">
                    <input
                      placeholder={
                        formData.featureLabelType === 'number' ? 'e.g. 1, 2, 3' : 'e.g. 18x24'
                      }
                      className="w-full p-2 text-xs border rounded focus:outline-none focus:border-[#d4b896]"
                      value={f.size}
                      onChange={(e) => updateFeature(i, 'size', e.target.value)}
                      required
                    />
                  </div>
                  <div className="border-r p-1.5">
                    <input
                      placeholder="e.g. White"
                      className="w-full p-2 text-xs border rounded focus:outline-none focus:border-[#d4b896]"
                      value={f.color}
                      onChange={(e) => updateFeature(i, 'color', e.target.value)}
                      required
                    />
                  </div>
                  <div className="p-1.5">
                    <input
                      placeholder="e.g. 99.99"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-2 text-xs border rounded focus:outline-none focus:border-[#d4b896]"
                      value={f.price}
                      onChange={(e) => updateFeature(i, 'price', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
            Photos (up to 5)
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-4 text-xs cursor-pointer hover:border-[#d4b896]">
              <Upload size={16} />
              <span>Select images from your computer</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
            </label>
            {formData.images?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="preview"
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-xs rounded-xl bg-[#3a3a3a] text-white font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
          >
            {isUpdate ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );

  // --- choose which main content to render based on activeTab ---
  let content = null;

  if (activeTab === 'products') {
    content = (
      <div className="space-y-4">
        {showForm && FormBox}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a3a]">Products</h2>
          <button
            onClick={openAddForm}
            className="px-4 py-2 rounded-xl bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
          >
            + Add Product
          </button>
        </div>
        {/* simple list of products with edit/delete */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#e8e2d9]">
              <tr>
                <th className="p-3 font-bold text-[#3a3a3a]">Product</th>
                <th className="p-3 font-bold text-[#3a3a3a]">Category</th>
                <th className="p-3 font-bold text-[#3a3a3a]">Price</th>
                <th className="p-3 font-bold text-[#3a3a3a]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id || p.id} className="hover:bg-[#f8f4f0]">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={normalizeImageUrl(p.image)}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {CATEGORIES.find((c) => c.id === p.category)?.name || p.category}
                  </td>
                  <td className="p-3 text-sm text-gray-700">${Number(p.price || 0).toFixed(2)}</td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openUpdateForm(p)}
                        className="px-3 py-1 rounded-full border border-gray-300 text-xs hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProduct && onDeleteProduct(p._id || p.id)}
                        className="px-3 py-1 rounded-full border border-red-300 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-sm text-gray-500">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else if (activeTab === 'customers') {
    content = <CustomerDetailsPanel customers={customers} orders={orders} />;
  } else if (activeTab === 'offers') {
    content = (
      <SpecialOffersPanel
        specialDiscount={specialDiscount}
        onChangeSpecialOffer={onChangeSpecialOffer}
        offerName={offerName}
        onChangeOfferName={onChangeOfferName}
        specialOfferImage={specialOfferImage}
        onChangeSpecialOfferImage={onChangeSpecialOfferImage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4f0]">
      {/* Mobile menu button - fixed top left */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="pt-0 lg:pt-0 lg:pl-20 xl:pl-64">
        <div className="pt-16 lg:pt-4 px-3 sm:px-4 sm:pr-4 pb-6">
          <div className="max-w-6xl mx-auto">{content}</div>
        </div>
      </div>
    </div>
  );
};


// --- CONTACT VIEW (mailto real email) ---

const ContactView = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');

    const subject = encodeURIComponent(
      `New inquiry from ${name || 'Crafting Sign website'}`
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:craftingsign@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f4f0] py-6 sm:py-10 px-3 sm:px-4 flex items-center justify-center">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full p-4 sm:p-6 md:p-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-2 text-[#3a3a3a] text-center">
          Contact Us
        </h1>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-4 sm:mb-6 text-center">
          Have a question or custom request? Send us a message and we’ll reply
          as soon as possible.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-700">
                Name
              </label>
              <input
                name="name"
                className="w-full p-3 border rounded-xl focus:outline-none focus:border-[#d4b896]"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-3 border rounded-xl focus:outline-none focus:border-[#d4b896]"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              rows="4"
              required
              className="w-full p-3 border rounded-xl focus:outline-none focus:border-[#d4b896] resize-none"
              placeholder="Tell us about your event or question..."
            />
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- FLOATING WHATSAPP BUTTON ---

const FloatingWhatsAppButton = () => {
  const message = encodeURIComponent(
    "Hi! I visited your Crafting Sign website and I have a query."
  );
  const link = `https://wa.me/919079199046?text=${message}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={24} className="text-white" />
    </a>
  );
};

// --- ROOT APP (shared products state, fixes updates) ---

// Small wrapper to read :id for category
const CategoryWrapper = ({ products, currency, specialDiscount }) => {
  const { id } = useParams();
  const category = id || 'all';
  const navigate = useNavigate();

  const handleNavigate = (view, payload) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'category': {
        const catId = payload || 'all';
        navigate(`/category/${catId}`);
        break;
      }
      case 'product': {
        const prod = payload;
        if (prod?.id != null) navigate(`/product/${prod.id}`);
        break;
      }
      case 'login':
        navigate('/login');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'checkout':
        navigate('/checkout');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <CategoryView
      category={category}
      products={products}
      onNavigate={handleNavigate}
      currency={currency}
      specialDiscount={specialDiscount}
    />
  );
};

// Wrapper for product detail route
const ProductWrapper = ({ products, currency, specialDiscount, onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => String(p._id || p.id) === String(id));

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f4f0] px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-serif font-bold mb-2 text-[#3a3a3a]">
            Product Not Found
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            The product you are looking for does not exist or was removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#d4b896] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      products={products}
      onBack={() => navigate(-1)}
      onAddToCart={onAddToCart}
      currency={currency}
      specialDiscount={specialDiscount}
    />
  );
};


// ------------------- APP SHELL (Router-based) -------------------

const AppShell = () => {
  const navigate = useNavigate();

  // --- STATE ---

  const [cart, setCart] = useState([]);
  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem('cs_currency');
    return stored || 'USD';
  });

  const [specialDiscount, setSpecialDiscount] = useState(() => {
    const stored = localStorage.getItem('cs_specialDiscount');
    const num = stored != null ? Number(stored) : 0;
    return Number.isNaN(num) ? 0 : num;
  });

  const [offerName, setOfferName] = useState(() => {
    const stored = localStorage.getItem('cs_offerName');
    return stored || '';
  });

  const [specialOfferImage, setSpecialOfferImage] = useState(() => {
    const stored = localStorage.getItem('cs_specialOfferImage');
    return stored || 'https://i.pinimg.com/1200x/17/82/a9/1782a98add04ec24ee2145f9baf43e76.jpg';
  });

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCartIndexes, setSelectedCartIndexes] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const aboutRef = useRef(null);
  const footerRef = useRef(null);

  // --- RESTORE USER SESSION ---
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser({
            email: userData.email,
            name: userData.name,
            isAdmin: userData.isAdmin,
            _id: userData._id
          });
        } catch (error) {
          // Token is invalid, remove it
          removeToken();
          setUser(null);
        }
      }
    };
    restoreSession();
  }, []);

  // --- FETCH DATA FROM API ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Always fetch products (public)
        const productsData = await productsAPI.getAll().catch((err) => {
          console.error('Error fetching products:', err);
          return [];
        });
        // Ensure productsData is always an array
        const normalizedProducts = Array.isArray(productsData) 
          ? productsData 
          : (productsData?.products || productsData?.data || []);
        setProducts(normalizedProducts);
        
        // Only fetch admin data if user is logged in and is admin
        if (user?.isAdmin) {
          try {
            const [ordersData, customersData] = await Promise.all([
              ordersAPI.getAll().catch(() => []),
              customersAPI.getAll().catch(() => [])
            ]);
            // Ensure data is always an array
            const normalizedOrders = Array.isArray(ordersData) 
              ? ordersData 
              : (ordersData?.orders || ordersData?.data || []);
            const normalizedCustomers = Array.isArray(customersData) 
              ? customersData 
              : (customersData?.customers || customersData?.data || []);
            setOrders(normalizedOrders);
            setCustomers(normalizedCustomers);
          } catch (adminError) {
            // Silently handle admin data fetch errors
            console.error('Error fetching admin data:', adminError);
            setOrders([]);
            setCustomers([]);
          }
        } else {
          // Clear admin data if user is not admin
          setOrders([]);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Ensure arrays are set even on error
        setProducts([]);
        setOrders([]);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    // Ensure cart is always an array before mapping
    if (Array.isArray(cart)) {
      setSelectedCartIndexes(cart.map((_, idx) => idx));
      if (cart.length === 0) {
        setCheckoutItems([]);
      }
    } else {
      setSelectedCartIndexes([]);
      setCheckoutItems([]);
    }
  }, [cart]);

  // --- PERSIST TO LOCALSTORAGE ---

  useEffect(() => {
    localStorage.setItem('cs_specialDiscount', String(specialDiscount));
  }, [specialDiscount]);

  useEffect(() => {
    localStorage.setItem('cs_offerName', offerName);
  }, [offerName]);

  useEffect(() => {
    if (specialOfferImage) {
      localStorage.setItem('cs_specialOfferImage', specialOfferImage);
    }
  }, [specialOfferImage]);

  useEffect(() => {
    localStorage.setItem('cs_currency', currency);
  }, [currency]);

  // --- NAVIGATION HELPER (replaces old currentView) ---

  const handleNavigate = (view, payload) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;

      case 'category': {
        const catId = payload || 'all';
        navigate(`/category/${catId}`);
        break;
      }

      case 'product': {
        // payload may be a product object or just an id
        const product = typeof payload === 'object' ? payload : { id: payload };
        const id = product._id || product.id;
        navigate(`/product/${id}`);
        break;
      }

      case 'login':
        navigate('/login');
        break;

      case 'about':
        navigate('/about');
        break;

      case 'contact':
        navigate('/contact');
        break;

      case 'checkout':
        navigate('/checkout');
        break;

      case 'admin':
        navigate('/admin');
        break;

      default:
        navigate('/');
        break;
    }
  };

  // --- CART HANDLERS ---

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (p) =>
          (p._id || p.id) === (item._id || item.id) &&
          p.selectedSize === item.selectedSize &&
          p.selectedColor === item.selectedColor &&
          p.customization === item.customization
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: (updated[index].quantity || 1) + (item.quantity || 1),
        };
        return updated;
      }

      return [...prev, { ...item }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleCartSelection = (index) => {
    setSelectedCartIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCheckoutFromCart = () => {
    const safeCart = Array.isArray(cart) ? cart : [];
    const selected = safeCart.filter((_, idx) => selectedCartIndexes.includes(idx));
    if (selected.length === 0) {
      alert('Select at least one product to proceed to checkout.');
      return;
    }
    setCheckoutItems(selected);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // --- ORDER / CUSTOMER HANDLING ---

  const handlePlaceOrder = async (form, options = {}) => {
    try {
      const {
        items = cart,
        shippingCost = 0,
        shippingMethod = 'Free Shipping',
        paymentStatus = 'Pending',
      } = options;

      const itemsCount = items.reduce(
        (s, it) => s + (it.quantity || 1),
        0
      );

      const totalWithoutShipping = items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (it.quantity || 1),
        0
      );
      const total = totalWithoutShipping + (Number(shippingCost) || 0);

      const orderData = {
        customer: {
          name: form.name || form.email,
          email: form.email,
          phone: form.phone,
          address: `${form.address}${form.city ? ', ' + form.city : ''}${form.country ? ', ' + form.country : ''}`,
          city: form.city || '',
          country: form.country || ''
        },
        items: items.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          customization: item.customization
        })),
        total,
        shipping: {
          method: shippingMethod,
          cost: Number(shippingCost) || 0,
        },
        status: paymentStatus === 'Paid' ? 'Processing' : 'Pending',
        paymentStatus
      };

      await ordersAPI.create(orderData);
      setCart([]);
      setCheckoutItems([]);
      
      // Refresh orders if admin
      if (user?.isAdmin) {
        try {
          const updatedOrders = await ordersAPI.getAll();
          const normalizedOrders = Array.isArray(updatedOrders) 
            ? updatedOrders 
            : (updatedOrders?.orders || updatedOrders?.data || []);
          setOrders(normalizedOrders);
          
          const updatedCustomers = await customersAPI.getAll();
          const normalizedCustomers = Array.isArray(updatedCustomers) 
            ? updatedCustomers 
            : (updatedCustomers?.customers || updatedCustomers?.data || []);
          setCustomers(normalizedCustomers);
        } catch (refreshError) {
          console.error('Error refreshing admin data:', refreshError);
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  // --- PRODUCT CRUD FOR ADMIN ---

  const handleAddProduct = async (productData, imageFiles) => {
    try {
      const newProduct = await productsAPI.create(productData, imageFiles);

      // attach frontend-provided images (if any) to the returned product so UI shows them immediately
      if (productData && productData.images && productData.images.length > 0) {
        newProduct.images = productData.images;
        newProduct.image = productData.images[0] || newProduct.image;
      }
      setProducts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, newProduct];
      });
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (id, productData, imageFiles) => {
    try {
      const updated = await productsAPI.update(id, productData, imageFiles);

      // ensure images from the admin form are preserved on the updated product
      if (productData && productData.images && productData.images.length > 0) {
        updated.images = productData.images;
        updated.image = productData.images[0] || updated.image;
      }
      setProducts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map((p) => (p._id === id || p.id === id ? updated : p));
      });
      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productsAPI.delete(id);
      setProducts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((p) => (p._id !== id && p.id !== id));
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // --- AUTH ---

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setUser(null);
    removeToken();
    navigate('/');
  };

  const handleChangeStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      const updatedOrders = await ordersAPI.getAll();
      const normalizedOrders = Array.isArray(updatedOrders) 
        ? updatedOrders 
        : (updatedOrders?.orders || updatedOrders?.data || []);
      setOrders(normalizedOrders);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // --- OTHER HANDLERS ---

  const handleCurrencyChange = (curr) => setCurrency(curr);

  const handleChangeSpecialOffer = (value) => {
    setSpecialDiscount(value);
    localStorage.setItem('cs_specialDiscount', String(value));
  };

  const handleChangeOfferName = (name) => {
    setOfferName(name);
    localStorage.setItem('cs_offerName', name);
  };

  const handleChangeSpecialOfferImage = (imageUrl) => {
    setSpecialOfferImage(imageUrl);
    localStorage.setItem('cs_specialOfferImage', imageUrl);
  };

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  // --- RENDER ---

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar specialDiscount={specialDiscount} offerName={offerName} />
      <UserNavigation
        cartCount={(Array.isArray(cart) ? cart : []).reduce((s, item) => s + (item.quantity || 1), 0)}
        onNavigate={handleNavigate}
        onOpenCart={handleOpenCart}
        user={user}
        onLogout={handleLogout}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                onNavigate={handleNavigate}
                products={products}
                aboutRef={aboutRef}
                currency={currency}
                specialDiscount={specialDiscount}
                offerName={offerName}
                specialOfferImage={specialOfferImage}
              />
            }
          />

          <Route
            path="/category/:id"
            element={
              <CategoryWrapper
                products={products}
                currency={currency}
                specialDiscount={specialDiscount}
              />
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProductWrapper
                products={products}
                currency={currency}
                specialDiscount={specialDiscount}
                onAddToCart={handleAddToCart}
              />
            }
          />

          <Route
            path="/login"
            element={<LoginView onLogin={handleLogin} />}
          />

          <Route
            path="/about"
            element={<AboutView onNavigate={handleNavigate} />}
          />

          <Route path="/contact" element={<ContactView />} />

          <Route
            path="/checkout"
            element={
              <CheckoutView
                onNavigate={handleNavigate}
                cart={checkoutItems.length ? checkoutItems : cart}
                currency={currency}
                specialDiscount={specialDiscount}
                onPlaceOrder={handlePlaceOrder}
              />
            }
          />

          <Route
            path="/admin"
            element={
              user?.isAdmin ? (
                <AdminDashboard
                  products={products}
                  orders={orders}
                  customers={customers}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onChangeStatus={handleChangeStatus}
                  onLogout={handleLogout}
                  specialDiscount={specialDiscount}
                  onChangeSpecialOffer={handleChangeSpecialOffer}
                  currency={currency}
                  onCurrencyChange={handleCurrencyChange}
                  offerName={offerName}
                  onChangeOfferName={handleChangeOfferName}
                  specialOfferImage={specialOfferImage}
                  onChangeSpecialOfferImage={handleChangeSpecialOfferImage}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!location.pathname.includes('/admin') && (
        <Footer footerRef={footerRef} onNavigate={handleNavigate} />
      )}
      <FloatingWhatsAppButton />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        items={cart}
        onRemove={handleRemoveCartItem}
        currency={currency}
        specialDiscount={specialDiscount}
        onCheckout={handleCheckoutFromCart}
        selectedIndexes={selectedCartIndexes}
        onToggleSelect={handleToggleCartSelection}
      />
    </div>
  );
};

// ------------ ROOT APP (wraps AppShell in BrowserRouter) ------------

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;