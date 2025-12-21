import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const LoginView = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userData = await authAPI.login(email, password);
      onLogin({
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin,
        _id: userData._id
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f4f0] px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-lg outline-none focus:border-amber-500" 
            required 
            disabled={loading}
          />
          <input 
            name="password"
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded-lg outline-none focus:border-amber-500" 
            required 
            disabled={loading}
          />
          <button 
            type="submit" 
            className="w-full bg-[#3a3a3a] text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Default admin: admin@craftingsign.com / admin123
        </p>
      </div>
    </div>
  );
};
export default LoginView;