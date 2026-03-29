import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Table } from '../ui/Table';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import api from '../../api';

// Mocked storage logic for Managers
const getManagers = () => JSON.parse(localStorage.getItem('mock_managers') || '[]');
const saveManagers = (mgrs: any[]) => localStorage.setItem('mock_managers', JSON.stringify(mgrs));

const ManagerManagement: React.FC = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const data = getManagers();
    if (data.length === 0) {
      const initial = [
        { id: '1', name: 'Sarah Connor', department: 'Engineering', assigned_employees: 4 },
        { id: '2', name: 'John Connor', department: 'Sales', assigned_employees: 2 },
      ];
      saveManagers(initial);
      setManagers(initial);
    } else {
      setManagers(data);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/create-user', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'manager'
      });
      
      const dbUser = response.data;
      
      const newMgr = {
        id: dbUser.id.toString(),
        name: dbUser.name,
        department: formData.department,
        assigned_employees: 0
      };
      
      const updated = [...managers, newMgr];
      saveManagers(updated);
      setManagers(updated);
      toast.success('Manager created in DB successfully.');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', department: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create manager in DB.');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: "Manager ID", accessor: "id", cell: (r: any) => <span className="font-mono text-slate-500">{r.id}</span> },
    { header: "Name", accessor: "name", cell: (r: any) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { header: "Department", accessor: "department" },
    { header: "Assigned Reporters", accessor: "assigned_employees" },
  ];

  return (
    <Card noPadding>
      <CardHeader 
        title="Manager Roster" 
        subtitle="View and assign managers to different departments."
        className="p-6 pb-0 mb-4"
        action={
          <Button onClick={() => setIsModalOpen(true)}>Add Manager</Button>
        }
      />
      <Table columns={columns} data={managers} keyExtractor={item => item.id} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Manager">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Name" 
            required 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
          />
          <Input 
            label="Email" 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            value={formData.password} 
            onChange={e => setFormData({ ...formData, password: e.target.value })} 
          />
          <Input 
            label="Department" 
            required 
            value={formData.department} 
            onChange={e => setFormData({ ...formData, department: e.target.value })} 
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create Manager</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default ManagerManagement;
