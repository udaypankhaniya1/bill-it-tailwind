
import InvoiceEditor from '@/components/InvoiceEditor';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Create Invoice</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            View All Invoices
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Manage Templates
          </Button>
        </div>
      </div>
      <InvoiceEditor />
    </div>
  );
};

export default CreateInvoicePage;
