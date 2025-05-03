
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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<Description | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isBlurringRef = useRef(false);
  
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

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        handleClosePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Save a new description to the database
  const saveNewDescription = async (english: string) => {
    if (!english.trim()) return;
    
    try {
      // First, translate the text
      const response = await fetch('https://fbkbhdsdhhopjpamgsqb.supabase.co/functions/v1/translate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: english })
      });
      
      if (!response.ok) {
        throw new Error('Failed to translate text');
      }
      
      const { translatedText } = await response.json();
      
      // Then, save to database
      const { data, error } = await supabase
        .from('item_descriptions')
        .insert({
          english_text: english,
          gujarati_text: translatedText
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
    if (!open) setOpen(true);
  };
  
  const handleSelect = (description: Description) => {
    setSelectedDescription(description);
    onChange(description.english_text, description.gujarati_text);
    setOpen(false);
  };

  const handleClosePopover = () => {
    if (isBlurringRef.current) return;
    
    // When popover closes, save the new description if it doesn't exist
    if (value && !selectedDescription) {
      saveNewDescription(value);
    }
    setOpen(false);
  };

  const handleInputFocus = () => {
    if (value) {
      setOpen(true);
      setSearchTerm(value);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Only close if not clicking on the popover content
    if (popoverRef.current && popoverRef.current.contains(e.relatedTarget as Node)) {
      // Don't close, user is interacting with popover
      return;
    }
    
    // Use a small delay to allow clicks on the popover content
    isBlurringRef.current = true;
    setTimeout(() => {
      isBlurringRef.current = false;
      // Close unless we've refocused
      if (document.activeElement !== inputRef.current) {
        handleClosePopover();
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to save the description
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value) {
        saveNewDescription(value);
        setOpen(false);
      }
    }
    
    // Close popover on Escape
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
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
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="p-0 w-[300px]" 
        align="start"
        onInteractOutside={(e) => {
          // Prevent immediate closing when clicking elsewhere
          if (!isBlurringRef.current) {
            e.preventDefault();
          }
        }}
      >
        <Command>
          <CommandInput 
            placeholder="Search descriptions..." 
            value={searchTerm} 
            onValueChange={setSearchTerm}
            autoFocus
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
  );
};

export default DescriptionField;
