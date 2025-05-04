
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, apiKey, action = 'enhance' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Gemini API with different prompts based on action
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
    let prompt = '';
    if (action === 'translate') {
      prompt = `Translate the following English text into Gujarati. Return only the translation inside {{ }}, no explanation or additional text: "${text}"`;
    } else {
      prompt = `Enhance the following text professionally while preserving its formatting (bold, italic, lists, headings, and code blocks). Return only the improved version inside {{ }}:\n\n"${text}"`;
    }

    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from Gemini API', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    try {
      // Extract the enhanced/translated text from the response
      const rawText = data.candidates[0].content.parts[0].text;
      const resultText = rawText.match(/{{(.*?)}}/s)?.[1]?.trim() || rawText;
      
      if (action === 'translate') {
        return new Response(
          JSON.stringify({ translatedText: resultText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ enhancedText: resultText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Error parsing Gemini response', 
          details: error.message,
          rawResponse: data 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in gemini-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
