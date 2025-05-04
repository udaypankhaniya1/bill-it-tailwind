
import { useState, useEffect, useCallback } from 'react';
import { Description } from '@/components/DescriptionsList';
import { fetchDescriptions } from '@/services/descriptionService';
import { supabase } from '@/integrations/supabase/client';

export const useDescriptions = (searchTerm: string = '') => {
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadDescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchDescriptions(searchTerm);
      setDescriptions(data || []);
    } catch (err) {
      console.error('Error loading descriptions:', err);
      setError('Failed to load descriptions');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);
  
  useEffect(() => {
    loadDescriptions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'item_descriptions'
        },
        () => {
          loadDescriptions();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDescriptions]);
  
  const refresh = () => {
    loadDescriptions();
  };
  
  return { descriptions, loading, error, refresh };
};

export default useDescriptions;
