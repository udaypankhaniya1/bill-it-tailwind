import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setCurrentTheme, ThemeOption } from '@/redux/slices/templateSlice';
import { CheckCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { applyThemeStyles } from '@/utils/themeUtils';
import GeminiSettings from './GeminiSettings';

interface ProfileSettingsProps {
  businessName: string;
  address: string;
  gstNumber: string;
  phoneNumber: string;
  onSaveBusinessInfo: () => void;
  onUploadLogo: () => void;
}

const ProfileSettings = ({ 
  businessName, 
  address, 
  gstNumber, 
  phoneNumber,
  onSaveBusinessInfo,
  onUploadLogo
}: ProfileSettingsProps) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const themes = useSelector((state: RootState) => state.template.themes);
  const currentTheme = useSelector((state: RootState) => state.template.currentTheme);
  const [selectedFont, setSelectedFont] = useState<string>('inter');
  
  useEffect(() => {
    // Apply theme when component mounts or theme changes
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      applyThemeStyles(theme, selectedFont);
    }
  }, [currentTheme, themes]);
  
  const handleThemeChange = (themeId: string) => {
    dispatch(setCurrentTheme(themeId));
    
    // Find the selected theme
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      // Apply the theme styles
      applyThemeStyles(theme, selectedFont);
    }
    
    toast({
      title: "Theme updated",
      description: "Your theme settings have been updated successfully",
    });
  };
  
  const handleFontChange = (value: string) => {
    setSelectedFont(value);
    
    // Find current theme and reapply with new font
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      applyThemeStyles(theme, value);
    }
    
    toast({
      title: "Font updated",
      description: "Your font settings have been updated successfully",
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize how your application looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="block mb-2">Application Theme</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((theme: ThemeOption) => (
                  <div
                    key={theme.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      currentTheme === theme.id ? 'ring-2 ring-primary' : 'hover:border-primary/30'
                    }`}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <div 
                      className={`h-24 rounded-md mb-2 relative`}
                      style={{ 
                        backgroundColor: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-6" 
                           style={{ backgroundColor: theme.colors.primary, opacity: 0.2 }} />
                      
                      <div className="flex p-2 gap-1 justify-end absolute top-1 right-1">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: theme.colors.primary }}
                        ></div>
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: theme.colors.secondary }}
                        ></div>
                      </div>
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="h-2 w-3/4 rounded-sm mb-1"
                             style={{ backgroundColor: theme.colors.primary, opacity: 0.7 }}></div>
                        <div className="h-2 w-1/2 rounded-sm"
                             style={{ backgroundColor: theme.colors.muted }}></div>
                      </div>
                    </div>
                    <p 
                      className="text-xs font-medium text-center"
                      style={{ color: theme.mode === 'dark' ? '#fff' : '#000' }}
                    >
                      {theme.name}
                    </p>
                    {currentTheme === theme.id && (
                      <div className="flex justify-center mt-1">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="font">Application Font</Label>
              <Select value={selectedFont} onValueChange={handleFontChange}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="poppins">Poppins</SelectItem>
                  <SelectItem value="montserrat">Montserrat</SelectItem>
                  <SelectItem value="opensans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4">
                <p className="mb-2 text-sm text-muted-foreground">Preview:</p>
                <div className={`p-4 border rounded-md font-${selectedFont}`}>
                  <p className="text-2xl font-bold mb-2">The quick brown fox jumps over the lazy dog</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
                defaultValue={businessName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                defaultValue={address}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  defaultValue={gstNumber}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  defaultValue={phoneNumber}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={onSaveBusinessInfo}>Save Changes</Button>
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
              <Button onClick={onUploadLogo}>Upload Logo</Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Logo uploading requires Supabase integration
          </p>
        </CardContent>
      </Card>
      
      <GeminiSettings />
    </div>
  );
};

export default ProfileSettings;
