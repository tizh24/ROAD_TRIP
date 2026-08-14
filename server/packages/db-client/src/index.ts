import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Base DB client configuration
export function getSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be provided.');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Export specific database types here if generated from Supabase later
export * from './database.types'; // Assuming this will be generated
