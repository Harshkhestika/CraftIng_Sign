import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, User, Check } from 'lucide-react';

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState("");
  const [size, setSize] = useState("18x24");

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white py-12 animate-fadeIn">
      <div className="container mx-auto px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-8 font-medium transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-[#f8f4f0] rounded-3xl overflow-hidden shadow-sm">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h1 className="text-4xl font-serif font-bold text-[#3a3a3a] mb-3">{product.name}</h1>
              <span className="text-3xl font-bold text-amber-600">${product.price}</span>
              <p className="text-gray-600 leading-relaxed mt-4">{product.description}</p>
            </div>

            <div className="bg-[#f8f4f0] p-6 rounded-2xl mb-8 space-y-5 border border-[#e8e2d9]">
              <h3 className="font-bold text-[#3a3a3a] flex items-center gap-2"><User size={18} /> Personalization</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Choose Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {['12x18 inches', '18x24 inches'].map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${size === s ? 'border-amber-500 bg-white text-amber-600' : 'border-gray-200 text-gray-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Custom Text</label>
                <textarea className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500" rows="3" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter names, dates..."></textarea>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl bg-white w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-4 hover:text-amber-600"><Minus size={18}/></button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-4 hover:text-amber-600"><Plus size={18}/></button>
              </div>
              <button onClick={() => onAddToCart({...product, quantity, selectedSize: size, customization: customText})} className="flex-1 bg-[#3a3a3a] text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-all shadow-lg flex justify-center items-center gap-2">
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-600 text-sm"><Check size={16} /> In Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;