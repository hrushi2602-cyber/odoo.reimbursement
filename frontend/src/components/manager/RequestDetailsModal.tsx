import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import api from '../../api';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any | null;
  onActionComplete: () => void;
  managerId: string;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ 
  isOpen, onClose, claim, onActionComplete, managerId 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!claim) return null;

  const handleAction = async (status: 'approved' | 'rejected') => {
    setIsLoading(true);
    try {
      await api.patch(`/manager/claims/${claim.id}/status`, {
        manager_id: parseInt(managerId),
        status,
      });
      toast.success(`Claim ${status} successfully!`);
      onActionComplete();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to ${status} claim`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review Claim #${claim.id}`}>
      <div className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Employee ID</span>
            <span className="text-slate-800 font-semibold">{claim.employee_id}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Status</span>
            <span className="capitalize font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full text-xs inline-block">
              {claim.status}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Amount</span>
            <span className="text-xl font-bold text-primary-600">${claim.amount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Requires Direct Manager</span>
            <span className="text-slate-800">{claim.is_manager_required ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Description</h4>
          <p className="text-slate-600 text-sm whitespace-pre-wrap">{claim.description}</p>
        </div>
        
        {claim.required_approvers?.length > 0 && (
          <div>
             <h4 className="text-sm font-semibold text-slate-800 mb-2">Approval Chain</h4>
             <div className="flex flex-wrap gap-2">
                {claim.required_approvers.map((app_id: number) => (
                  <span key={app_id} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">
                    Approver ID: {app_id}
                  </span>
                ))}
             </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={() => handleAction('rejected')}
            isLoading={isLoading}
          >
            Reject
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={() => handleAction('approved')}
            isLoading={isLoading}
          >
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
};
