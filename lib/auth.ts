import { createClient } from '@supabase/supabase-js';
import { dbStorage } from './database';
import type { SelectUser, InsertUser } from '@/shared/schema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCurrentUser(supabaseUser: any): Promise<SelectUser | null> {
  if (!supabaseUser) return null;

  // Try to find user by Supabase ID
  let user = await dbStorage.getUserBySupabaseId(supabaseUser.id);

  // If user doesn't exist, create them
  if (!user) {
    const userData: InsertUser = {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
      username: supabaseUser.email.split('@')[0], // Simple username from email
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
    };

    user = await dbStorage.createUser(userData);
  }

  return user;
}

export { supabase };