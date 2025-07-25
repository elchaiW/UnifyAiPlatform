'use client';

import { QueryClient } from '@tanstack/react-query';

// Default fetcher for React Query
import type { QueryFunctionContext } from '@tanstack/react-query';

async function defaultQueryFn({ queryKey }: QueryFunctionContext) {
  const [url] = queryKey as string[];
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// API request helper for mutations
export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Create a global query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 60 * 1000, // 1 minute
      retry: false,
    },
  },
});

export default queryClient;