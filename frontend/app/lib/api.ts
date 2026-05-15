/**
 * Base utility for making API requests via the Next.js proxy
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, finalOptions);
    
    // Attempt to parse JSON response
    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    }
    
    if (!res.ok) {
        const errorMessage = data?.error || data?.message || `API Error (Status ${res.status})`;
        console.error(`[fetchApi] Error ${res.status} on ${url}:`, data);
        throw new Error(errorMessage);
    }
    
    return data;
  } catch (err: any) {
    console.error(`[fetchApi] Network or Parse Error for ${url}:`, err);
    
    // Check if it's a TypeError (usually failed to fetch / network error)
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      console.error(`[fetchApi] CORS or Server Connection Failed at ${url}. Ensure both backends (3000 & 4000) are running.`);
    }

    throw err;
  }
};
