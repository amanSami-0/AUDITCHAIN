'use client';

import { useState } from 'react';
import { fetchApi } from './lib/api';

export default function Home() {
  const [status, setStatus] = useState<string>('Not tested');
  const [data, setData] = useState<any>(null);

  const testLogin = async () => {
    try {
      setStatus('Testing connection array...');
      // We send a dummy login request to test the connection.
      // Expected result: 401 Unauthorized or 404 User not found (which means connection succeeded)
      const response = await fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });
      setData(response);
      setStatus('Success');
    } catch (err: any) {
      // Even if it's a 401 error, we want to show the specific error message returned by our API
      // Our API proxy throws whatever error message comes back, or "API returned status..."
      setStatus(`Resolved with Error: ${err.message}`);
      // Usually if the backend responds, we connected successfully even if it's an error.
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-white">
      <div className="z-10 max-w-3xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AuditChain API Connection Test
        </h1>
        
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-50 w-full text-center">
          <p className="mb-6 text-zinc-300">Click below to test the Next.js API Proxy (`/api/*`) connected to the Express backend.</p>
          <button 
            onClick={testLogin}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] font-semibold"
          >
            Test Auth API (/api/login)
          </button>
          
          <div className="mt-8 p-4 bg-black/50 rounded-lg border border-zinc-800/50 text-left">
            <p className="text-xs text-zinc-500 mb-2">Status:</p>
            <p className={`font-medium ${status.includes('Error') ? 'text-amber-400' : 'text-green-400'}`}>
              {status}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Note: An &quot;Error&quot; status like &quot;User not found&quot; means the connection was actually successful, as the Express backend returned that API error!
            </p>
            
            {data && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Response Data:</p>
                <pre className="text-xs text-zinc-300 bg-zinc-900 p-4 rounded overflow-x-auto border border-zinc-800">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}