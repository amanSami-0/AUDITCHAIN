"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  
  const logoutBtnRef = useRef(null);
  const updateBtnRef = useRef(null);
  const settingsBtnRef = useRef(null);
  
  const createHoverAnimation = (ref: React.RefObject<any>) => ({
    onMouseEnter: () => gsap.to(ref.current, { scale: 1.05, duration: 0.2, ease: "power2.out" }),
    onMouseLeave: () => gsap.to(ref.current, { scale: 1, duration: 0.2, ease: "power2.out" })
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi('/profile', { method: 'GET' });
        setUser(data.user);
      } catch (err: any) {
        // If unauthorized or error, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetchApi('/logout', { method: 'POST' });
      router.push('/login');
    } catch (err: any) {
      setErrorMsg("Failed to logout.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden selection:bg-white/20 py-12">

     <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[48%] left-[30%] -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[600px] rounded-full
        bg-[radial-gradient(circle,_rgba(176,58,46,0.70)_0%,_rgba(176,58,46,0.40)_35%,_rgba(176,58,46,0.12)_60%,_transparent_75%)]
        blur-[140px]" />

      <div className="absolute top-[70%] left-[72%] -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full
          bg-[radial-gradient(circle,_rgba(255,255,255,0.35)_0%,_rgba(255,255,255,0.18)_35%,_rgba(255,255,255,0.08)_55%,_transparent_70%)]
          blur-[150px]" />
    </div>

      {/* Profile Card */}
      <main className="relative z-10 w-full max-w-lg px-6">
         <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl opacity-0 animate-[fadeUp_0.6s_ease-out_0.1s_forwards]">
          <header className="text-center mb-10 border-b border-white/10 pb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-neutral-800 to-neutral-600 rounded-full mb-6 flex items-center justify-center text-3xl font-light text-white shadow-inner">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <h1 className="text-3xl font-light text-white tracking-tight mb-2">
              Welcome, {user?.username}
            </h1>
            <p className="text-neutral-400 text-sm">
              Manage your personal information and account security.
            </p>
          </header>

          <div className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm xl:text-center transition-all">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Items */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-1">Username</span>
                <span className="text-white text-sm">{user?.username}</span>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-1">Email</span>
                <span className="text-white text-sm">{user?.email}</span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-1">Date of Birth</span>
                <span className="text-white text-sm">{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-1">Age</span>
                <span className="text-white text-sm">{user?.age || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/update"
                ref={updateBtnRef}
                {...createHoverAnimation(updateBtnRef)}
                className="flex-1 h-12 flex items-center justify-center bg-white text-black font-semibold rounded-xl transition-colors hover:bg-neutral-200"
              >
                Edit Profile
              </Link>

              <Link 
                href="/settings"
                ref={settingsBtnRef}
                {...createHoverAnimation(settingsBtnRef)}
                className="flex-1 h-12 flex items-center justify-center bg-white/[0.05] border border-white/10 text-white font-semibold rounded-xl transition-colors hover:bg-white/[0.1]"
              >
                Settings
              </Link>

              <button
                onClick={handleLogout}
                ref={logoutBtnRef}
                {...createHoverAnimation(logoutBtnRef)}
                className="flex-1 h-12 bg-white/[0.05] border border-white/10 text-white font-semibold rounded-xl transition-colors hover:bg-white/[0.1] hover:text-red-400"
              >
                Log Out
              </button>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
