"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function DevDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick verify, if any error, bounce to login
    const checkAuth = async () => {
      try {
        await fetchApi('/dev/dashboard');
        setLoading(false);
      } catch (err) {
        router.push('/dev/login');
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white overflow-hidden selection:bg-white/20">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.15)_0%,_transparent_70%)] blur-[80px]" />
        <div className="absolute top-[70%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 max-w-4xl animate-[fadeUp_0.6s_ease-out]">
        
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-light tracking-tight mb-4 text-white">
            Developer <span className="font-semibold text-blue-400">Dashboard</span>
          </h1>
          <p className="text-neutral-400">Authenticated System Access Verified.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Link href="/audit" className="group p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/[0.05] rounded-3xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Audit Ledger</h2>
            <p className="text-sm text-neutral-500">View public un-tamperable audit logs of system activity.</p>
          </Link>

          <Link href="/dev/access-logs" className="group p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/[0.05] rounded-3xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Logs</h2>
            <p className="text-sm text-neutral-500">Monitor internal developer authentication and sessions.</p>
          </Link>
          
          <Link href="/dev/admin" className="group p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/[0.05] rounded-3xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_rgba(176,58,46,0.15)] flex flex-col justify-center items-center text-center md:col-span-2">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Personnel Management</h2>
            <p className="text-sm text-neutral-500">Manage internal operator access, blocks, and credentials.</p>
          </Link>

        </div>

        <div className="mt-12 text-center">
          <button
            onClick={async () => {
              try {
                await fetchApi('/dev/logout');
                window.location.href = '/dev/login';
              } catch (e) {
                window.location.href = '/dev/login';
              }
            }}
            className="px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-semibold shadow-sm inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Terminate Session
          </button>
        </div>

      </div>
    </div>
  );
}
