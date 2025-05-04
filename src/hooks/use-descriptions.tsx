
import { useState, useEffect } from 'react';
import { Description } from '@/components/DescriptionsList';
import { fetchDescriptions } from '@/services/descriptionService';
import { supabase } from '@/integrations/supabase/client';

export const useDescriptions = (searchTerm: string = '') => {
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDescriptions = async () => {
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
    };
    
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
  }, [searchTerm]);
  
  return { descriptions, loading, error, refresh: () => setSearchTerm('') };
};

export default useDescriptions;
