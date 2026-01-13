import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            C
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CodeHub
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer active:cursor-grabbing">
              Home
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors cursor-pointer active:cursor-grabbing"
            >
              Login
            </button>
            <Button onClick={()=> navigate('/Signup')} variant="primary" className="!py-2 !px-5 text-sm shadow-blue-500/25">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
