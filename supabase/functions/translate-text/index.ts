
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
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

    // In a real implementation, you'd call Google Translate or a similar service here
    // For now, we're using a simple mapping for demonstration purposes
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
    };
    
    const lowerText = text.toLowerCase();
    let translatedText = "";
    
    if (translations[lowerText]) {
      translatedText = translations[lowerText];
    } else {
      // In a real implementation, call an actual translation API here
      translatedText = `${text} (translated to Gujarati)`;
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
