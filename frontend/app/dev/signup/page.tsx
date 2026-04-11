"use client";

import React, { useState, useRef } from "react";
import gsap from "gsap";
import { fetchApi } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DevSignup() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await fetchApi('/dev/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, dob, password })
      });

      setSuccessMsg("Account created! Redirecting to login...");
      setTimeout(() => {
        router.push('/dev/login');
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden selection:bg-white/20 pb-10">

     <div className="absolute inset-0 pointer-events-none overflow-hidden hover:opacity-100 opacity-60 transition-opacity">
      <div className="absolute top-[48%] left-[30%] -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[600px] rounded-full
        bg-[radial-gradient(circle,_rgba(255,100,100,0.40)_0%,_rgba(255,50,50,0.20)_35%,_rgba(37,99,235,0.1)_60%,_transparent_75%)]
        blur-[80px]" />

      <div className="absolute top-[70%] left-[72%] -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full
          bg-[radial-gradient(circle,_rgba(255,255,255,0.25)_0%,_rgba(255,255,255,0.1)_35%,_rgba(255,255,255,0.05)_55%,_transparent_70%)]
          blur-[80px]" />
    </div>

      {/* Signup Card */}
      <main className="relative z-10 w-full max-w-md px-6 mt-16">
         <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-[0_0_50px_rgba(255,100,100,0.1)] opacity-0 animate-[fadeUp_0.6s_ease-out_0.1s_forwards]">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">
              Operator
            </h1>
            <p className="text-neutral-400 text-sm">
              Provision a new developer identity.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSignup}>
            
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm text-center">
                {successMsg}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Desired Username
              </label>

              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dev_ops_1"
                required
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Work Email
              </label>

              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                required
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="dob"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Date of Verification (DOB)
              </label>

              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Secure Key
              </label>

              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter key sequence"
                required
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>

            <button
              ref={buttonRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black font-semibold rounded-xl transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
            >
              {loading ? "Generating Identity..." : "Request Access Node"}
            </button>

          </form>

          <footer className="mt-8 text-center text-sm text-neutral-500">
            Already verified?{" "}
            <Link href="/dev/login" className="text-neutral-300 hover:text-white font-medium underline underline-offset-4">
              Connect Securely
            </Link>
          </footer>

        </div>
      </main>

    </div>
  );
}
