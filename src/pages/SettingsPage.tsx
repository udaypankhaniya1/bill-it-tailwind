
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsPage = () => {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState('Sharda Mandap Service');
  const [address, setAddress] = useState('Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225');
  const [gstNumber, setGstNumber] = useState('24AOSPP7196L1ZX');
  const [phoneNumber, setPhoneNumber] = useState('98246 86047');
  
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

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      
      <Tabs defaultValue="business">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="business">Business Information</TabsTrigger>
          <TabsTrigger value="appearance">Appearance & Templates</TabsTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
              <CardDescription>
                Choose a template for your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 cursor-pointer bg-blue-50 border-blue-500">
                  <div className="aspect-[3/4] bg-white rounded border mb-3 flex items-center justify-center">
                    <div className="w-3/4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-blue-100 rounded mb-2"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <p className="font-medium text-center">Modern (Default)</p>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <div className="aspect-[3/4] bg-white rounded border mb-3 flex items-center justify-center">
                    <div className="w-3/4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-100 rounded mb-2"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <p className="font-medium text-center">Classic</p>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <div className="aspect-[3/4] bg-white rounded border mb-3 flex items-center justify-center">
                    <div className="w-3/4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-100 rounded mb-2"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <p className="font-medium text-center">Minimal</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => {
                  toast({
                    title: "Supabase required",
                    description: "Template customization requires Supabase integration",
                  });
                }}>
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
