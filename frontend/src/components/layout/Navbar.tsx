import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm z-10">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex text-slate-800">
          <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            U
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-red-600 transition-colors ml-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
