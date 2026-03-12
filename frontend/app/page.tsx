"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">

      {/* Fake dashboard background */}
      <div className="absolute inset-0 p-10 grid grid-cols-3 gap-6 blur-sm opacity-40 pointer-events-none">

        <div className="col-span-2 bg-white/[0.04] border border-white/10 rounded-2xl h-64" />
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl h-64" />

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl h-48" />
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl h-48" />
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl h-48" />

        <div className="col-span-3 bg-white/[0.04] border border-white/10 rounded-2xl h-40" />

      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Center message */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center max-w-md">

          <h1 className="text-4xl text-white font-light mb-4">
            Work In Progress
          </h1>

          <p className="text-neutral-400 mb-8">
            The dashboard is currently under development.  
            Login will be available soon.
          </p>

          <Link href="/login">
          <button className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200 transition">
            Login
          </button>
          </Link>
        </div>

      </div>

    </div>
  );
}