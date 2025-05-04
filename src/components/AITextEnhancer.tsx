
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAIText } from '@/utils/aiUtils';

interface AITextEnhancerProps {
  initialText?: string;
  onTextEnhanced?: (enhancedText: string) => void;
}

const AITextEnhancer = ({ initialText = '', onTextEnhanced }: AITextEnhancerProps) => {
  const [text, setText] = useState(initialText);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { enhanceTextWithAI } = useAIText();
  
  const handleEnhanceText = async () => {
    setIsLoading(true);
    
    try {
      // Get selected text or all text if nothing is selected
      let selectedText = '';
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        selectedText = start !== end 
          ? text.substring(start, end) 
          : text;
      } else {
        selectedText = text;
      }
      
      const enhancedText = await enhanceTextWithAI(selectedText);
      
      if (enhancedText) {
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          
          // Replace selected text or all text
          if (start !== end) {
            const newText = text.substring(0, start) + enhancedText + text.substring(end);
            setText(newText);
            if (onTextEnhanced) onTextEnhanced(newText);
          } else {
            setText(enhancedText);
            if (onTextEnhanced) onTextEnhanced(enhancedText);
          }
        } else {
          setText(enhancedText);
          if (onTextEnhanced) onTextEnhanced(enhancedText);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Text Enhancer</CardTitle>
        <CardDescription>
          Enhance your text with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to enhance..."
          className="min-h-[200px]"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setText(initialText)}
        >
          Reset
        </Button>
        <Button
          onClick={handleEnhanceText}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : 'Enhance with AI'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AITextEnhancer;
