import { headers } from 'next/headers';
import Link from 'next/link';

interface AuditLog {
  id: number;
  action: string;
  user_id: string;
  timestamp: string;
  previous_hash: string;
  current_hash: string;
}

// Reusable function to fetch audit logs (same as audit page)
async function getAuditLogs() {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    
    // Determine the base URL for the API route
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = headersList.get('host') || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/audit`;

    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Cookie': cookie
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    
    const data = await res.json();
    return data.logs || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

export default async function HashesPage() {
  const logs: AuditLog[] = await getAuditLogs();
  
  // Sort logs to show oldest first (Genesis block at the top/beginning)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 relative overflow-hidden font-sans">
      {/* Background Ambience (Login Page Style) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#1a0505] blur-[120px] opacity-70 mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#2a0808] blur-[100px] opacity-60 mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[#150303] blur-[90px] opacity-80 mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 hidden sm:block">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <h1 className="text-4xl font-bold tracking-tight">The Data Matrix</h1>
            </div>
            <p className="text-neutral-400 max-w-xl text-lg font-light">
              Visualizing the immutable chain of cryptographic hashes securing the network.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/audit" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors backdrop-blur-md inline-flex items-center gap-2 text-neutral-300 hover:text-white">
              <svg className="w-4 h-4 translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Standard Logs
            </Link>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-24 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="text-neutral-500 mb-2 font-mono text-sm">NO_DATA_FOUND</div>
            <p className="text-neutral-400">The cryptographic network is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative">
            
            {sortedLogs.map((log, index) => {
              const isGenesis = log.previous_hash === '0';
              const isLatest = index === sortedLogs.length - 1;
              const dateObj = new Date(log.timestamp);
              const isValidDate = !isNaN(dateObj.getTime());
              const formattedDate = isValidDate ? dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'UNKNOWN';
              const formattedTime = isValidDate ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'TIME';
              
              // Delay animation based on index
              const animationDelay = `${index * 0.15}s`;

              return (
                <div 
                  key={index}
                  className="group relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.15)] flex flex-col justify-between"
                  style={{ animationDelay, animationDuration: '0.7s' }}
                >
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20 rounded-tl-2xl opacity-0 group-hover:opacity-100 group-hover:border-cyan-400 transition-all duration-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20 rounded-br-2xl opacity-0 group-hover:opacity-100 group-hover:border-cyan-400 transition-all duration-500"></div>

                  {/* Header / Meta */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold tracking-widest ${isGenesis ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' : 'text-neutral-300 bg-white/5 border border-white/10'}`}>
                         {isGenesis ? 'GENESIS ROOT' : `BLOCK ${index}`}
                      </div>
                      {isLatest && (
                        <div className="px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          HEAD
                        </div>
                      )}
                    </div>
                    {/* Action Type */}
                    <div className="text-right">
                       <span className="text-[10px] text-neutral-500 font-mono block mb-1">ACTION_TYPE</span>
                       <span className="text-xs text-white font-medium tracking-wide bg-white/5 px-2 py-1 rounded border border-white/5">{log.action || 'UNKNOWN'}</span>
                    </div>
                  </div>

                  {/* Hashes Container */}
                  <div className="space-y-4 flex-grow flex flex-col justify-center my-4">
                    {/* Previous Hash */}
                    <div className="relative">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-2 pl-4 border-l border-white/10">PREV_HASH</div>
                      <div className="font-mono text-xs text-neutral-400 break-all pl-4 border-l border-white/10 group-hover:border-white/30 transition-colors">
                        {log.previous_hash}
                      </div>
                    </div>

                    {/* Visual separator */}
                    <div className="pl-4 flex flex-col items-start gap-1">
                       <div className="w-0.5 h-1 bg-white/10"></div>
                       <div className="w-0.5 h-1 bg-white/10"></div>
                       <div className="w-0.5 h-1 bg-white/10 group-hover:bg-cyan-500/50 transition-colors"></div>
                    </div>

                    {/* Current Hash */}
                    <div className="relative">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-500/70 mb-2 pl-4 border-l-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors">CURR_HASH</div>
                      <div className="font-mono text-xs md:text-sm text-white break-all pl-4 border-l-2 border-cyan-500/30 group-hover:border-cyan-400 group-hover:text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all duration-300">
                        {log.current_hash}
                      </div>
                    </div>
                  </div>

                  {/* Footer / Timestamp */}
                  <div className="pt-5 border-t border-white/5 mt-2 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                     <span>SYS_TIME // {formattedDate} {formattedTime}</span>
                     <span>USER_ID // {log.user_id || 'SYS'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

       {/* Mobile warning message since grids are complex on very small screens, though it is responsive */}
       <div className="sm:hidden flex items-center justify-center min-h-screen p-6 text-center">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
             <svg className="w-10 h-10 text-neutral-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
             </svg>
             <h2 className="text-white font-semibold mb-2">Desktop Recommended</h2>
             <p className="text-sm text-neutral-400">The Data Matrix visualization requires a larger viewport for the optimal experience.</p>
             <Link href="/audit" className="mt-6 inline-block px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg">Return to Basic Logs</Link>
          </div>
       </div>

    </div>
  );
}
