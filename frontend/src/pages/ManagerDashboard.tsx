import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { RequestDetailsModal } from '../components/manager/RequestDetailsModal';
import { Inbox } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';

const ManagerDashboard: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const managerId = localStorage.getItem('user_id');

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/manager/claims/${managerId}`);
      setClaims(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (managerId) fetchClaims();
  }, [managerId]);

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Employee ID", accessor: "employee_id", cell: (r: any) => <span className="font-semibold">{r.employee_id}</span> },
    { header: "Description", accessor: "description", cell: (r: any) => <span className="truncate block max-w-xs">{r.description}</span> },
    { header: "Amount", accessor: "amount", cell: (r: any) => `$${r.amount.toFixed(2)}` },
    { 
      header: "Action", 
      accessor: "action", 
      cell: (r: any) => (
        <Button size="sm" onClick={() => setSelectedClaim(r)}>
          Review
        </Button>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage team reimbursement requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
         <Card className="col-span-1 md:col-span-1 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-transparent">
           <div className="flex justify-between items-start mb-2">
             <p className="text-indigo-100 text-sm font-medium">Pending Approvals</p>
             <div className="p-2 bg-white/20 rounded-lg">
               <Inbox className="w-5 h-5 text-white" />
             </div>
           </div>
           <h3 className="text-4xl font-bold mt-2">{claims.length}</h3>
         </Card>
      </div>

      <Card noPadding>
        <CardHeader title="Action Required" className="p-6 pb-0 mb-4" />
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading pending requests...</div>
        ) : (
          <Table 
            columns={columns} 
            data={claims} 
            keyExtractor={(item) => item.id} 
            emptyMessage="No pending requests await your approval."
          />
        )}
      </Card>

      {managerId && (
        <RequestDetailsModal 
          isOpen={!!selectedClaim} 
          onClose={() => setSelectedClaim(null)} 
          claim={selectedClaim}
          onActionComplete={fetchClaims}
          managerId={managerId}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
