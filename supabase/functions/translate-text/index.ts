
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  text: string;
  targetLanguage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage = "gu" }: TranslateRequest = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    // Try to use Gemini AI if API key is provided
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (geminiApiKey) {
      try {
        // Use Gemini AI for translation
        const geminiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiApiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Translate the following English text to Gujarati, preserving the meaning and context. Don't explain, just return the translation:\n"${text}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        const geminiData = await geminiResponse.json();
        if (
          geminiData.candidates &&
          geminiData.candidates[0]?.content?.parts &&
          geminiData.candidates[0].content.parts[0]?.text
        ) {
          // Clean up the response - remove quotes if they exist
          let translatedText = geminiData.candidates[0].content.parts[0].text.trim();
          
          // If the response is wrapped in quotes, remove them
          if ((translatedText.startsWith('"') && translatedText.endsWith('"')) || 
              (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
            translatedText = translatedText.slice(1, -1);
          }
          
          console.log(`Gemini translation: "${text}" -> "${translatedText}"`);
          return new Response(
            JSON.stringify({ translatedText }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } catch (error) {
        console.error("Error using Gemini API:", error);
        // Fall back to dictionary-based translation
      }
    }

    // Dictionary-based translation fallback
    // Common translations for mandap rental items to Gujarati
    const translations: Record<string, string> = {
      "lagan mandap": "લગ્ન મંડપ",
      "lagan": "લગ્ન",
      "lagn": "લગ્ન",
      "mandap": "મંડપ",
      "mandp": "મંડપ",
      "dom": "ડોમ",
      "dome": "ડોમ",
      "stage": "સ્ટેજ",
      "table": "ટેબલ",
      "chair": "ખુરશી",
      "khurshi": "ખુરશી",
      "tent": "તંબુ",
      "main gate": "મેન ગેટ",
      "gate": "ગેટ",
      "arch": "આર્ચ",
      "welcome gate": "વેલકમ ગેટ",
      "sound system": "સાઉન્ડ સિસ્ટમ",
      "sound": "સાઉન્ડ",
      "system": "સિસ્ટમ",
      "lighting": "લાઇટિંગ",
      "light": "લાઇટ",
      "ac": "એસી",
      "air conditioner": "એર કન્ડિશનર",
      "decoration": "સજાવટ",
      "decor": "ડેકોર",
      "sajawat": "સજાવટ",
      "flower": "ફૂલ",
      "flowers": "ફૂલો",
      "carpet": "કાર્પેટ",
      "red carpet": "રેડ કાર્પેટ",
      "sofa": "સોફા",
      "couch": "સોફા",
      "speaker": "સ્પીકર",
      "microphone": "માઇક્રોફોન",
      "mic": "માઇક",
      "projector": "પ્રોજેક્ટર",
      "screen": "સ્ક્રીન",
      "display": "ડિસ્પ્લે",
      "generator": "જનરેટર",
      "power": "પાવર",
      "electricity": "વીજળી",
      "hanging": "હેંગિંગ",
      "flower pot": "ફૂલદાની",
      "water bottle": "પાણીની બોટલ",
      "fan": "પંખો",
      "cooler": "કૂલર",
      "dj": "ડીજે",
      "music": "સંગીત",
      "sangeet": "સંગીત",
      "video": "વિડિયો",
      "camera": "કેમેરા",
      "photographer": "ફોટોગ્રાફર",
      "photo": "ફોટો",
      "catering": "કેટરિંગ",
      "food": "ખાવાનું",
      "dinner": "ડિનર",
      "lunch": "લંચ",
      "breakfast": "નાસ્તો",
      "dinner set": "ડિનર સેટ",
    };
    
    // Normalize and check for exact match
    const lowerText = text.toLowerCase();
    let translatedText = "";
    
    if (translations[lowerText]) {
      translatedText = translations[lowerText];
    } else {
      // Try to find similar terms or partial matches
      for (const [en, gu] of Object.entries(translations)) {
        if (lowerText.includes(en)) {
          translatedText = gu;
          break;
        }
      }
      
      // If no match found, just use the original text
      if (!translatedText) {
        translatedText = text;
        console.log(`No translation found for: ${text}`);
      }
    }

    return new Response(
      JSON.stringify({ translatedText }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in translate-text function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
