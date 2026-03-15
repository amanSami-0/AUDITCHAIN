"use client";

import React, { useState } from "react";
import { fetchApi } from "../lib/api";
import Link from "next/link";
import gsap from "gsap";

export default function Settings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [syncBlockchain, setSyncBlockchain] = useState(false);
  
  const [loadingAction, setLoadingAction] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleToggle = async (
    settingKey: string,
    currentValue: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoadingAction(settingKey);
    setSuccessMsg("");
    
    const newValue = !currentValue;
    
    // Optimistically update UI
    setter(newValue);

    try {
      await fetchApi('/settings', {
        method: 'POST',
        body: JSON.stringify({ 
          [settingKey]: newValue 
        })
      });
      
      setSuccessMsg(`"${settingKey}" ${newValue ? 'Enabled' : 'Disabled'}`);
      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (err) {
      // Revert if API failed
      setter(currentValue);
      setSuccessMsg(`Failed to update ${settingKey}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setLoadingAction("");
    }
  };

  const createToggleUI = (
    label: string, 
    description: string, 
    key: string, 
    value: boolean, 
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (
      <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
        <div>
            <h3 className="font-medium text-white text-sm mb-1 tracking-wide">{label}</h3>
            <p className="text-xs text-neutral-500 max-w-[250px] md:max-w-none">{description}</p>
        </div>
        <button
          onClick={() => handleToggle(key, value, setter)}
          disabled={loadingAction === key}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 disabled:opacity-50
            ${value ? 'bg-blue-500' : 'bg-neutral-700'}
          `}
        >
          <span className="sr-only">Enable {label}</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${value ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-white/20 pb-20">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[30%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.15)_0%,_transparent_70%)] blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4 animate-[fadeUp_0.4s_ease-out]">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">System Configurations</h1>
            <p className="text-neutral-400 text-sm">Manage global environment settings and security protocols.</p>
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

        {/* Success Toast */}
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${successMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
             <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-6 py-2.5 rounded-full backdrop-blur-md text-sm font-medium shadow-2xl flex items-center gap-2 tracking-wide font-mono">
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
                 {successMsg}
             </div>
        </div>

        {/* Content */}
        <main className="animate-[fadeUp_0.6s_ease-out_0.1s_forwards] opacity-0 space-y-8">
          
          {/* Section 1 */}
          <section className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-white/5">
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-neutral-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Security Protocol
                </h2>
            </div>
            
            <div className="space-y-3">
                {createToggleUI("Multi-Factor Authentication", "Require MFA for all administrative accounts logging into the portal.", "MFA_ENABLED", mfaEnabled, setMfaEnabled)}
                {createToggleUI("Login Activity Emails", "Send a real-time alert email upon every new session instantiation.", "EMAIL_ALERTS_ENABLED", emailAlerts, setEmailAlerts)}
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-white/5">
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-neutral-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Environment Controls
                </h2>
            </div>
            
            <div className="space-y-3">
                {createToggleUI("Maintenance Mode", "Take the entire system offline for scheduled upgrades or scaling tasks.", "MAINTENANCE_MODE", maintenanceMode, setMaintenanceMode)}
                {createToggleUI("Immutable Ledger Sync", "Continuously mirror application logs to the decentralized vault.", "BLOCKCHAIN_SYNC", syncBlockchain, setSyncBlockchain)}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
