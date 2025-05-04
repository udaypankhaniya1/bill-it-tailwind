
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import DescriptionsList from '@/components/DescriptionsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const DescriptionsPage = () => {
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Description Items</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Descriptions</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionsList viewMode="english" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DescriptionsPage;
