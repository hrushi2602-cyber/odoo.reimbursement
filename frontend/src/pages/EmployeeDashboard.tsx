import React, { useEffect, useState } from 'react';
import { PlusCircle, FileText } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { SubmitRequestModal } from '../components/employee/SubmitRequestModal';
import clsx from 'clsx';
import api from '../api';
import toast from 'react-hot-toast';

const EmployeeDashboard: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const employeeId = localStorage.getItem('user_id');

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/employee/my-claims/${employeeId}`);
      setClaims(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchClaims();
  }, [employeeId]);

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    
    return (
      <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize", statusMap[status.toLowerCase()] || "bg-slate-100 text-slate-800 border-slate-200")}>
        {status}
      </span>
    );
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Description", accessor: "description", cell: (r: any) => <span className="font-medium text-slate-800 truncate block max-w-xs">{r.description}</span> },
    { header: "Amount", accessor: "amount", cell: (r: any) => `$${r.amount.toFixed(2)}` },
    { header: "Manager Required", accessor: "is_manager_required", cell: (r: any) => r.is_manager_required ? 'Yes' : 'No' },
    { header: "Status", accessor: "status", cell: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your reimbursement requests.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex-shrink-0">
          <PlusCircle className="w-5 h-5 mr-2" />
          Submit New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-transparent">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-primary-100 text-sm font-medium">Total Approved</p>
               <h3 className="text-3xl font-bold mt-1">
                 ${claims.filter(c => c.status.toLowerCase() === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
               </h3>
             </div>
             <div className="p-2 bg-white/20 rounded-lg">
               <FileText className="w-6 h-6 text-white" />
             </div>
           </div>
        </Card>
        
        <Card>
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-slate-500 text-sm font-medium">Pending Requests</p>
               <h3 className="text-3xl font-bold mt-1 text-slate-800">
                 {claims.filter(c => c.status.toLowerCase() === 'pending').length}
               </h3>
             </div>
             <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
               <FileText className="w-6 h-6" />
             </div>
           </div>
        </Card>
      </div>

      <Card noPadding>
        <CardHeader title="Recent Applications" className="p-6 pb-0 mb-4" />
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading claims...</div>
        ) : (
          <Table 
            columns={columns} 
            data={claims} 
            keyExtractor={(item) => item.id} 
            emptyMessage="You haven't submitted any applications yet."
          />
        )}
      </Card>

      {employeeId && (
        <SubmitRequestModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchClaims}
          employeeId={employeeId}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
