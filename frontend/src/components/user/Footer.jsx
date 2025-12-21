import React from 'react';
import { Facebook, Instagram, Twitter, ChevronRight, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => (
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
export default Footer;