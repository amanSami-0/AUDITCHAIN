"use client";

import React, { useState, useRef } from "react";
import gsap from "gsap";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  const buttonRef = useRef(null);
  
  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match");
        return;
    }

    setLoading(true);

    try {
      await fetchApi('/forgot', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setSuccessMsg("Password successfully reset! Redirecting...");
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Ensure your email is correct.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden selection:bg-white/20 ">

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
      {/* Reset Card */}
      <main className="relative z-10 w-full max-w-md px-6">
         <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl opacity-0 animate-[fadeUp_0.6s_ease-out_0.1s_forwards]">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-light text-white tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="text-neutral-400 text-sm">
              Enter your email and a new password.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleReset}>
            
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm text-center">
                {successMsg}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Account Email
              </label>

              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                New Password
              </label>

              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full h-11 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>

            {/* Submit */}
            <button
              ref={buttonRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full h-12 bg-white text-black font-semibold rounded-xl transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

          <footer className="mt-10 text-center text-sm text-neutral-500">
            Remembered your password?{" "}
            <Link href="/login" className="text-neutral-300 hover:text-white font-medium underline underline-offset-4">
              Return to Login
            </Link>
          </footer>

        </div>
      </main>

    </div>
  );
}
