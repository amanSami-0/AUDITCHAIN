"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface AccessLog {
  id: number;
  developer_id: number;
  session_id: string;
  ip_address: string;
  device: string;
  login_time: string;
  logout_time: string | null;
}

export default function DevAccessLogs() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const devId = searchParams.get('developer_id');

  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchApi('/dev/access-logs');
      if (data.logs) setLogs(data.logs);
      if (data.userMap) setUserMap(data.userMap);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        window.location.href = '/dev/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleKick = async (sessionId: string) => {
    if (!confirm("Terminate session forcefully?")) return;
    try {
      await fetchApi(`/dev/kick/${sessionId}`);
      loadData();
    } catch (e: any) {
      if (e.message === "Unauthorized") {
        window.location.href = '/dev/login';
      } else {
        alert("Failed to kick session");
      }
    }
  };

  const parseDevice = (userAgentStr: string) => {
    if (!userAgentStr) return "Unknown";
    if (userAgentStr.length > 30) return userAgentStr.substring(0, 30) + "...";
    return userAgentStr;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-white/20">

      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[80%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_0%,_transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-12 max-w-[1400px]">

        <header className="mb-10 flex items-center justify-between border-b border-white/10 pb-6 animate-[fadeUp_0.4s_ease-out]">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2">
              Operator <span className="font-semibold text-white">Access Logs</span>
            </h1>
            <p className="text-neutral-400 text-sm">Monitor developer authentication footprint and secure active endpoints.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dev/admin" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors text-neutral-300 flex items-center">
              Personnel Management
            </Link>
            <Link href="/dev/dashboard" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors flex items-center">
              Dashboard
            </Link>
          </div>
        </header>

        <main className="animate-[fadeUp_0.6s_ease-out_0.1s_forwards] opacity-0">
          <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

            {loading ? (
              <div className="p-32 text-center text-neutral-500">
                <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="tracking-widest uppercase text-xs">Tracing signatures...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-32 text-center text-neutral-500">
                No access records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#151515] border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    <tr>
                      <th className="px-6 py-5 rounded-tl-2xl">Timeline</th>
                      <th className="px-6 py-5">Operator</th>
                      <th className="px-6 py-5">Network IP</th>
                      <th className="px-6 py-5">Device Sig</th>
                      <th className="px-6 py-5 text-right rounded-tr-2xl">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => {
                      const inTime = new Date(log.login_time).toLocaleString();
                      const outTime = log.logout_time ? new Date(log.logout_time).toLocaleString() : null;
                      const isActive = !log.logout_time;
                      const uName = log.developer_id ? (userMap[log.developer_id.toString()] || 'Unknown ID') : 'INTRUDER';

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.02] group">

                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-emerald-400/80 font-mono text-xs">IN: {inTime}</span>
                              <span className="text-neutral-500 font-mono text-xs mt-1">
                                OUT: {outTime || '---'}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-neutral-400">
                                {log.developer_id || '⚠️'}
                              </div>
                              <span className="font-semibold text-neutral-200">{uName}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                            {log.ip_address === '::1' ? '127.0.0.1' : log.ip_address}
                          </td>

                          <td className="px-6 py-4 text-xs text-neutral-500">
                            {parseDevice(log.device)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {isActive ? (
                              <div className="flex items-center justify-end gap-3">
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  Active Endpoint
                                </span>
                                <button
                                  onClick={() => handleKick(log.session_id)}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors text-xs font-semibold"
                                >
                                  Terminate
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Terminated
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
