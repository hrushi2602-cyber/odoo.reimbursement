import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ManagerManagement from '../components/admin/ManagerManagement';
import RulesManagement from '../components/admin/RulesManagement';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Configure system rules and manage users.</p>
      </div>

      <div className="border-b border-slate-200 mb-6 pb-px flex">
         <nav className="-mb-px flex space-x-6 h-full" aria-label="Tabs">
            <NavLink
              to="/admin/employees"
              className={({ isActive }) =>
                clsx(
                  "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )
              }
            >
              Employees
            </NavLink>
            <NavLink
              to="/admin/managers"
              className={({ isActive }) =>
                clsx(
                  "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )
              }
            >
              Managers
            </NavLink>
            <NavLink
              to="/admin/rules"
              className={({ isActive }) =>
                clsx(
                  "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )
              }
            >
              Expense Rules
            </NavLink>
          </nav>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/employees" replace />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="managers" element={<ManagerManagement />} />
          <Route path="rules" element={<RulesManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
