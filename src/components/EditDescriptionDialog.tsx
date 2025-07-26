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
import { saveDescription, Description } from '@/services/descriptionService';
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
  const { translateTextWithAI, generateMultiLanguageText, containsGujarati } = useAIText();
  const [englishText, setEnglishText] = useState('');
  const [gujaratiText, setGujaratiText] = useState('');
  const [ginlishText, setGinlishText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const englishInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form with description data if editing
  useEffect(() => {
    if (description) {
      setEnglishText(description.english_text);
      setGujaratiText(description.gujarati_text);
      setGinlishText(description.ginlish_text || '');

      // Show all fields if any field has content or contains Gujarati
      const hasGujarati = containsGujarati(description.english_text) ||
                         containsGujarati(description.gujarati_text) ||
                         containsGujarati(description.ginlish_text || '');
      const hasMultipleFields = description.gujarati_text || description.ginlish_text;

      setShowAllFields(hasGujarati || hasMultipleFields);
    } else {
      // New description
      setEnglishText('');
      setGujaratiText('');
      setGinlishText('');
      setShowAllFields(false);
    }
  }, [description, containsGujarati]);
  
  // Focus the input when dialog opens
  useEffect(() => {
    if (open && englishInputRef.current) {
      setTimeout(() => {
        englishInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Auto-detect language and show all fields when needed
  const handleTextChange = (field: 'english' | 'gujarati' | 'ginlish', value: string) => {
    switch (field) {
      case 'english':
        setEnglishText(value);
        break;
      case 'gujarati':
        setGujaratiText(value);
        break;
      case 'ginlish':
        setGinlishText(value);
        break;
    }

    // Auto-detect if we should show all fields
    if (containsGujarati(value) && !showAllFields) {
      setShowAllFields(true);
      // Auto-generate other translations
      handleAutoTranslate(value);
    }
  };

  const handleAutoTranslate = async (inputText: string) => {
    if (!inputText.trim() || !containsGujarati(inputText)) return;

    setIsTranslating(true);
    try {
      const translations = await generateMultiLanguageText(inputText);
      if (translations) {
        // Only update empty fields to avoid overwriting user input
        if (!englishText.trim()) setEnglishText(translations.english);
        if (!gujaratiText.trim()) setGujaratiText(translations.gujarati);
        if (!ginlishText.trim()) setGinlishText(translations.ginlish);

        toast({
          title: 'Auto-translations generated',
          description: 'All three language versions have been created. You can edit them as needed.',
        });
      }
    } catch (error: any) {
      console.error('Auto-translation error:', error);
      // Don't show error for auto-translation, just fail silently
    } finally {
      setIsTranslating(false);
    }
  };

  const handleManualTranslate = async () => {
    if (!englishText.trim()) return;

    setIsTranslating(true);
    setShowAllFields(true);

    try {
      const translations = await generateMultiLanguageText(englishText);
      if (translations) {
        setGujaratiText(translations.gujarati);
        setGinlishText(translations.ginlish);

        toast({
          title: 'Translations generated',
          description: 'Gujarati and Ginlish versions have been created.',
        });
      } else {
        throw new Error('Translation failed');
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: 'Translation failed',
        description: error.message || 'There was a problem generating translations',
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
        ginlish_text: ginlishText || englishText,
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
            Enter the description in any language. If you enter Gujarati text, all three language versions will be automatically generated.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="english-text">English Text</Label>
            <Input
              id="english-text"
              ref={englishInputRef}
              value={englishText}
              onChange={(e) => handleTextChange('english', e.target.value)}
              placeholder="Enter description in English"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualTranslate}
              disabled={!englishText.trim() || isTranslating}
            >
              {isTranslating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate All Languages
            </Button>

            {!showAllFields && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAllFields(true)}
              >
                Show All Fields
              </Button>
            )}
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

          <div className="space-y-2">
            <Label htmlFor="ginlish-text">Ginlish Text (Gujarati + English)</Label>
            <Input
              id="ginlish-text"
              value={ginlishText}
              onChange={(e) => setGinlishText(e.target.value)}
              placeholder="Enter description in Ginlish (mixed Gujarati and English)"
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
