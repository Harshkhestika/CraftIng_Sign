import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose, items, onRemove }) => {
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className={`fixed inset-0 z-[100] ${isOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        <div className="p-6 border-b flex justify-between items-center bg-[#f8f4f0]">
          <h2 className="text-xl font-serif font-bold text-[#3a3a3a]">Shopping Cart ({items.length})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="bg-gray-50 p-6 rounded-full"><ShoppingBag size={48} /></div>
              <p className="font-medium">Your cart is currently empty.</p>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0"><img src={item.image} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[#3a3a3a] leading-tight">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.selectedSize}</p>
                    {item.customization && <p className="text-xs text-gray-400 italic">"{item.customization}"</p>}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-500">Qty: <span className="font-bold text-[#3a3a3a]">{item.quantity}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-600">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => onRemove(i)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-white space-y-4">
            <div className="flex justify-between items-center text-lg font-bold text-[#3a3a3a]"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <button className="w-full bg-[#3a3a3a] text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors shadow-lg">Checkout Now</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CartSidebar;