import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  FileText, 
  Settings, 
  Users, 
  UserPlus
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  role: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  
  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin/employees', label: 'Employees', icon: Users },
          { to: '/admin/managers', label: 'Managers', icon: UserPlus },
          { to: '/admin/rules', label: 'Rules', icon: Settings },
        ];
      case 'manager':
        return [
          { to: '/manager', label: 'Dashboard', icon: Home },
        ];
      case 'employee':
        return [
          { to: '/employee', label: 'My Applications', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Building2 className="w-8 h-8 text-primary-600 mr-3" />
        <span className="text-xl font-bold text-slate-800">Expensify</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon className="mr-3 w-5 h-5 flex-shrink-0" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Logged in as: <span className="text-primary-600">{role}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
