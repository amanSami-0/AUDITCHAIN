"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdateProfile() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const buttonRef = useRef(null);
  const cancelBtnRef = useRef(null);
  
  const createHoverAnimation = (ref: React.RefObject<any>) => ({
    onMouseEnter: () => gsap.to(ref.current, { scale: 1.05, duration: 0.2, ease: "power2.out" }),
    onMouseLeave: () => gsap.to(ref.current, { scale: 1, duration: 0.2, ease: "power2.out" })
  });

  useEffect(() => {
    // Fetch current user details to pre-fill the form
    const fetchProfile = async () => {
      try {
        const data = await fetchApi('/profile', { method: 'GET' });
        const user = data.user;
        setUsername(user.username || "");
        setEmail(user.email || "");
        
        // Format date to YYYY-MM-DD for the HTML date input if exists
        if (user.date_of_birth) {
            const dateObj = new Date(user.date_of_birth);
            const formattedDate = dateObj.toISOString().split('T')[0];
            setDateOfBirth(formattedDate);
        }

      } catch (err: any) {
        // If unauthorized or error, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setUpdating(true);

    try {
      await fetchApi('/update', {
        method: 'POST',
        body: JSON.stringify({ 
          username, 
          email, 
          date_of_birth: dateOfBirth 
        })
      });

      setSuccessMsg("Profile updated successfully!");
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
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

      {/* Update Card */}
      <main className="relative z-10 w-full max-w-md px-6">
         <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl opacity-0 animate-[fadeUp_0.6s_ease-out_0.1s_forwards]">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">
              Edit Profile
            </h1>
            <p className="text-neutral-400 text-sm">
              Update your personal information.
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleUpdate}>
            
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center transition-all animate-pulse">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm text-center transition-all">
                {successMsg}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full h-11 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full h-11 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] text-sm"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label htmlFor="dob" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full h-11 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] text-sm [color-scheme:dark]"
              />
            </div>

            <div className="pt-4 space-y-3">
                <button
                ref={buttonRef}
                {...createHoverAnimation(buttonRef)}
                type="submit"
                disabled={updating || !!successMsg}
                className="w-full h-12 bg-white text-black font-semibold rounded-xl transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {updating ? "Updating..." : "Save Changes"}
                </button>

                <Link 
                    href="/profile"
                    ref={cancelBtnRef}
                    {...createHoverAnimation(cancelBtnRef)}
                    className="flex w-full h-12 items-center justify-center bg-transparent border border-white/10 text-neutral-400 font-semibold rounded-xl transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                    Cancel
                </Link>
            </div>

          </form>
        </div>
      </main>

    </div>
  );
}
