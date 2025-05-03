
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addTemplate, updateTemplate, removeTemplate } from '@/redux/slices/templateSlice';
import { v4 as uuidv4 } from 'uuid';
import TemplateCreator from '@/components/TemplateCreator';
import ProfileSettings from '@/components/ProfileSettings';
import { createTemplate, fetchTemplates, updateTemplate as updateTemplateService, deleteTemplate } from '@/services/templateService';
import { FileText, Plus, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SettingsPage = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const templates = useSelector((state: RootState) => state.template.templates);
  
  const [businessName, setBusinessName] = useState('Sharda Mandap Service');
  const [address, setAddress] = useState('Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225');
  const [gstNumber, setGstNumber] = useState('24AOSPP7196L1ZX');
  const [phoneNumber, setPhoneNumber] = useState('98246 86047');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  
  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTemplates();
        if (data && data.length > 0) {
          const formattedTemplates = data.map(template => ({
            id: template.id,
            name: template.name,
            primaryColor: template.primary_color,
            secondaryColor: template.secondary_color,
            fontSize: {
              header: template.font_size_header,
              body: template.font_size_body,
              footer: template.font_size_footer,
            },
            showGst: template.show_gst,
            showContact: template.show_contact,
            showLogo: template.show_logo,
            headerPosition: template.header_position as 'left' | 'center' | 'right' || 'center',
            tableColor: template.table_color || '#f8f9fa',
            footerDesign: template.footer_design as 'simple' | 'detailed' | 'minimal' || 'simple',
            createdAt: template.created_at || new Date().toISOString(),
            updatedAt: template.updated_at || new Date().toISOString(),
            logoUrl: template.logo_url
          }));
          dispatch({ type: 'template/setTemplates', payload: formattedTemplates });
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          variant: "destructive",
          title: "Failed to load templates",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [dispatch, toast]);
  
  // Preview data for template
  const previewInvoice = {
    invoiceNumber: 'INV-12345',
    partyName: 'Demo Client',
    date: '2025-04-28',
    total: 12500,
    items: [
      { id: '1', description: 'Sample Item 1', quantity: 2, rate: 5000, total: 10000 },
      { id: '2', description: 'Sample Item 2', quantity: 1, rate: 2500, total: 2500 }
    ]
  };
  
  const handleSaveBusinessInfo = () => {
    toast({
      title: "Settings updated",
      description: "Your business information has been updated successfully",
    });
  };
  
  const handleUploadLogo = () => {
    toast({
      title: "Supabase required",
      description: "Logo upload requires Supabase integration for storage",
    });
  };
  
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
  };
  
  const handleCreateTemplate = () => {
    setEditingTemplate({});
  };

  const handleConfirmDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setConfirmDeleteOpen(true);
  };
  
  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      try {
        setIsLoading(true);
        await deleteTemplate(templateToDelete);
        dispatch(removeTemplate(templateToDelete));
        toast({
          title: "Template deleted",
          description: "Template has been deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting template:", error);
        toast({
          variant: "destructive",
          title: "Failed to delete template",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
        setTemplateToDelete(null);
        setConfirmDeleteOpen(false);
      }
    }
  };
  
  const handleCancelTemplateEdit = () => {
    setEditingTemplate(null);
  };
  
  const handleSaveTemplate = async (templateData: any) => {
    try {
      setIsLoading(true);
      
      if (editingTemplate.id) {
        // Update existing template
        const template = {
          id: editingTemplate.id,
          name: templateData.name,
          primaryColor: templateData.primary_color,
          secondaryColor: templateData.secondary_color,
          fontSize: {
            header: templateData.font_size_header || 'text-3xl',
            body: templateData.font_size_body || 'text-base', 
            footer: templateData.font_size_footer || 'text-sm'
          },
          showGst: templateData.show_gst,
          showContact: templateData.show_contact,
          showLogo: templateData.show_logo,
          headerPosition: templateData.header_position,
          tableColor: templateData.table_color,
          footerDesign: templateData.footer_design,
          createdAt: editingTemplate.createdAt,
          updatedAt: new Date().toISOString(),
          logoUrl: editingTemplate.logoUrl
        };
        
        // Update template in database
        await updateTemplateService({
          id: template.id,
          name: templateData.name,
          primary_color: templateData.primary_color,
          secondary_color: templateData.secondary_color,
          font_size_header: templateData.font_size_header || 'text-3xl',
          font_size_body: templateData.font_size_body || 'text-base',
          font_size_footer: templateData.font_size_footer || 'text-sm',
          show_gst: templateData.show_gst,
          show_contact: templateData.show_contact,
          show_logo: templateData.show_logo,
          header_position: templateData.header_position,
          table_color: templateData.table_color,
          footer_design: templateData.footer_design
        });
        
        dispatch(updateTemplate(template));
        toast({
          title: "Template updated",
          description: `Template "${templateData.name}" has been updated successfully`,
        });
      } else {
        // Create new template
        const newTemplateId = uuidv4();
        const template = {
          id: newTemplateId,
          name: templateData.name,
          primaryColor: templateData.primary_color,
          secondaryColor: templateData.secondary_color,
          fontSize: {
            header: templateData.font_size_header || 'text-3xl',
            body: templateData.font_size_body || 'text-base',
            footer: templateData.font_size_footer || 'text-sm'
          },
          showGst: templateData.show_gst,
          showContact: templateData.show_contact,
          showLogo: templateData.show_logo,
          headerPosition: templateData.header_position,
          tableColor: templateData.table_color,
          footerDesign: templateData.footer_design,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Create new template in database
        await createTemplate({
          name: templateData.name,
          primary_color: templateData.primary_color,
          secondary_color: templateData.secondary_color,
          font_size_header: templateData.font_size_header || 'text-3xl',
          font_size_body: templateData.font_size_body || 'text-base',
          font_size_footer: templateData.font_size_footer || 'text-sm',
          show_gst: templateData.show_gst,
          show_contact: templateData.show_contact,
          show_logo: templateData.show_logo,
          header_position: templateData.header_position,
          table_color: templateData.table_color,
          footer_design: templateData.footer_design
        });
        
        dispatch(addTemplate(template));
        toast({
          title: "Template created",
          description: `Template "${templateData.name}" has been created successfully`,
        });
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        variant: "destructive",
        title: "Failed to save template",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
      // Reset form
      setEditingTemplate(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      
      <Tabs defaultValue="templates">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="profile">Profile & Theme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice Templates</CardTitle>
                  <CardDescription>
                    Customize how your invoices look
                  </CardDescription>
                </div>
                <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              </CardHeader>
              <CardContent>
                {templates.length === 0 && !isLoading ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium mb-1">No templates yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first invoice template</p>
                    <Button onClick={handleCreateTemplate} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {isLoading ? (
                        // Template loading skeletons
                        Array(3).fill(0).map((_, i) => (
                          <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="aspect-[3/4] bg-gray-200 rounded mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                          </div>
                        ))
                      ) : (
                        templates.map((template) => (
                          <div 
                            key={template.id} 
                            className="border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <div 
                              className="aspect-[3/4] relative p-4"
                              style={{
                                backgroundColor: template.tableColor || '#f8f8f8',
                              }}
                            >
                              {/* Template preview */}
                              <div className="absolute inset-0 p-4">
                                <div 
                                  className="h-6 mb-2 rounded" 
                                  style={{ backgroundColor: template.primaryColor + '40' }}
                                ></div>
                                <div 
                                  className="h-4 mb-2 rounded" 
                                  style={{ backgroundColor: template.primaryColor + '20' }}
                                ></div>
                                <div className="h-16 bg-white rounded-md my-2"></div>
                                <div className="grid grid-cols-5 gap-1 my-2">
                                  <div className="col-span-1 h-3 bg-white rounded"></div>
                                  <div className="col-span-2 h-3 bg-white rounded"></div>
                                  <div className="col-span-1 h-3 bg-white rounded"></div>
                                  <div className="col-span-1 h-3 bg-white rounded"></div>
                                </div>
                                <div className="grid grid-cols-5 gap-1 mb-2">
                                  <div className="col-span-1 h-3 bg-white rounded"></div>
                                  <div className="col-span-2 h-3 bg-white rounded"></div>
                                  <div className="col-span-1 h-3 bg-white rounded"></div>
                                  <div className="col-span-1 h-3 bg-white rounded"></div>
                                </div>
                                <div 
                                  className="h-8 rounded mt-4" 
                                  style={{ backgroundColor: template.secondaryColor + '30' }}
                                ></div>
                              </div>
                              
                              {/* Template name overlay */}
                              <div className="absolute top-2 left-2 right-2">
                                <div className="bg-white/90 py-1 px-2 text-center rounded-md text-xs font-medium truncate">
                                  {template.name}
                                </div>
                              </div>
                              
                              {/* Actions overlay */}
                              <div className="absolute inset-0 bg-black/0 opacity-0 hover:opacity-100 hover:bg-black/20 transition-all flex items-center justify-center gap-2">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTemplate(template);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmDeleteTemplate(template.id);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="p-3 border-t bg-white">
                              <p className="font-medium text-center truncate">{template.name}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {editingTemplate && (
                      <div className="mt-8">
                        <TemplateCreator 
                          initialTemplate={editingTemplate.id ? editingTemplate : undefined}
                          onSave={handleSaveTemplate}
                          onCancel={handleCancelTemplateEdit}
                          isLoading={isLoading}
                          previewInvoice={previewInvoice}
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="profile">
          <ProfileSettings
            businessName={businessName}
            address={address}
            gstNumber={gstNumber}
            phoneNumber={phoneNumber}
            onSaveBusinessInfo={handleSaveBusinessInfo}
            onUploadLogo={handleUploadLogo}
          />
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
