"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import Link from "next/link";
import { UAParser } from "ua-parser-js";

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  attribute_name: string;
  ip_address: string;
  user_agent: string;
  previous_hash: string;
  current_hash: string;
  createdAt: string;
}

interface AggregatedAuditLog extends Omit<AuditLog, 'attribute_name' | 'id'> {
  id: string; // Group ID
  attributes: string[];
  count: number;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AggregatedAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await fetchApi('/audit');
        const rawLogs: AuditLog[] = data.logs || [];
        
        // Aggregate Logs
        const aggregated: AggregatedAuditLog[] = [];
        
        rawLogs.forEach(log => {
          if (aggregated.length === 0) {
            aggregated.push({
              ...log,
              id: log.id.toString(),
              attributes: log.attribute_name ? [log.attribute_name] : [],
              count: 1
            });
            return;
          }

          const lastGroup = aggregated[aggregated.length - 1];
          const timeDiff = Math.abs(new Date(lastGroup.createdAt).getTime() - new Date(log.createdAt).getTime());
          const isSameAction = lastGroup.action === log.action;
          const isSameUser = lastGroup.user_id === log.user_id;
          const isWithin15Mins = timeDiff <= 15 * 60 * 1000;

          if (isSameAction && isSameUser && isWithin15Mins) {
            lastGroup.count += 1;
            if (log.attribute_name && !lastGroup.attributes.includes(log.attribute_name)) {
              lastGroup.attributes.push(log.attribute_name);
            }
          } else {
            aggregated.push({
              ...log,
              id: log.id.toString(),
              attributes: log.attribute_name ? [log.attribute_name] : [],
              count: 1
            });
          }
        });

        setLogs(aggregated);
      } catch (err: unknown) {
        console.error("Failed to load audit logs", err);
        setErrorMsg("Failed to load audit logs. Are you sure the backend SDK is logging?");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action?.includes('Registered')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (action?.includes('Updated')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (action?.includes('Deleted')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (action?.includes('In')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (action?.includes('Out')) return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
    if (action?.includes('Reset')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-neutral-300 bg-white/5 border-white/10';
  };

  const parseDevice = (userAgentStr: string) => {
    if (!userAgentStr) return "Unknown Device";
    try {
      const parser = new UAParser(userAgentStr);
      const browser = parser.getBrowser().name;
      const os = parser.getOS().name;

      if (browser && os) return `${browser} on ${os}`;
      if (browser) return browser;
      if (os) return os;
      return "Unknown Device";
    } catch {
      return "Unknown Device";
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-white/20">

      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[10%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(176,58,46,0.20)_0%,_transparent_70%)] blur-[100px]" />
        <div className="absolute top-[80%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.10)_0%,_transparent_70%)] blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-12 max-w-[1400px]">

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4 animate-[fadeUp_0.4s_ease-out]">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2 flex items-center gap-3">
              <svg className="w-8 h-8 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Audit Logs
            </h1>
            <p className="text-neutral-400 text-sm">Immutable ledger of system events and entity modifications.</p>
          </div>
          <div>
            <Link href="/profile" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors backdrop-blur-md inline-flex items-center gap-2 text-neutral-300 hover:text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="animate-[fadeUp_0.6s_ease-out_0.1s_forwards] opacity-0">
          <div className="bg-[#0f0f0f]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

            {loading ? (
              <div className="p-32 flex flex-col items-center justify-center text-neutral-500">
                <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <p className="tracking-widest uppercase text-xs font-semibold">Decrypting Ledger...</p>
              </div>
            ) : errorMsg ? (
              <div className="p-12 text-center text-red-400 bg-red-500/5">
                <p className="font-mono">{errorMsg}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-32 text-center text-neutral-500">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <p className="text-lg text-neutral-300 mb-2">Immutable Ledger is Empty</p>
                <p className="text-sm">No actions have been recorded on the chain yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#151515] border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-5 rounded-tl-2xl">Date & Time</th>
                      <th className="px-6 py-5">Action</th>
                      <th className="px-6 py-5">Origin User ID</th>
                      <th className="px-6 py-5">Attribute(s) Modified</th>
                      <th className="px-6 py-5 rounded-tr-2xl">Device OS & Browser</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {logs.map((log) => {
                      const dateObj = new Date(log.createdAt);
                      const formattedDate = dateObj.toLocaleDateString();
                      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group">

                          {/* Chronology */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-neutral-200 font-medium">{formattedDate}</span>
                              <span className="text-neutral-500 text-xs font-mono">{formattedTime}</span>
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-widest border uppercase shadow-sm ${getActionColor(log.action)}`}>
                              {log.action || 'UNKNOWN'}
                              {log.count > 1 && (
                                <span className="ml-2 font-mono text-[9px] bg-black/20 px-1.5 py-0.5 rounded-sm">x{log.count}</span>
                              )}
                            </span>
                          </td>

                          {/* Identity */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs text-neutral-400 group-hover:border-white/20 transition-colors">
                                {log.user_id ? log.user_id : "?"}
                              </div>
                              <span className="text-neutral-300 font-medium tracking-wide">
                                ID: {log.user_id || 'System'}
                              </span>
                            </div>
                          </td>

                          {/* Context */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {log.attributes.length > 0 ? (
                                log.attributes.map((attr, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/5 font-mono text-xs text-neutral-300">
                                    {attr}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/5 font-mono text-xs text-neutral-300">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Fingerprint */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-neutral-300 capitalize">{parseDevice(log.user_agent)}</span>
                              <span className="text-neutral-500 text-[10px] font-mono tracking-wider mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                IP: {log.ip_address || 'Hidden'}
                              </span>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {logs.length > 0 && (
              <div className="bg-[#121212] border-t border-white/10 p-5 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 font-mono text-[10px] uppercase tracking-[0.1em]">
                <span>Log Height: {logs.length} Actions</span>
                <span className="flex items-center gap-2 mt-2 md:mt-0 px-3 py-1 bg-white/5 border border-white/10 text-neutral-400 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500"></span>
                  </span>
                  Live Sync Active
                </span>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
