"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DevUser {
  id: number;
  username: string;
  email: string;
  is_blocked: boolean;
  attempts: number;
}

export default function DevAdmin() {
  const router = useRouter();
  const [users, setUsers] = useState<DevUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activeDevId, setActiveDevId] = useState<number | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const handleViewActivity = async (id: number) => {
    setActiveDevId(id);
    setActivityModalOpen(true);
    setLoadingActivity(true);
    try {
      const data = await fetchApi(`/dev/developer-activity/${id}`);
      if (data.logs) {
        setActivityLogs(data.logs);
      } else {
        setActivityLogs([]);
      }
    } catch (e) {
      alert("Failed to load activity");
    } finally {
      setLoadingActivity(false);
    }
  };

  const loadData = async () => {
    try {
      const data = await fetchApi('/dev/admin');
      if (data.users) setUsers(data.users);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push('/dev/login');
      }
      setErrorMsg("Failed to load developers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/dev/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, dob, password })
      });
      setUsername("");
      setEmail("");
      setDob("");
      setPassword("");
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to register");
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await fetchApi(`/dev/unblock/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to unblock");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchApi(`/dev/delete/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-white/20">

      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(176,58,46,0.20)_0%,_transparent_70%)] blur-[80px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-12 max-w-[1200px]">

        <header className="mb-10 flex items-center justify-between border-b border-white/10 pb-6 animate-[fadeUp_0.4s_ease-out]">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2">
              Personnel <span className="font-semibold text-red-500">Management</span>
            </h1>
            <p className="text-neutral-400 text-sm">Register and manage developer accesses.</p>
          </div>
          <Link href="/dev/dashboard" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors flex items-center gap-2">
            Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeUp_0.6s_ease-out_0.1s_forwards] opacity-0">

          <div className="lg:col-span-1">
            <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-white/10">Authorize New Operator</h2>

              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">DOB</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Assigned Key</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30" />
                </div>
                <button type="submit" className="w-full h-10 mt-4 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors">
                  Provision Access
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Active Operators</h2>
              </div>

              {loading ? (
                <div className="p-12 text-center text-neutral-500">Loading registry...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#151515] border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4 font-mono text-neutral-400">#{u.id}</td>
                          <td className="px-6 py-4 font-medium">{u.username}</td>
                          <td className="px-6 py-4">
                            {u.is_blocked ? (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold uppercase tracking-wider">Blocked</span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleViewActivity(u.id)} className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs mr-2 transition-colors">
                              Activity
                            </button>
                            {u.is_blocked && (
                              <button onClick={() => handleUnblock(u.id)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs mr-2 transition-colors">
                                Unblock
                              </button>
                            )}
                            <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors">
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Activity Modal */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151515]">
              <div>
                <h2 className="text-xl font-semibold text-white">Developer Activity Log</h2>
                <p className="text-sm text-neutral-400 mt-1">Reviewing actions for Operator #{activeDevId}</p>
              </div>
              <button onClick={() => setActivityModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {loadingActivity ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-mono tracking-widest uppercase">Fetching Records...</p>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 bg-white/[0.02] rounded-xl border border-white/5">
                  No activity recorded for this operator.
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="bg-white/[0.03] border border-white/10 p-4 rounded-xl hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded ${log.action.includes('INTRUDER') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          {new Date(log.time).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 tracking-wider mb-1">Network IP</p>
                          <p className="font-mono text-neutral-300">{log.ip_address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 tracking-wider mb-1">Location</p>
                          <p className="text-neutral-300">{log.location}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-neutral-500 tracking-wider mb-1">Device Signature</p>
                          <p className="text-neutral-300 truncate" title={log.device}>{log.device}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
