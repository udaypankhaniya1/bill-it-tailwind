
import { callGeminiAI } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

export const useAIText = () => {
  const { toast } = useToast();
  
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
      const result = await callGeminiAI(text);
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "AI Enhancement Failed",
          description: result.error
        });
        return null;
      }
      
      return result.enhancedText || null;
    } catch (error) {
      console.error("Error enhancing text with AI:", error);
      toast({
        variant: "destructive",
        title: "AI Enhancement Error",
        description: "Failed to process your text. Please try again."
      });
      return null;
    }
  };
  
  return { enhanceTextWithAI };
};
