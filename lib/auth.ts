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

// Get current user from Supabase auth user object
export async function getCurrentUser(supabaseUser: any): Promise<{ id: number } | null> {
  if (!supabaseUser?.id) {
    return null;
  }

  // For now, we'll use a simple mapping approach
  // In production, you'd want to maintain a users table that maps Supabase IDs to numeric IDs
  // For demo purposes, we'll use a hash-based approach to generate consistent numeric IDs
  
  try {
    // Create a simple hash from the Supabase user ID to get a consistent numeric ID
    const hash = supabaseUser.id.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a; // Convert to 32-bit integer
    }, 0);
    
    // Ensure positive ID and avoid 0
    const numericId = Math.abs(hash) || 1;
    
    return { id: numericId };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    // Fallback to demo user ID
    return { id: 1 };
  }
}