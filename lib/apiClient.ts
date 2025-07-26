import { createSupabaseClient } from './supabase';

// Enhanced API client with Supabase authentication
export class AuthenticatedApiClient {
  private supabase = createSupabaseClient();

  async makeRequest(url: string, options: RequestInit = {}) {
    // Get current session
    const { data: { session } } = await this.supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Only add Content-Type for JSON, not for FormData
    if (!options.body || !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if user is authenticated
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  }

  async post(url: string, data: any) {
    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async get(url: string) {
    const response = await this.makeRequest(url, {
      method: 'GET',
    });
    return response.json();
  }

  async delete(url: string) {
    const response = await this.makeRequest(url, {
      method: 'DELETE',
    });
    return response.json();
  }
}

export const apiClient = new AuthenticatedApiClient();