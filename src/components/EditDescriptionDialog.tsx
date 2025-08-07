
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditDescriptionDialogProps {
  id: string;
  englishText: string;
  gujaratiText: string;
  onUpdate: (id: string, englishText: string, gujaratiText: string) => void;
}

export const EditDescriptionDialog = ({ 
  id, 
  englishText, 
  gujaratiText, 
  onUpdate 
}: EditDescriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [english, setEnglish] = useState(englishText);
  const [gujarati, setGujarati] = useState(gujaratiText);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEnglish(englishText);
    setGujarati(gujaratiText);
  }, [englishText, gujaratiText]);

  const handleSave = async () => {
    if (!english.trim() || !gujarati.trim()) {
      toast({
        title: "Error",
        description: "Both English and Gujarati text are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('item_descriptions')
        .update({
          english_text: english.trim(),
          gujarati_text: gujarati.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      onUpdate(id, english.trim(), gujarati.trim());
      setOpen(false);
      toast({
        title: "Success",
        description: "Description updated successfully",
      });
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Description</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="english">English</Label>
            <Input
              id="english"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="Enter English description"
            />
          </div>
          <div>
            <Label htmlFor="gujarati">Gujarati</Label>
            <Input
              id="gujarati"
              value={gujarati}
              onChange={(e) => setGujarati(e.target.value)}
              placeholder="Enter Gujarati description"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
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
