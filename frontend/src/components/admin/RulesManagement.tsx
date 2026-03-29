import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import api from '../../api';

const RulesManagement: React.FC = () => {
  const [formData, setFormData] = useState({
    min_range: '',
    max_range: '',
    is_manager_approver: false,
    approver_ids_str: '',
    is_sequential: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Prompt requested: Array fields -> Textbox (comma-separated values)
    const approver_ids = formData.approver_ids_str
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(Number); // Assuming IDs are numbers based on backend schema

    try {
      await api.post('/admin/create-rule', {
        min_range: parseFloat(formData.min_range),
        max_range: parseFloat(formData.max_range),
        is_manager_approver: formData.is_manager_approver,
        approver_ids: approver_ids,
        is_sequential: formData.is_sequential,
      });

      toast.success('Expense rule created successfully!');
      setFormData({
        min_range: '',
        max_range: '',
        is_manager_approver: false,
        approver_ids_str: '',
        is_sequential: false
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card>
      <CardHeader 
        title="Create Approval Rule" 
        subtitle="Define workflow logic, threshold amounts, and multi-level approvals."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Minimum Amount ($)" 
            type="number" 
            name="min_range"
            step="0.01"
            required 
            value={formData.min_range} 
            onChange={handleChange}
            placeholder="0.00"
          />
          <Input 
            label="Maximum Amount ($)" 
            type="number" 
            name="max_range"
            step="0.01"
            required 
            value={formData.max_range} 
            onChange={handleChange}
            placeholder="99999.00"
          />
        </div>

        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4">
          <h4 className="text-sm font-semibold text-slate-800">Conditions & Flow</h4>
          
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              name="is_manager_approver"
              checked={formData.is_manager_approver}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <div>
              <span className="block text-sm font-medium text-slate-800 group-hover:text-primary-600 transition-colors">Requires Direct Manager Approval</span>
              <span className="block text-xs text-slate-500">The employee's assigned manager must approve this class of claim.</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              name="is_sequential"
              checked={formData.is_sequential}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <div>
              <span className="block text-sm font-medium text-slate-800 group-hover:text-primary-600 transition-colors">Sequential Approval Flow</span>
              <span className="block text-xs text-slate-500">Approvals happen sequentially based on the order defined below.</span>
            </div>
          </label>
        </div>

        <Input 
          label="Additional Rule Approvers (Array Field)" 
          type="text" 
          name="approver_ids_str"
          value={formData.approver_ids_str} 
          onChange={handleChange}
          placeholder="e.g. 1, 4, 7"
          helperText="Enter user IDs separated by commas. These users will be added to the approval loop."
        />

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" size="lg" isLoading={isLoading}>Save Rule Definition</Button>
        </div>
      </form>
    </Card>
  );
};

export default RulesManagement;
