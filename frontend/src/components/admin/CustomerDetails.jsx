import React, { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerDetails = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(customers);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter(c => 
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, customers]);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("Crafting Sign - Customer Report", 14, 16);
    const tableHead = [["ID", "Name", "Email", "Location", "Orders", "Spent", "Status"]];
    const tableBody = filteredCustomers.map(c => [
      c.id, c.customerName, c.email, c.location, c.totalOrders, "$" + c.totalSpent.toFixed(2), c.status
    ]);
    autoTable(doc, {
      startY: 22, head: tableHead, body: tableBody, theme: 'grid', headStyles: { fillColor: [217, 119, 6] }
    });
    doc.save('customer-report.pdf');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <button onClick={handleDownloadReport} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
          <FileText size={18} /> Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Customer", "Contact", "Location", "Orders", "Spent", "Status", "Payment"].map(h => (
                  <th key={h} className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{c.customerName}</div>
                    <div className="text-xs text-gray-500 font-mono">{c.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{c.email}</div>
                    <div className="text-xs text-gray-400">{c.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.location}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{c.totalOrders}</span></td>
                  <td className="px-6 py-4 font-bold text-amber-600">${c.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.paymentStatus === 'Complete' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.paymentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;