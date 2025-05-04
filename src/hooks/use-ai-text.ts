
import { useToast } from "@/hooks/use-toast";
import { callGeminiAI } from "@/services/geminiService";

/**
 * Hook to provide AI-powered text enhancement and translation functionality
 */
export const useAIText = () => {
  const { toast } = useToast();

  /**
   * Enhances text using Gemini AI
   * @param text The text to enhance
   * @returns The enhanced text or null if enhancement fails
   */
  const enhanceTextWithAI = async (text: string): Promise<string | null> => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "No text provided",
        description: "Please select or enter text to enhance."
      });
      return null;
    }
    
    try {
      const result = await callGeminiAI(text, 'enhance');
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "AI Enhancement Failed",
          description: result.error
        });
        return null;
      }
      
      return result.enhancedText || null;
    } catch (error: any) {
      console.error("Error enhancing text with AI:", error);
      toast({
        variant: "destructive",
        title: "AI Enhancement Error",
        description: "Failed to process your text. Please try again."
      });
      return null;
    }
  };
  
  /**
   * Translates text to Gujarati using Gemini AI
   * @param text The text to translate
   * @returns The translated text or null if translation fails
   */
  const translateTextWithAI = async (text: string): Promise<string | null> => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "No text provided",
        description: "Please enter text to translate."
      });
      return null;
    }
    
    try {
      const result = await callGeminiAI(text, 'translate');
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "AI Translation Failed",
          description: result.error
        });
        return null;
      }
      
      return result.translatedText || null;
    } catch (error: any) {
      console.error("Error translating text with AI:", error);
      toast({
        variant: "destructive",
        title: "AI Translation Error",
        description: "Failed to translate your text. Please try again."
      });
      return null;
    }
  };
  
  return { enhanceTextWithAI, translateTextWithAI };
};
