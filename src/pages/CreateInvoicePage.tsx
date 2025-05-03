
import { useState, useEffect } from 'react';
import InvoiceEditor from '@/components/InvoiceEditor';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { fetchTemplates, Template } from '@/services/templateService';
import { useToast } from '@/hooks/use-toast';
import { FileText, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
        if (data && data.length > 0) {
          setTemplates(data);
        } else {
          // If no templates, provide a default one
          setTemplates([{
            id: 'default',
            name: 'Default Template',
            primary_color: '#3B82F6',
            secondary_color: '#64748B',
            font_size_header: 'text-3xl',
            font_size_body: 'text-base',
            font_size_footer: 'text-sm',
            show_gst: true,
            show_contact: true,
            show_logo: true,
            header_position: 'center',
            table_color: '#f8f9fa',
            footer_design: 'simple'
          }]);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          variant: "destructive",
          title: "Failed to load templates",
          description: "Using default template settings",
        });
        // Set a default template if loading fails
        setTemplates([{
          id: 'default',
          name: 'Default Template',
          primary_color: '#3B82F6',
          secondary_color: '#64748B',
          font_size_header: 'text-3xl',
          font_size_body: 'text-base',
          font_size_footer: 'text-sm',
          show_gst: true,
          show_contact: true,
          show_logo: true,
          header_position: 'center',
          table_color: '#f8f9fa',
          footer_design: 'simple'
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [toast]);
  
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">Create Invoice</h2>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View All Invoices
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Templates
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <Card className="p-8">
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading templates...</p>
          </div>
        </Card>
      ) : (
        <InvoiceEditor templates={templates} />
      )}
    </div>
  );
};

export default CreateInvoicePage;
