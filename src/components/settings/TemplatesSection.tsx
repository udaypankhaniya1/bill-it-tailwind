
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  Template 
} from '@/services/templateService';
import TemplateCreator from '@/components/TemplateCreator';

interface TemplatesSectionProps {
  onTemplateEdit?: (template: Template) => void;
}

const TemplatesSection = ({ onTemplateEdit }: TemplatesSectionProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Sample invoice data for preview
  const previewInvoice = {
    id: 'preview',
    invoice_number: 'INV-001',
    party_name: 'Sample Client',
    date: '2024-01-15',
    items: [
      {
        id: '1',
        description: 'Sample Product',
        quantity: 2,
        unit: 'pcs',
        rate: 500,
        total: 1000
      },
      {
        id: '2',
        description: 'Another Product',
        quantity: 1,
        unit: 'pcs',
        rate: 250,
        total: 250
      }
    ],
    subtotal: 1250,
    gst: 225,
    total: 1475
  };

  useEffect(() => {
    loadTemplates();
  }, []);

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
          user_id: template.user_id,
          created_at: template.created_at,
          updated_at: template.updated_at,
          logo_url: template.logo_url
        }));
        setTemplates(formattedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        variant: "destructive",
        title: "Failed to load templates",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsCreating(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsCreating(true);
    onTemplateEdit?.(template);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      setIsSaving(true);
      
      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = {
          ...editingTemplate,
          ...templateData
        };
        await updateTemplate(updatedTemplate);
        toast({
          title: "Template updated",
          description: "Your template has been updated successfully",
        });
      } else {
        // Create new template
        await createTemplate({
          name: templateData.name,
          primary_color: templateData.primary_color,
          secondary_color: templateData.secondary_color,
          font_size_header: templateData.font_size_header,
          font_size_body: templateData.font_size_body,
          font_size_footer: templateData.font_size_footer,
          show_gst: templateData.show_gst,
          show_contact: templateData.show_contact,
          show_logo: templateData.show_logo,
          header_position: templateData.header_position,
          table_color: templateData.table_color,
          footer_design: templateData.footer_design,
          footer_position: templateData.footer_position,
          footer_enabled: templateData.footer_enabled,
          watermark_text: templateData.watermark_text,
          watermark_enabled: templateData.watermark_enabled,
          company_name: templateData.company_name || 'Sharda Mandap Service',
          company_address: templateData.company_address || 'Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225',
          company_mobile: templateData.company_mobile || '98246 86047',
          company_gst_number: templateData.company_gst_number || '24AOSPP7196L1ZX'
        });
        toast({
          title: "Template created",
          description: "Your new template has been created successfully",
        });
      }
      
      setIsCreating(false);
      setEditingTemplate(null);
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "Failed to save template",
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (templates.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot delete template",
        description: "You must have at least one template",
      });
      return;
    }

    try {
      await deleteTemplate(templateId);
      toast({
        title: "Template deleted",
        description: "Template has been deleted successfully",
      });
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: "Please try again later",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingTemplate(null);
  };

  if (isCreating) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </h1>
          <p className="text-gray-600 mt-2">
            {editingTemplate ? 'Modify your existing template' : 'Create a new invoice template'}
          </p>
        </div>
        
        <TemplateCreator
          initialTemplate={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancelEdit}
          isLoading={isSaving}
          previewInvoice={previewInvoice}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Invoice Templates</CardTitle>
            <CardDescription>
              Manage your invoice templates and customize how your invoices look
            </CardDescription>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Loading templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={templates.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Company:</span>
                      <span className="truncate max-w-24" title={template.company_name}>{template.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>{template.show_gst ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact Info:</span>
                      <span>{template.show_contact ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logo:</span>
                      <span>{template.show_logo ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Footer:</span>
                      <span>{template.footer_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Watermark:</span>
                      <span>{template.watermark_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatesSection;
