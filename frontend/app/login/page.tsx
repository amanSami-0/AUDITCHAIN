"use client";

import React, { useState,useRef } from "react";
import gsap from "gsap";

export default function Home() {

  const [rememberMe, setRememberMe] = useState(false);
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
      {/* Login Card */}
      <main className="relative z-10 w-full max-w-md px-6">
         <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl opacity-0 animate-[fadeUp_0.6s_ease-out_0.1s_forwards]">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">
              Login
            </h1>
            <p className="text-neutral-400 text-sm">
              Welcome back, please enter your details.
            </p>
          </header>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Username
              </label>

              <input
                type="text"
                id="username"
                placeholder="johndoe"
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] ml-1"
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                placeholder="Enter password"
                className="w-full h-12 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-xs">

              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="peer sr-only"
                  />

                  <div className="w-4 h-4 border border-white/20 rounded bg-white/5 peer-checked:bg-white peer-checked:border-white" />

                  <svg
                    className={`absolute w-3 h-3 text-black ${rememberMe ? "opacity-100" : "opacity-0"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>

                </div>

                <span className="text-neutral-400 group-hover:text-white">
                  Remember Me
                </span>
              </label>

              <button className="text-neutral-400 hover:text-white">
                Forgot Password?
              </button>

            </div>

            {/* Submit */}
            <button
              ref={buttonRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              type="submit"
              className="w-full h-12 bg-white text-black font-semibold rounded-xl transition-colors hover:bg-neutral-200"
            >
              Sign In
            </button>

          </form>

          <footer className="mt-10 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <button className="text-neutral-300 hover:text-white font-medium underline underline-offset-4">
              Sign up
            </button>
          </footer>

        </div>
      </main>

    </div>
  );
}