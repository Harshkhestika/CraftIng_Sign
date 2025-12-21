import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import CustomerDetails from './CustomerDetails';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../../mockData';

const AdminDashboard = ({ products, orders, customers, onAddProduct, onDeleteProduct, onChangeStatus, onLogout }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [newProd, setNewProd] = useState({ name: '', category: 'welcome', price: '', image: '' });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProd({ ...newProd, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddProduct({ ...newProd, id: Date.now() });
    setNewProd({ name: '', category: 'welcome', price: '', image: '' });
    alert("Product Added Successfully");
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="flex pt-16">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
        <main className="flex-1 p-6 md:p-8 ml-20 lg:ml-64 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize border-b border-gray-200 pb-4">
            {activeTab === 'products' ? 'Product Inventory' : activeTab === 'orders' ? 'Order Management' : 'Customer Database'}
          </h2>

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><Plus size={18} className="text-amber-600" /> Add New Product</h3>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <input className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" placeholder="Product Name" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} required />
                  <select className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="number" className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" placeholder="Price" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} required />
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">Click to upload (Local File)</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {newProd.image && <div className="mt-2 h-20 w-full bg-gray-100 rounded overflow-hidden border"><img src={newProd.image} alt="Preview" className="w-full h-full object-cover" /></div>}
                  </div>
                  <button type="submit" className="w-full bg-amber-700 text-white py-2.5 rounded-lg font-bold hover:bg-amber-800 transition-colors shadow-sm">Publish Product</button>
                </form>
              </div>

              <div className="xl:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 rounded object-cover border border-gray-200" alt=""/>
                          <span className="font-medium text-gray-800">{p.name}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 capitalize">{p.category}</td>
                        <td className="p-4 font-bold text-amber-600">${p.price}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => onDeleteProduct(p.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-fadeIn">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Items</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm text-gray-500">#{o.id}</td>
                      <td className="p-4 font-medium text-gray-800">{o.customer}</td>
                      <td className="p-4 text-sm text-gray-600">{o.items} Items</td>
                      <td className="p-4 font-bold text-gray-800">${o.total}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{o.status}</span>
                      </td>
                      <td className="p-4">
                        <select value={o.status} onChange={(e) => onChangeStatus(o.id, e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'customers' && (
            <CustomerDetails customers={customers} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;