
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Settings, Palette, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  Template 
} from '@/services/templateService';
import TemplateCreator from '@/components/TemplateCreator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setCurrentTheme } from '@/redux/slices/templateSlice';
import GeminiSettings from '@/components/GeminiSettings';
import WhatsAppMessageSettings from '@/components/WhatsAppMessageSettings';

const SettingsPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // Get theme data from Redux
  const { currentTheme, themes } = useSelector((state: RootState) => state.template);
  
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
          watermark_enabled: templateData.watermark_enabled
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

  const handleThemeChange = (themeId: string) => {
    dispatch(setCurrentTheme(themeId));
    toast({
      title: "Theme updated",
      description: "Your theme preference has been saved",
    });
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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your templates and application preferences</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
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
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>App Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Theme Selection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {themes.map((theme) => (
                      <Card 
                        key={theme.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          currentTheme === theme.id 
                            ? 'ring-2 ring-blue-500 border-blue-200' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleThemeChange(theme.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <h4 className="font-medium">{theme.name}</h4>
                            <div className="flex space-x-2">
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: theme.colors.secondary }}
                              />
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: theme.colors.background }}
                              />
                            </div>
                            <p className="text-sm text-gray-500 capitalize">
                              {theme.mode} mode
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <GeminiSettings />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppMessageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
