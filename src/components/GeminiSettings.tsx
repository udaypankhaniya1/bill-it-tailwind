
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getGeminiApiKey, updateGeminiApiKey } from '@/services/geminiService';
import { Eye, EyeOff } from 'lucide-react';

const GeminiSettings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoading(true);
      const { api_key, error } = await getGeminiApiKey();
      
      if (error) {
        console.error('Error fetching API key:', error);
      } else if (api_key) {
        setApiKey(api_key);
      }
      
      setIsLoading(false);
    };
    
    fetchApiKey();
  }, []);
  
  const handleSaveApiKey = async () => {
    setIsLoading(true);
    
    try {
      const { success, error } = await updateGeminiApiKey(apiKey);
      
      if (success) {
        toast({
          title: "API key updated",
          description: "Your Gemini API key has been saved successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to save API key",
          description: error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini AI Settings</CardTitle>
        <CardDescription>
          Configure your Gemini AI integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="gemini-api-key">Gemini API Key</Label>
          <div className="flex">
            <Input
              id="gemini-api-key"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
              placeholder="Enter your Gemini API Key"
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={toggleShowApiKey}
              className="ml-2"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your API key is stored securely and used to access Gemini AI features.
            <a 
              href="https://ai.google.dev/tutorials/setup" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Get a Gemini API key
            </a>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveApiKey} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save API Key"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GeminiSettings;
