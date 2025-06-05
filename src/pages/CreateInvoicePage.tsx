import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTemplates, Template } from '@/services/templateService';
import InvoiceEditor from '@/components/InvoiceEditor';
import { useToast } from '@/hooks/use-toast';

const CreateInvoicePage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const templatesData = await fetchTemplates();
        
        if (templatesData && templatesData.length > 0) {
          const formattedTemplates = templatesData.map(template => ({
            id: template.id,
            name: template.name,
            primary_color: template.primary_color,
            secondary_color: template.secondary_color,
            font_size_header: template.font_size_header,
            font_size_body: template.font_size_body,
            font_size_footer: template.font_size_footer,
            show_gst: template.show_gst,
            show_contact: template.show_contact,
            show_logo: template.show_logo,
            header_position: (template.header_position || 'center') as 'left' | 'center' | 'right',
            table_color: template.table_color || '#f8f9fa',
            footer_design: (template.footer_design || 'simple') as 'simple' | 'detailed' | 'minimal',
            footer_position: (template.footer_position || 'center') as 'left' | 'center' | 'right',
            footer_enabled: template.footer_enabled ?? true,
            watermark_text: template.watermark_text || '',
            watermark_enabled: template.watermark_enabled ?? false,
            company_name: template.company_name || 'Sharda Mandap Service',
            company_address: template.company_address || 'Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225',
            company_mobile: template.company_mobile || '98246 86047',
            company_gst_number: template.company_gst_number || '24AOSPP7196L1ZX',
            logo_url: template.logo_url
          }));
          setTemplates(formattedTemplates);
        } else {
          // Set default template if no templates found
          const defaultTemplate: Template = {
            id: 'default',
            name: 'Default Template',
            primary_color: '#000000',
            secondary_color: '#666666',
            font_size_header: 'text-2xl',
            font_size_body: 'text-base',
            font_size_footer: 'text-sm',
            show_gst: true,
            show_contact: true,
            show_logo: true,
            header_position: 'center',
            table_color: '#f8f9fa',
            footer_design: 'simple',
            footer_position: 'center',
            footer_enabled: true,
            watermark_text: '',
            watermark_enabled: false,
            company_name: 'Sharda Mandap Service',
            company_address: 'Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225',
            company_mobile: '98246 86047',
            company_gst_number: '24AOSPP7196L1ZX',
            logo_url: ''
          };
          setTemplates([defaultTemplate]);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          variant: "destructive",
          title: "Failed to load templates",
          description: "Using default template",
        });
        
        // Fallback to default template
        const defaultTemplate: Template = {
          id: 'default',
          name: 'Default Template',
          primary_color: '#000000',
          secondary_color: '#666666',
          font_size_header: 'text-2xl',
          font_size_body: 'text-base',
          font_size_footer: 'text-sm',
          show_gst: true,
          show_contact: true,
          show_logo: true,
          header_position: 'center',
          table_color: '#f8f9fa',
          footer_design: 'simple',
          footer_position: 'center',
          footer_enabled: true,
          watermark_text: '',
          watermark_enabled: false,
          company_name: 'Sharda Mandap Service',
          company_address: 'Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225',
          company_mobile: '98246 86047',
          company_gst_number: '24AOSPP7196L1ZX',
          logo_url: ''
        };
        setTemplates([defaultTemplate]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Loading templates...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to create a new invoice</p>
      </div>
      
      <InvoiceEditor templates={templates} />
    </div>
  );
};

export default CreateInvoicePage;
