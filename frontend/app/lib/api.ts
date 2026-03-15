/**
 * Base utility for making API requests via the Next.js proxy
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
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
        throw new Error(data?.error || `API returned status: ${res.status}`);
    }
    
    return data;
  } catch (err) {
    console.error(`API Error for ${url}:`, err);
    throw err;
  }
};
