
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Template } from '@/services/templateService';
import { CheckCircle, Palette, Layout, Type } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

interface TemplateCreatorProps {
  initialTemplate?: Template;
  onSave: (template: Omit<Template, 'id' | 'user_id'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  previewInvoice: any;
}

const TemplateCreator = ({ 
  initialTemplate, 
  onSave, 
  onCancel, 
  isLoading,
  previewInvoice 
}: TemplateCreatorProps) => {
  // Template state
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'New Template');
  const [primaryColor, setPrimaryColor] = useState(initialTemplate?.primary_color || '#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState(initialTemplate?.secondary_color || '#64748B');
  const [tableColor, setTableColor] = useState(initialTemplate?.table_color || '#f8f9fa');
  const [headerPosition, setHeaderPosition] = useState<'left' | 'center' | 'right'>(
    initialTemplate?.header_position || 'center'
  );
  const [footerDesign, setFooterDesign] = useState<'simple' | 'detailed' | 'minimal'>(
    initialTemplate?.footer_design || 'simple'
  );
  const [showGst, setShowGst] = useState(initialTemplate?.show_gst ?? true);
  const [showContact, setShowContact] = useState(initialTemplate?.show_contact ?? true);
  const [showLogo, setShowLogo] = useState(initialTemplate?.show_logo ?? true);

  const handleSaveTemplate = async () => {
    const template = {
      name: templateName,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      font_size_header: 'text-3xl',
      font_size_body: 'text-base',
      font_size_footer: 'text-sm',
      table_color: tableColor,
      header_position: headerPosition,
      footer_design: footerDesign,
      show_gst: showGst,
      show_contact: showContact,
      show_logo: showLogo
    };

    await onSave(template);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {initialTemplate ? `Edit Template: ${initialTemplate.name}` : 'Create New Template'}
          </CardTitle>
          <CardDescription>
            Customize your invoice template settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Display
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
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
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex flex-col items-center p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="simple" id="simple" className="sr-only" />
                    <div className="w-full h-2 bg-gray-200 mb-1"></div>
                    <div className="w-3/4 h-2 bg-gray-200 mx-auto"></div>
                    <Label htmlFor="simple" className="mt-2 text-xs font-medium">Simple</Label>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="detailed" id="detailed" className="sr-only" />
                    <div className="w-full h-1 bg-gray-200 mb-1"></div>
                    <div className="w-full grid grid-cols-3 gap-1">
                      <div className="h-3 bg-gray-200"></div>
                      <div className="h-3 bg-gray-200"></div>
                      <div className="h-3 bg-gray-200"></div>
                    </div>
                    <Label htmlFor="detailed" className="mt-2 text-xs font-medium">Detailed</Label>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="minimal" id="minimal" className="sr-only" />
                    <div className="w-full flex justify-between">
                      <div className="w-1/4 h-2 bg-gray-200"></div>
                      <div className="w-1/4 h-2 bg-gray-200"></div>
                    </div>
                    <Label htmlFor="minimal" className="mt-2 text-xs font-medium">Minimal</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4">
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
                  <div className="mt-1 flex gap-2">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'].map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color }}
                        onClick={() => setPrimaryColor(color)}
                        aria-label={`Set color to ${color}`}
                      />
                    ))}
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
                  <div className="mt-1 flex gap-2">
                    {['#64748B', '#6B7280', '#9CA3AF', '#4B5563', '#1F2937'].map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color }}
                        onClick={() => setSecondaryColor(color)}
                        aria-label={`Set color to ${color}`}
                      />
                    ))}
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
                <div className="mt-1 flex gap-2">
                  {['#f8f9fa', '#F3F4F6', '#E5E7EB', '#F1F5F9', '#FAFAFA'].map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                      onClick={() => setTableColor(color)}
                      aria-label={`Set table color to ${color}`}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="display" className="space-y-4">
              <div className="space-y-3">
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
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
                {initialTemplate ? 'Update Template' : 'Create Template'}
              </>
            )}
          </Button>
        </CardFooter>
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
  );
};

export default TemplateCreator;
