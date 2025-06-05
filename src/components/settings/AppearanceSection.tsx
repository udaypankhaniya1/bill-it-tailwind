
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setCurrentTheme } from '@/redux/slices/templateSlice';
import { useToast } from '@/hooks/use-toast';

const AppearanceSection = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Get theme data from Redux
  const { currentTheme, themes } = useSelector((state: RootState) => state.template);

  const handleThemeChange = (themeId: string) => {
    dispatch(setCurrentTheme(themeId));
    toast({
      title: "Theme updated",
      description: "Your theme preference has been saved",
    });
  };

  return (
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
  );
};

export default AppearanceSection;
