import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchDescriptions, deleteDescription, Description } from '@/services/descriptionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash, Plus, Search } from 'lucide-react';
import { EditDescriptionDialog } from '@/components/EditDescriptionDialog';

interface DescriptionsListProps {
  viewMode: string; // 'english', 'gujarati', or 'ginlish'
}

const DescriptionsList = ({ viewMode }: DescriptionsListProps) => {
  const { toast } = useToast();
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [selectedDescription, setSelectedDescription] = useState<Description | null>(null);
  
  // Load descriptions
  useEffect(() => {
    loadDescriptions();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'item_descriptions'
        },
        () => {
          loadDescriptions();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchTerm]);
  
  const loadDescriptions = async () => {
    setLoading(true);
    try {
      const data = await fetchDescriptions(searchTerm);
      setDescriptions(data || []);
    } catch (error) {
      console.error('Error loading descriptions:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading descriptions',
        description: 'There was a problem loading the descriptions.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (description: Description) => {
    setSelectedDescription(description);
    setShowEditDialog(true);
  };
  
  const handleDelete = (description: Description) => {
    setSelectedDescription(description);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedDescription) return;
    
    try {
      await deleteDescription(selectedDescription.id);
      toast({
        title: 'Description deleted',
        description: 'The description has been successfully deleted.'
      });
      await loadDescriptions();
    } catch (error) {
      console.error('Error deleting description:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting description',
        description: 'There was a problem deleting the description.'
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedDescription(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreateNew = () => {
    setSelectedDescription(null);
    setShowEditDialog(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Description
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">English Text</TableHead>
              <TableHead className="w-[250px]">Gujarati Text</TableHead>
              <TableHead className="w-[250px]">Ginlish Text</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading descriptions...
                </TableCell>
              </TableRow>
            ) : descriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No descriptions found. {searchTerm && "Try a different search term."}
                </TableCell>
              </TableRow>
            ) : (
              descriptions.map((desc) => (
                <TableRow key={desc.id}>
                  <TableCell className="align-top">
                    {desc.english_text}
                  </TableCell>
                  <TableCell className={viewMode === 'gujarati' ? 'font-gujarati' : ''}>
                    {desc.gujarati_text}
                  </TableCell>
                  <TableCell className={viewMode === 'ginlish' ? 'font-medium' : ''}>
                    {desc.ginlish_text || ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(desc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(desc)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the description:
              <span className="block font-medium mt-2">"{selectedDescription?.english_text}"</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Description Dialog */}
      {showEditDialog && (
        <EditDescriptionDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          description={selectedDescription}
          onSave={() => loadDescriptions()}
        />
      )}
    </div>
  );
};

export default DescriptionsList;
