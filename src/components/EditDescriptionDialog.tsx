
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAIText } from '@/hooks/use-ai-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { saveDescription } from '@/services/descriptionService';
import { Description } from './DescriptionsList';
import { Loader2 } from 'lucide-react';

interface EditDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: Description | null;
  onSave: () => void;
}

const EditDescriptionDialog = ({ 
  open, 
  onOpenChange, 
  description, 
  onSave 
}: EditDescriptionDialogProps) => {
  const { toast } = useToast();
  const { translateTextWithAI } = useAIText();
  const [englishText, setEnglishText] = useState('');
  const [gujaratiText, setGujaratiText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const englishInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form with description data if editing
  useEffect(() => {
    if (description) {
      setEnglishText(description.english_text);
      setGujaratiText(description.gujarati_text);
    } else {
      // New description
      setEnglishText('');
      setGujaratiText('');
    }
  }, [description]);
  
  // Focus the input when dialog opens
  useEffect(() => {
    if (open && englishInputRef.current) {
      setTimeout(() => {
        englishInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleTranslate = async () => {
    if (!englishText.trim()) return;
    
    setIsTranslating(true);
    try {
      const translatedText = await translateTextWithAI(englishText);
      if (translatedText) {
        setGujaratiText(translatedText);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: 'Translation failed',
        description: error.message || 'There was a problem translating the text',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!englishText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'English text is required',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await saveDescription({
        id: description?.id,
        english_text: englishText,
        gujarati_text: gujaratiText || englishText,
      });
      
      toast({
        title: description ? 'Description updated' : 'Description created',
        description: description 
          ? 'The description has been successfully updated' 
          : 'The description has been successfully created',
      });
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving description:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving description',
        description: error.message || 'There was a problem saving the description',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{description ? 'Edit Description' : 'Add New Description'}</DialogTitle>
          <DialogDescription>
            Enter the description details below. You can use AI to help translate to Gujarati.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="english-text">English Text</Label>
            <Input
              id="english-text"
              ref={englishInputRef}
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              placeholder="Enter description in English"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTranslate}
              disabled={!englishText.trim() || isTranslating}
            >
              {isTranslating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Translate to Gujarati
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gujarati-text">Gujarati Text</Label>
            <Input
              id="gujarati-text"
              value={gujaratiText}
              onChange={(e) => setGujaratiText(e.target.value)}
              placeholder="Enter description in Gujarati"
              className="font-gujarati"
              dir="auto"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!englishText.trim() || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {description ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDescriptionDialog;
