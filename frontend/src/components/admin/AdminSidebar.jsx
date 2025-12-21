import React from 'react';
import { Package, List, Users } from 'lucide-react';

const SidebarLink = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
      activeTab === id 
        ? 'bg-amber-100 text-amber-700 border-l-4 border-amber-600 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} className="mr-3" />
    <span className="hidden lg:inline">{label}</span>
  </button>
);

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="fixed left-0 top-10 h-[calc(100vh-4rem)] w-20 lg:w-64 bg-white shadow-xl z-40 transition-all duration-300 flex flex-col justify-between border-r border-gray-200">
      <div className="p-4">
        <div className="mb-6 px-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Main Menu</p>
        </div>
        <SidebarLink id="products" icon={Package} label="Products" activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarLink id="orders" icon={List} label="Orders" activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarLink id="customers" icon={Users} label="Customer Details" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </aside>
  );
};
export default AdminSidebar;