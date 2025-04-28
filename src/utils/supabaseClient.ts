
// This is a placeholder for the Supabase client
// You'll need to connect your Lovable project to Supabase
// and replace this with the actual Supabase client configuration

export const supabaseClient = {
  auth: {
    signIn: async () => Promise.resolve({ user: null, error: new Error('Supabase not connected') }),
    signUp: async () => Promise.resolve({ user: null, error: new Error('Supabase not connected') }),
    signOut: async () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: new Error('Supabase not connected') }),
    }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Supabase not connected') }),
      getPublicUrl: () => ({ publicUrl: '' }),
    }),
  },
};

// Helper for type safety with Redux
export const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Demo User',
};
