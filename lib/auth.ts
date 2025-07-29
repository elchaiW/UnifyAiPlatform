import { createSupabaseClient, Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Get current user profile
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createSupabaseClient();
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
}

// Create or update user profile
export async function upsertUserProfile(
  userId: string,
  email: string,
  updates: Partial<Profile> = {}
): Promise<Profile | null> {
  const supabase = createSupabaseClient();

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        ...updates,
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in upsertUserProfile:', error);
    return null;
  }
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

// Sign up with email/password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  fullName?: string
) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return { data, error };
}

// Sign out
export async function signOut() {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current session
export async function getCurrentSession() {
  const supabase = createSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}