
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addTemplate, updateTemplate, Template } from '@/redux/slices/templateSlice';
import { v4 as uuidv4 } from 'uuid';

const SettingsPage = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const templates = useSelector((state: RootState) => state.template.templates);
  const currentTemplate = useSelector((state: RootState) => state.template.currentTemplate);
  
  const [businessName, setBusinessName] = useState('Sharda Mandap Service');
  const [address, setAddress] = useState('Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225');
  const [gstNumber, setGstNumber] = useState('24AOSPP7196L1ZX');
  const [phoneNumber, setPhoneNumber] = useState('98246 86047');
  
  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [secondaryColor, setSecondaryColor] = useState('gray');
  const [showGst, setShowGst] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  
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
    setShowGst(template.showGst);
    setShowContact(template.showContact);
    setShowLogo(template.showLogo);
  };
  
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('New Template');
    setPrimaryColor('blue');
    setSecondaryColor('gray');
    setShowGst(true);
    setShowContact(true);
    setShowLogo(true);
  };
  
  const handleSaveTemplate = () => {
    const template: Template = {
      id: editingTemplate?.id || uuidv4(),
      name: templateName,
      primaryColor,
      secondaryColor,
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
    
    if (editingTemplate) {
      dispatch(updateTemplate(template));
      toast({
        title: "Template updated",
        description: `Template "${templateName}" has been updated successfully`,
      });
    } else {
      dispatch(addTemplate(template));
      toast({
        title: "Template created",
        description: `Template "${templateName}" has been created successfully`,
      });
    }
    
    // Reset form
    setEditingTemplate(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      
      <Tabs defaultValue="business">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="business">Business Information</TabsTrigger>
          <TabsTrigger value="appearance">Templates</TabsTrigger>
        </TabsList>
        
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
                  <div className="grid grid-cols-2 gap-4">
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
        
        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice Templates</CardTitle>
                  <CardDescription>
                    Customize how your invoices look
                  </CardDescription>
                </div>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`border rounded-lg p-4 cursor-pointer ${
                        currentTemplate?.id === template.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleEditTemplate(template)}
                    >
                      <div 
                        className="aspect-[3/4] bg-white rounded border mb-3 flex items-center justify-center"
                        style={{
                          backgroundColor: template.showLogo ? '#ffffff' : '#f8f8f8',
                          borderColor: template.primaryColor
                        }}
                      >
                        <div className="w-3/4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded mb-4"></div>
                          <div className="h-8 rounded mb-2" style={{ backgroundColor: `${template.primaryColor}20` }}></div>
                          <div className="h-8 rounded" style={{ backgroundColor: `${template.secondaryColor}20` }}></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">{template.name}</p>
                    </div>
                  ))}
                </div>
                
                {(editingTemplate || templateName) && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>
                        {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Template'}
                      </CardTitle>
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
                        
                        <div className="grid grid-cols-2 gap-4">
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
                        
                        <div className="space-y-2">
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
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setEditingTemplate(null);
                              setTemplateName('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveTemplate}>
                            {editingTemplate ? 'Update Template' : 'Create Template'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
