
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import TemplatePreview from '@/components/TemplatePreview';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface TemplateCreatorProps {
  initialTemplate?: any;
  onSave: (template: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  previewInvoice: any;
}

const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  initialTemplate,
  onSave,
  onCancel,
  isLoading = false,
  previewInvoice
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    show_gst: true,
    show_contact: true,
    show_logo: true,
    header_position: 'center' as 'left' | 'center' | 'right',
    footer_position: 'center' as 'left' | 'center' | 'right',
    footer_enabled: true,
    watermark_text: '',
    watermark_enabled: false,
  });

  // Initialize form with existing template data
  useEffect(() => {
    if (initialTemplate) {
      setFormData({
        name: initialTemplate.name || '',
        show_gst: initialTemplate.showGst ?? true,
        show_contact: initialTemplate.showContact ?? true,
        show_logo: initialTemplate.showLogo ?? true,
        header_position: initialTemplate.headerPosition || 'center',
        footer_position: initialTemplate.footerPosition || 'center',
        footer_enabled: initialTemplate.footerEnabled ?? true,
        watermark_text: initialTemplate.watermarkText || '',
        watermark_enabled: initialTemplate.watermarkEnabled ?? false,
      });
    }
  }, [initialTemplate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWatermarkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, we'll just store the file name as watermark text
      // In a full implementation, you'd upload to storage and get a URL
      handleInputChange('watermark_text', `[Image: ${file.name}]`);
      handleInputChange('watermark_enabled', true);
      
      toast({
        title: "Watermark uploaded",
        description: "Your watermark has been set successfully.",
      });
    } catch (error) {
      console.error('Error uploading watermark:', error);
      toast({
        title: "Error uploading watermark",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Template name is required",
      });
      return;
    }

    // Convert form data to template format with fixed B/W styles
    const templateData = {
      ...formData,
      primary_color: '#000000', // Fixed black
      secondary_color: '#666666', // Fixed gray
      table_color: '#f8f9fa', // Fixed light gray
      font_size_header: 'text-2xl',
      font_size_body: 'text-base',
      font_size_footer: 'text-sm',
      footer_design: 'simple'
    };

    onSave(templateData);
  };

  // Create preview template object
  const previewTemplate = {
    primaryColor: '#000000',
    secondaryColor: '#666666',
    tableColor: '#f8f9fa',
    headerPosition: formData.header_position,
    footerDesign: 'simple' as 'simple' | 'detailed' | 'minimal',
    footerPosition: formData.footer_position,
    footerEnabled: formData.footer_enabled,
    showGst: formData.show_gst,
    showContact: formData.show_contact,
    showLogo: formData.show_logo,
    watermarkText: formData.watermark_text,
    watermarkEnabled: formData.watermark_enabled,
    logoUrl: initialTemplate?.logoUrl
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle>{initialTemplate?.id ? 'Edit Template' : 'Create New Template'}</CardTitle>
          <CardDescription>
            Customize your invoice template settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Name */}
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>

            {/* Header Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Header Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-logo"
                  checked={formData.show_logo}
                  onCheckedChange={(checked) => handleInputChange('show_logo', checked)}
                />
                <Label htmlFor="show-logo">Show Logo</Label>
              </div>

              <div>
                <Label>Header Position</Label>
                <Select 
                  value={formData.header_position} 
                  onValueChange={(value) => handleInputChange('header_position', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-gst"
                  checked={formData.show_gst}
                  onCheckedChange={(checked) => handleInputChange('show_gst', checked)}
                />
                <Label htmlFor="show-gst">Show GST Information</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-contact"
                  checked={formData.show_contact}
                  onCheckedChange={(checked) => handleInputChange('show_contact', checked)}
                />
                <Label htmlFor="show-contact">Show Contact Information</Label>
              </div>
            </div>

            {/* Watermark Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Watermark Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="watermark-enabled"
                  checked={formData.watermark_enabled}
                  onCheckedChange={(checked) => handleInputChange('watermark_enabled', checked)}
                />
                <Label htmlFor="watermark-enabled">Enable Watermark</Label>
              </div>

              {formData.watermark_enabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Textarea
                      id="watermark-text"
                      value={formData.watermark_text}
                      onChange={(e) => handleInputChange('watermark_text', e.target.value)}
                      placeholder="Enter watermark text"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Or Upload Watermark Image</Label>
                    <div className="mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={uploading}
                        onClick={() => document.getElementById('watermark-upload')?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <input
                        id="watermark-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleWatermarkUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Footer Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="footer-enabled"
                  checked={formData.footer_enabled}
                  onCheckedChange={(checked) => handleInputChange('footer_enabled', checked)}
                />
                <Label htmlFor="footer-enabled">Show Footer</Label>
              </div>

              {formData.footer_enabled && (
                <div>
                  <Label>Footer Position</Label>
                  <Select 
                    value={formData.footer_position} 
                    onValueChange={(value) => handleInputChange('footer_position', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? 'Saving...' : 'Save Template'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your template will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplatePreview 
            invoice={previewInvoice}
            template={previewTemplate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateCreator;
