
import { useState, useEffect } from 'react';
import InvoiceEditor from '@/components/InvoiceEditor';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { fetchTemplates, Template } from '@/services/templateService';
import { useToast } from '@/hooks/use-toast';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          variant: "destructive",
          title: "Failed to load templates",
          description: "Using default template settings",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [toast]);
  
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
      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">Loading templates...</p>
        </div>
      ) : (
        <InvoiceEditor templates={templates} />
      )}
    </div>
  );
};

export default CreateInvoicePage;
