
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Description } from "@/services/descriptionService";

interface EditDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: Description | null;
  onSave: () => Promise<void>;
}

export const EditDescriptionDialog = ({ 
  open,
  onOpenChange,
  description,
  onSave 
}: EditDescriptionDialogProps) => {
  const [englishText, setEnglishText] = useState('');
  const [gujaratiText, setGujaratiText] = useState('');
  const [ginlishText, setGinlishText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (description) {
      setEnglishText(description.english_text || '');
      setGujaratiText(description.gujarati_text || '');
      setGinlishText(description.ginlish_text || '');
    } else {
      // Clear form for new description
      setEnglishText('');
      setGujaratiText('');
      setGinlishText('');
    }
  }, [description]);

  const handleSave = async () => {
    if (!englishText.trim() || !gujaratiText.trim()) {
      toast({
        title: "Error",
        description: "Both English and Gujarati text are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (description) {
        // Update existing description
        const { error } = await supabase
          .from('item_descriptions')
          .update({
            english_text: englishText.trim(),
            gujarati_text: gujaratiText.trim(),
            ginlish_text: ginlishText.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', description.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Description updated successfully",
        });
      } else {
        // Create new description
        const { error } = await supabase
          .from('item_descriptions')
          .insert({
            english_text: englishText.trim(),
            gujarati_text: gujaratiText.trim(),
            ginlish_text: ginlishText.trim(),
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Description created successfully",
        });
      }

      await onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving description:', error);
      toast({
        title: "Error",
        description: "Failed to save description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {description ? 'Edit Description' : 'Add New Description'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="english">English Text</Label>
            <Textarea
              id="english"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              placeholder="Enter English description"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="gujarati">Gujarati Text</Label>
            <Textarea
              id="gujarati"
              value={gujaratiText}
              onChange={(e) => setGujaratiText(e.target.value)}
              placeholder="Enter Gujarati description"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="ginlish">Ginlish Text (Optional)</Label>
            <Textarea
              id="ginlish"
              value={ginlishText}
              onChange={(e) => setGinlishText(e.target.value)}
              placeholder="Enter Ginlish description"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
