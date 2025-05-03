
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

    // Common translations for mandap rental items to Gujarati
    // In production, you'd call Google Translate API or a similar service
    const translations: Record<string, string> = {
      "lagan mandap": "લગ્ન મંડપ",
      "dom": "ડોમ",
      "stage": "સ્ટેજ",
      "table": "ટેબલ",
      "chair": "ખુરશી",
      "tent": "તંબુ",
      "main gate": "મેન ગેટ",
      "sound system": "સાઉન્ડ સિસ્ટમ",
      "lighting": "લાઇટિંગ",
      "ac": "એસી",
      "decoration": "સજાવટ",
      "flower": "ફૂલ",
      "carpet": "કાર્પેટ",
      "sofa": "સોફા",
      "speaker": "સ્પીકર",
      "microphone": "માઇક્રોફોન",
      "projector": "પ્રોજેક્ટર",
      "screen": "સ્ક્રીન",
      "generator": "જનરેટર",
    };
    
    // Normalize and check for exact match
    const lowerText = text.toLowerCase();
    let translatedText = "";
    
    if (translations[lowerText]) {
      translatedText = translations[lowerText];
    } else {
      // Fallback to a simple approximation (in production, use a real translation API)
      // This is just a placeholder - in a real system, you'd use Google Translate API
      translatedText = `${text}`;
      
      // Try to find similar terms or partial matches
      for (const [en, gu] of Object.entries(translations)) {
        if (lowerText.includes(en)) {
          translatedText = gu;
          break;
        }
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
