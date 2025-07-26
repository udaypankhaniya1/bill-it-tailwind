import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DescriptionsList from '@/components/DescriptionsList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const DescriptionsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('english');

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Description Items</h1>
      </div>
      
      <Tabs defaultValue="english" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="gujarati">Gujarati</TabsTrigger>
          <TabsTrigger value="ginlish">Ginlish</TabsTrigger>
        </TabsList>
        
        <TabsContent value="english" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>English Descriptions</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionsList viewMode={activeTab} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gujarati" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Gujarati Descriptions</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionsList viewMode={activeTab} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ginlish" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Ginlish Descriptions (Gujarati + English)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionsList viewMode={activeTab} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DescriptionsPage;
