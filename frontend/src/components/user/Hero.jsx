import React from 'react';
import { Star } from 'lucide-react';

const Hero = ({ onCta }) => (
  <div className="relative py-24 bg-[#f8f4f0] overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col md:flex-row items-center relative">
        <div className="md:w-2/3 space-y-6 text-center md:text-left">
          <h1 className="text-5xl font-serif font-bold text-[#3a3a3a]">Premium Acrylic <br/> Wedding Signs</h1>
          <p className="text-lg text-gray-600">Crafted with precision. Designed for elegance. Make your special day unforgettable.</p>
          <button onClick={onCta} className="bg-[#3a3a3a] text-white px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors shadow-lg">Shop Collection</button>
        </div>
        <div className="md:w-[35%] relative md:absolute md:left-[65%] md:top-1/2 md:-translate-y-1/2">
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
  </div>
);
export default Hero;