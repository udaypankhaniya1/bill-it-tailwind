
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
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
import { Check, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAIText } from '@/hooks/use-ai-text';

interface Description {
  id: string;
  english_text: string;
  gujarati_text: string;
}

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string, translatedValue?: string) => void;
  useGujarati?: boolean;
  className?: string;
}

const DescriptionField = ({ 
  value, 
  onChange, 
  useGujarati = false,
  className 
}: DescriptionFieldProps) => {
  const { translateTextWithAI } = useAIText();
  
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<Description | null>(null);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [translationResult, setTranslationResult] = useState('');
  const [originalText, setOriginalText] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const isBlurringRef = useRef(false);
  const mouseDownOnPopoverRef = useRef(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  // Fetch matching descriptions based on search term
  useEffect(() => {
    if (!searchTerm) return;
    
    const fetchDescriptions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('item_descriptions')
          .select('*')
          .ilike('english_text', `%${searchTerm}%`)
          .limit(5);
        
        if (error) throw error;
        
        setDescriptions(data || []);
      } catch (error: any) {
        console.error('Error fetching descriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the search
    const timer = setTimeout(fetchDescriptions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // When value changes externally, try to find a matching description
  useEffect(() => {
    if (!value) return;
    
    const fetchExactMatch = async () => {
      try {
        const { data, error } = await supabase
          .from('item_descriptions')
          .select('*')
          .eq('english_text', value)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        if (data) {
          setSelectedDescription(data);
        }
      } catch (error: any) {
        console.error('Error fetching exact match:', error);
      }
    };
    
    fetchExactMatch();
  }, [value]);

  // Event handlers for better popover behavior
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore clicks inside the popover or input
      if ((popoverRef.current && popoverRef.current.contains(event.target as Node)) ||
          (inputRef.current && inputRef.current.contains(event.target as Node))) {
        return;
      }
      
      // Otherwise, handle closing the popover
      if (open) {
        handleClosePopover();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (popoverRef.current && popoverRef.current.contains(event.target as Node)) {
        mouseDownOnPopoverRef.current = true;
      }
    };

    const handleMouseUp = () => {
      setTimeout(() => {
        mouseDownOnPopoverRef.current = false;
      }, 0);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [open]);
  
  // Translate text using the Supabase edge function
  const translateText = async (text: string) => {
    try {
      // Use Gemini AI for translation
      const translatedText = await translateTextWithAI(text);
      
      if (!translatedText) {
        throw new Error('Translation failed');
      }
      
      return translatedText;
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: 'Translation failed',
        description: error.message,
      });
      return text; // Return original text as fallback
    }
  };
  
  // Save a new description to the database
  const saveNewDescription = async (english: string, gujarati: string) => {
    if (!english.trim()) return null;
    
    try {
      // Save to database
      const { data, error } = await supabase
        .from('item_descriptions')
        .insert({
          english_text: english,
          gujarati_text: gujarati || english // If no translation, just use the English text
        })
        .select()
        .single();
      
      if (error) {
        // If it's a unique constraint error, it means the description already exists
        if (error.code === '23505') { // Unique constraint violation
          // Try to fetch the existing description
          const { data: existingData } = await supabase
            .from('item_descriptions')
            .select('*')
            .eq('english_text', english)
            .single();
            
          if (existingData) {
            setSelectedDescription(existingData);
            onChange(english, existingData.gujarati_text);
            toast({
              title: 'Description found',
              description: 'Using existing translation',
            });
            return existingData;
          }
        } else {
          throw error;
        }
      }
      
      if (data) {
        setSelectedDescription(data);
        onChange(english, data.gujarati_text);
        toast({
          title: 'New description added',
          description: 'Translation has been saved',
        });
        return data;
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving description',
        description: error.message,
      });
      console.error('Error saving new description:', error);
    }
    return null;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setSearchTerm(inputValue);
    
    if (!open) {
      setOpen(true);
    }
  };
  
  const handleSelect = (description: Description) => {
    setSelectedDescription(description);
    onChange(description.english_text, description.gujarati_text);
    setOpen(false);
  };

  const handleClosePopover = () => {
    if (isBlurringRef.current || mouseDownOnPopoverRef.current) return;
    
    // When popover closes, check if we need to save a new description
    if (value && !selectedDescription) {
      // Show translation confirmation dialog
      confirmTranslation(value);
    } else {
      setOpen(false);
    }
  };

  const confirmTranslation = async (text: string) => {
    if (!text.trim()) {
      setOpen(false);
      return;
    }
    
    setOriginalText(text);
    setLoading(true);
    
    try {
      const translatedText = await translateText(text);
      setTranslationResult(translatedText);
      setShowTranslationDialog(true);
    } catch (error) {
      console.error('Error in translation:', error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleSaveTranslation = () => {
    saveNewDescription(originalText, translationResult);
    setShowTranslationDialog(false);
  };

  const handleEditTranslation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranslationResult(e.target.value);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    if (value) {
      setOpen(true);
      setSearchTerm(value);
    }
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    
    // Use a small delay to allow clicks on the popover content
    isBlurringRef.current = true;
    setTimeout(() => {
      isBlurringRef.current = false;
      
      // If popover was not clicked and the input is no longer focused, close the popover
      if (!mouseDownOnPopoverRef.current && !inputFocused) {
        handleClosePopover();
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to save the description
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value) {
        confirmTranslation(value);
      }
    }
    
    // Close popover on Escape
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={inputRef}
              value={useGujarati && selectedDescription?.gujarati_text ? selectedDescription.gujarati_text : value}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={useGujarati ? "વર્ણન દાખલ કરો" : "Enter description"}
              className={className}
              data-testid="description-input"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          ref={popoverRef}
          className="p-0 w-[300px]" 
          align="start"
          onInteractOutside={(e) => {
            // This prevents immediate closing when clicking elsewhere
            if (isBlurringRef.current || mouseDownOnPopoverRef.current) {
              e.preventDefault();
            }
          }}
          onOpenAutoFocus={(e) => {
            // Prevent auto-focusing on open to avoid stealing focus from input
            e.preventDefault();
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput 
              ref={commandInputRef}
              placeholder="Search descriptions..." 
              value={searchTerm} 
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading...</CommandEmpty>
              ) : descriptions.length === 0 ? (
                <CommandEmpty>
                  No matches found. Press Enter to add "{searchTerm || value}".
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {descriptions.map((desc) => (
                    <CommandItem
                      key={desc.id}
                      onSelect={() => handleSelect(desc)}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <div className="font-medium">{desc.english_text}</div>
                        <div className="text-sm text-muted-foreground">{desc.gujarati_text}</div>
                      </div>
                      {selectedDescription?.id === desc.id && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Translation confirmation dialog */}
      <AlertDialog open={showTranslationDialog} onOpenChange={setShowTranslationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Translation</AlertDialogTitle>
            <AlertDialogDescription>
              Please review and confirm the translation before saving:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Original text:</p>
              <p className="rounded-md bg-muted p-2">{originalText}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Translated text:</p>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => inputRef.current?.focus()}>
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </div>
              <Input
                value={translationResult}
                onChange={handleEditTranslation}
                className="font-gujarati"
                dir="auto"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveTranslation}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DescriptionField;
