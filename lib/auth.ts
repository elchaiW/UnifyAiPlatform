// Authentication utilities for Luminadoc
import { User } from '@supabase/supabase-js';

// Define user type for our application
export interface AppUser {
  id: number;
  email: string;
  supabaseId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock user data for development/demo purposes
const mockUsers: AppUser[] = [
  {
    id: 1,
    email: 'demo@luminadoc.com',
    supabaseId: 'demo-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

/**
 * Get current user from Supabase user object
 * In a real implementation, this would query the database
 */
export async function getCurrentUser(supabaseUser: User): Promise<AppUser | null> {
  try {
    // For now, return the demo user or create a new one based on Supabase user
    const existingUser = mockUsers.find(u => u.supabaseId === supabaseUser.id);
    
    if (existingUser) {
      return existingUser;
    }

    // Create new user if not exists (in real implementation, this would save to database)
    const newUser: AppUser = {
      id: mockUsers.length + 1,
      email: supabaseUser.email || 'unknown@example.com',
      supabaseId: supabaseUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockUsers.push(newUser);
    return newUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<AppUser | null> {
  return mockUsers.find(u => u.id === id) || null;
}

/**
 * Get demo user (fallback for unauthenticated requests)
 */
export function getDemoUser(): AppUser {
  return mockUsers[0];
}