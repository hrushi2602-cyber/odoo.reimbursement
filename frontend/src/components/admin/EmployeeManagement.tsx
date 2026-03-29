import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Table } from '../ui/Table';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import api from '../../api';

// Mocked storage logic for Employees
const getEmployees = () => JSON.parse(localStorage.getItem('mock_employees') || '[]');
const saveEmployees = (emps: any[]) => localStorage.setItem('mock_employees', JSON.stringify(emps));

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', manager_id: '', role: 'employee' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const data = getEmployees();
    if (data.length === 0) {
      // Seed initial dummy data if empty
      const initial = [
        { id: '101', name: 'Alice Smith', email: 'alice@example.com', role: 'employee' },
        { id: '102', name: 'Bob Jones', email: 'bob@example.com', role: 'employee' },
      ];
      saveEmployees(initial);
      setEmployees(initial);
    } else {
      setEmployees(data);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const updated = employees.filter(e => e.id !== id);
      saveEmployees(updated);
      setEmployees(updated);
      toast.success('Employee deleted successfully.');
    }
  };

  const handleEdit = (emp: any) => {
    setFormData({ name: emp.name, email: emp.email, role: 'employee', password: '', manager_id: '' });
    setEditingId(emp.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (editingId) {
      const updated = employees.map(emp => 
        emp.id === editingId ? { ...emp, ...formData } : emp
      );
      saveEmployees(updated);
      setEmployees(updated);
      toast.success('Employee updated successfully.');
      closeModal();
      setIsLoading(false);
    } else {
      try {
        const response = await api.post('/create-user', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'employee',
          manager_id: parseInt(formData.manager_id)
        });
        
        const dbUser = response.data;
        const newEmp = {
          id: dbUser.id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        };
        const updated = [...employees, newEmp];
        saveEmployees(updated);
        setEmployees(updated);
        toast.success('Employee created in DB successfully.');
        closeModal();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Failed to create employee in DB.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', manager_id: '', role: 'employee' });
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name", cell: (r: any) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role", cell: (r: any) => <span className="capitalize text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs">{r.role}</span> },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <Card noPadding>
      <CardHeader 
        title="Employee Directory" 
        subtitle="Manage all employee records within the organization."
        className="p-6 pb-0 mb-4"
        action={
          <Button onClick={() => setIsModalOpen(true)}>Add Employee</Button>
        }
      />
      <Table columns={columns} data={employees} keyExtractor={item => item.id} />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Employee" : "Add New Employee"}>
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
          {!editingId && (
            <>
              <Input 
                label="Password" 
                type="password" 
                required 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
              />
              <Input 
                label="Manager ID" 
                type="number" 
                required 
                value={formData.manager_id} 
                onChange={e => setFormData({ ...formData, manager_id: e.target.value })} 
              />
            </>
          )}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isLoading}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>{editingId ? 'Save Changes' : 'Create Employee'}</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default EmployeeManagement;
