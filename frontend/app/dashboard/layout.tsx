import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0f0f0f] text-slate-200">
      {/* 1. SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-[#121212] hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-bold text-white">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">AuditChain</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Enterprise Audit</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {['Dashboard', 'Audit Logs', 'Thresholds', 'Reports', 'Settings'].map((item) => (
            <div
              key={item}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                item === 'Audit Logs' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
            <div className="w-8 h-8 rounded-full bg-slate-700" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 truncate">Security Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Breadcrumbs */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#121212]/50 backdrop-blur-sm">
          <div className="text-xs text-slate-500 font-medium">
            System <span className="mx-2 text-slate-700">/</span> 
            <span className="text-slate-300">Audit Records</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
               <input 
                type="text" 
                placeholder="Search events..." 
                className="bg-black/40 border border-slate-800 text-xs rounded-lg px-4 py-2 w-64 focus:outline-none focus:border-orange-500/50 transition-all"
               />
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-800 text-slate-400 cursor-pointer hover:bg-slate-800">
              🔔
            </div>
          </div>
        </header>

        {/* Scrollable Content (Where page.tsx will live) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}