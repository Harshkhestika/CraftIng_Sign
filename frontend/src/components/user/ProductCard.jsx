import React from 'react';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product, onClick }) => (
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
export default ProductCard;