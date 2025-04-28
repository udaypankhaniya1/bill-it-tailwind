
import { v4 as uuidv4 } from 'uuid';
import { User } from '@supabase/supabase-js';

// This is a mock user for demo purposes
export const mockUser = {
  id: uuidv4(),
  email: 'demo@example.com',
  name: 'Demo User',
};

// Function to get current user ID (for use with Supabase)
export const getCurrentUserId = (): string => {
  return mockUser.id;
};
