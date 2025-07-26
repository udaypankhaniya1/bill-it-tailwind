-- Add ginlish_text column to item_descriptions table
ALTER TABLE item_descriptions 
ADD COLUMN ginlish_text TEXT;

-- Update existing records to have empty ginlish_text
UPDATE item_descriptions 
SET ginlish_text = '' 
WHERE ginlish_text IS NULL;

-- Create an index for better search performance
CREATE INDEX IF NOT EXISTS idx_item_descriptions_ginlish_text 
ON item_descriptions USING gin(to_tsvector('english', ginlish_text));

-- Update the search function to include ginlish_text
CREATE OR REPLACE FUNCTION search_descriptions(search_term text)
RETURNS TABLE (
  id text,
  english_text text,
  gujarati_text text,
  ginlish_text text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.english_text,
    d.gujarati_text,
    d.ginlish_text,
    d.created_at,
    d.updated_at
  FROM item_descriptions d
  WHERE 
    d.english_text ILIKE '%' || search_term || '%'
    OR d.gujarati_text ILIKE '%' || search_term || '%'
    OR d.ginlish_text ILIKE '%' || search_term || '%'
  ORDER BY d.created_at DESC;
END;
$$;
