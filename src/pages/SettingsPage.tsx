
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addTemplate, updateTemplate, Template, setCurrentTheme } from '@/redux/slices/templateSlice';
import { v4 as uuidv4 } from 'uuid';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import TemplatePreview from '@/components/TemplatePreview';
import { createTemplate, fetchTemplates, updateTemplate as updateTemplateService } from '@/services/templateService';
import { AlertCircle, CheckCircle, FileText, Plus, Trash } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const currentTemplate = useSelector((state: RootState) => state.template.currentTemplate);
  const themes = useSelector((state: RootState) => state.template.themes);
  const currentTheme = useSelector((state: RootState) => state.template.currentTheme);
  
  const [businessName, setBusinessName] = useState('Sharda Mandap Service');
  const [address, setAddress] = useState('Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225');
  const [gstNumber, setGstNumber] = useState('24AOSPP7196L1ZX');
  const [phoneNumber, setPhoneNumber] = useState('98246 86047');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [secondaryColor, setSecondaryColor] = useState('gray');
  const [tableColor, setTableColor] = useState('#f8f9fa');
  const [headerPosition, setHeaderPosition] = useState<'left' | 'center' | 'right'>('center');
  const [footerDesign, setFooterDesign] = useState<'simple' | 'detailed' | 'minimal'>('simple');
  const [showGst, setShowGst] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  
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
            headerPosition: template.header_position || 'center',
            tableColor: template.table_color || '#f8f9fa',
            footerDesign: template.footer_design || 'simple',
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
  
  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setPrimaryColor(template.primaryColor);
    setSecondaryColor(template.secondaryColor);
    setTableColor(template.tableColor || '#f8f9fa');
    setHeaderPosition(template.headerPosition || 'center');
    setFooterDesign(template.footerDesign || 'simple');
    setShowGst(template.showGst);
    setShowContact(template.showContact);
    setShowLogo(template.showLogo);
  };
  
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('New Template');
    setPrimaryColor('blue');
    setSecondaryColor('gray');
    setTableColor('#f8f9fa');
    setHeaderPosition('center');
    setFooterDesign('simple');
    setShowGst(true);
    setShowContact(true);
    setShowLogo(true);
  };

  const handleConfirmDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setConfirmDeleteOpen(true);
  };
  
  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      dispatch({ type: 'template/removeTemplate', payload: templateToDelete });
      toast({
        title: "Template deleted",
        description: "Template has been deleted successfully",
      });
      setTemplateToDelete(null);
    }
    setConfirmDeleteOpen(false);
  };
  
  const handleSaveTemplate = async () => {
    const template: Template = {
      id: editingTemplate?.id || uuidv4(),
      name: templateName,
      primaryColor,
      secondaryColor,
      tableColor,
      headerPosition,
      footerDesign,
      fontSize: {
        header: 'text-3xl',
        body: 'text-base',
        footer: 'text-sm',
      },
      showGst,
      showContact,
      showLogo,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      setIsLoading(true);
      
      if (editingTemplate) {
        // Update template in database
        await updateTemplateService({
          id: template.id,
          name: template.name,
          primary_color: template.primaryColor,
          secondary_color: template.secondaryColor,
          font_size_header: template.fontSize.header,
          font_size_body: template.fontSize.body,
          font_size_footer: template.fontSize.footer,
          show_gst: template.showGst,
          show_contact: template.showContact,
          show_logo: template.showLogo,
          header_position: template.headerPosition,
          table_color: template.tableColor,
          footer_design: template.footerDesign
        });
        
        dispatch(updateTemplate(template));
        toast({
          title: "Template updated",
          description: `Template "${templateName}" has been updated successfully`,
        });
      } else {
        // Create new template in database
        await createTemplate({
          name: template.name,
          primary_color: template.primaryColor,
          secondary_color: template.secondaryColor,
          font_size_header: template.fontSize.header,
          font_size_body: template.fontSize.body,
          font_size_footer: template.fontSize.footer,
          show_gst: template.showGst,
          show_contact: template.showContact,
          show_logo: template.showLogo,
          header_position: template.headerPosition,
          table_color: template.tableColor,
          footer_design: template.footerDesign
        });
        
        dispatch(addTemplate(template));
        toast({
          title: "Template created",
          description: `Template "${templateName}" has been created successfully`,
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

  const handleThemeChange = (themeId: string) => {
    dispatch(setCurrentTheme(themeId));
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      
      <Tabs defaultValue="templates">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="business">Business Information</TabsTrigger>
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
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                            currentTemplate?.id === template.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                          }`}
                        >
                          <div 
                            className="aspect-[3/4] relative"
                            style={{
                              backgroundColor: template.tableColor || '#f8f8f8',
                              borderColor: template.primaryColor
                            }}
                            onClick={() => handleEditTemplate(template)}
                          >
                            {/* Template preview */}
                            <div className="absolute inset-0 p-4">
                              <div className="h-8 bg-white rounded-md mb-2 flex items-center justify-center text-xs font-medium">
                                {template.name}
                              </div>
                              <div 
                                className="h-4 mb-2 rounded" 
                                style={{ backgroundColor: `${template.primaryColor}40` }}
                              ></div>
                              <div 
                                className="h-4 mb-6 rounded" 
                                style={{ backgroundColor: `${template.primaryColor}20` }}
                              ></div>
                              <div className="h-20 bg-white rounded-md mb-2"></div>
                              <div 
                                className="h-12 rounded mt-4" 
                                style={{ backgroundColor: `${template.secondaryColor}30` }}
                              ></div>
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
                                Delete
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
                )}
                
                {(editingTemplate || templateName) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Template'}
                        </CardTitle>
                        <CardDescription>
                          Configure your template settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="templateName">Template Name</Label>
                            <Input
                              id="templateName"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="primaryColor">Primary Color</Label>
                              <div className="flex mt-1 space-x-2">
                                <Input
                                  id="primaryColor"
                                  type="color"
                                  value={primaryColor}
                                  onChange={(e) => setPrimaryColor(e.target.value)}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={primaryColor}
                                  onChange={(e) => setPrimaryColor(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="secondaryColor">Secondary Color</Label>
                              <div className="flex mt-1 space-x-2">
                                <Input
                                  id="secondaryColor"
                                  type="color"
                                  value={secondaryColor}
                                  onChange={(e) => setSecondaryColor(e.target.value)}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={secondaryColor}
                                  onChange={(e) => setSecondaryColor(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="tableColor">Table Background Color</Label>
                            <div className="flex mt-1 space-x-2">
                              <Input
                                id="tableColor"
                                type="color"
                                value={tableColor}
                                onChange={(e) => setTableColor(e.target.value)}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={tableColor}
                                onChange={(e) => setTableColor(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="block mb-2">Header Position</Label>
                            <RadioGroup 
                              value={headerPosition} 
                              onValueChange={(value) => setHeaderPosition(value as 'left' | 'center' | 'right')}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="left" id="left" />
                                <Label htmlFor="left">Left</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="center" id="center" />
                                <Label htmlFor="center">Center</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="right" id="right" />
                                <Label htmlFor="right">Right</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div>
                            <Label className="block mb-2">Footer Design</Label>
                            <RadioGroup 
                              value={footerDesign} 
                              onValueChange={(value) => setFooterDesign(value as 'simple' | 'detailed' | 'minimal')}
                              className="flex flex-col gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="simple" id="simple" />
                                <Label htmlFor="simple">Simple</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="detailed" id="detailed" />
                                <Label htmlFor="detailed">Detailed</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="minimal" id="minimal" />
                                <Label htmlFor="minimal">Minimal</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="showGst"
                                checked={showGst}
                                onCheckedChange={setShowGst}
                              />
                              <Label htmlFor="showGst">Show GST by default</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="showContact"
                                checked={showContact}
                                onCheckedChange={setShowContact}
                              />
                              <Label htmlFor="showContact">Show contact information</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="showLogo"
                                checked={showLogo}
                                onCheckedChange={setShowLogo}
                              />
                              <Label htmlFor="showLogo">Show logo</Label>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setEditingTemplate(null);
                                setTemplateName('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSaveTemplate}
                              disabled={isLoading}
                              className="flex items-center gap-2"
                            >
                              {isLoading ? (
                                <>Loading...</>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  {editingTemplate ? 'Update Template' : 'Create Template'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Template Preview</CardTitle>
                        <CardDescription>See how your invoice will look with these settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                          <TemplatePreview 
                            invoice={previewInvoice}
                            template={{
                              primaryColor,
                              secondaryColor,
                              tableColor,
                              headerPosition,
                              footerDesign,
                              showGst,
                              showContact,
                              showLogo
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Choose the theme for your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-2 cursor-pointer transition-all ${
                        currentTheme === theme.id ? 'ring-2 ring-blue-500' : 'hover:border-blue-300'
                      }`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <div 
                        className={`h-20 rounded-md mb-2`}
                        style={{ 
                          backgroundColor: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`
                        }}
                      >
                        <div className="flex p-2 gap-1 justify-end">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: theme.colors.primary }}
                          ></div>
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: theme.colors.secondary }}
                          ></div>
                        </div>
                      </div>
                      <p 
                        className="text-xs font-medium text-center"
                        style={{ color: theme.mode === 'dark' ? '#fff' : '#000' }}
                      >
                        {theme.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="business">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  These details will appear on your invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveBusinessInfo}>Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Business Logo</CardTitle>
                <CardDescription>
                  Upload your business logo to appear on invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">PNG, JPG up to 5MB</p>
                    <Button onClick={handleUploadLogo}>Upload Logo</Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Logo uploading requires Supabase integration
                </p>
              </CardContent>
            </Card>
          </div>
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
