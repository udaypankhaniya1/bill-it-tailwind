import { useToast } from "@/hooks/use-toast";
import { callGeminiAI } from "@/services/geminiService";
import { containsGujarati, detectLanguage } from "@/utils/languageDetection";

interface MultiLanguageTranslation {
  english: string;
  gujarati: string;
  ginlish: string;
}

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

  /**
   * Generates all three language versions when Gujarati is detected
   * @param text The input text (any language)
   * @returns Object with English, Gujarati, and Ginlish versions
   */
  const generateMultiLanguageText = async (text: string): Promise<MultiLanguageTranslation | null> => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "No text provided",
        description: "Please enter text to generate translations."
      });
      return null;
    }

    try {
      const language = detectLanguage(text);

      // Create enhanced prompt for multi-language generation
      const prompt = `Given the following text: "${text}"

Language detected: ${language}

Please provide three versions:
1. English version (clear, professional business language)
2. Gujarati version (proper Gujarati script)
3. Ginlish version (mixed Gujarati-English as commonly used in Gujarat business)

Format the response as JSON:
{
  "english": "...",
  "gujarati": "...",
  "ginlish": "..."
}

Ensure all versions convey the same meaning but are culturally appropriate for their respective contexts.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate translations');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from AI');
      }

      // Try to parse JSON response
      try {
        const translations = JSON.parse(generatedText.replace(/```json\n?|```/g, ''));
        return {
          english: translations.english || text,
          gujarati: translations.gujarati || text,
          ginlish: translations.ginlish || text
        };
      } catch (parseError) {
        // Fallback: use single translation
        const gujaratiResult = await translateTextWithAI(text);
        return {
          english: language === 'english' ? text : text, // Keep original if not English
          gujarati: gujaratiResult || text,
          ginlish: `${text} (${gujaratiResult || text})` // Simple mix
        };
      }

    } catch (error: any) {
      console.error("Error generating multi-language text:", error);
      toast({
        variant: "destructive",
        title: "Multi-language Generation Error",
        description: "Failed to generate all language versions. Please try again."
      });
      return null;
    }
  };
  
  return {
    enhanceTextWithAI,
    translateTextWithAI,
    generateMultiLanguageText,
    detectLanguage: (text: string) => detectLanguage(text),
    containsGujarati: (text: string) => containsGujarati(text)
  };
};
