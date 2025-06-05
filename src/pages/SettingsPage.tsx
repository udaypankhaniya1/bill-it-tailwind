
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, MessageSquare } from 'lucide-react';
import TemplatesSection from '@/components/settings/TemplatesSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import AISection from '@/components/settings/AISection';
import WhatsAppSection from '@/components/settings/WhatsAppSection';

const SettingsPage = () => {
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
          <TemplatesSection />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSection />
        </TabsContent>

        <TabsContent value="ai">
          <AISection />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
