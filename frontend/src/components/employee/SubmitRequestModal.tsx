import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import api from '../../api';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
}

export const SubmitRequestModal: React.FC<SubmitRequestModalProps> = ({ 
  isOpen, onClose, onSuccess, employeeId 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/employee/submit-reimbursement', {
        employee_id: parseInt(employeeId),
        amount: parseFloat(formData.amount),
        description: formData.description,
      });
      toast.success('Reimbursement request submitted successfully!');
      onSuccess();
      onClose();
      setFormData({ amount: '', description: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit New Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount ($)"
          type="number"
          name="amount"
          step="0.01"
          required
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
        />
        
        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the expense..."
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Note: Backend schema doesn't seem to actively use file attachments natively, so we keep attachments out for now or just mock it */}
        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Attachments (Optional)
          </label>
          <input 
            type="file" 
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors cursor-pointer"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
