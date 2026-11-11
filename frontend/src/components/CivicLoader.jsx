import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * CivicLoader — Premium National Cooperative Identity Loading Buffer
 * Features tricolor orbital concentric rings (Saffron, Navy/White, Emerald),
 * pulsing core emblem, and authentic civic telemetry progress indicators.
 */
export default function CivicLoader({
  variant = 'card', // 'fullscreen' | 'card' | 'inline' | 'button'
  title = 'Synchronizing Cooperative Federation...',
  subtitle = 'Verifying encrypted 93-2-5 escrow ledger & live GIS telemetry',
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  const civicMessages = [
    'Connecting to Encrypted State Cooperative Node...',
    'Verifying 93-2-5 Statutory Escrow Ledger...',
    'Synchronizing Odisha Regional GIS Telemetry...',
    'Validating Artisan Skill & Police Clearances...',
  ];

  useEffect(() => {
    if (variant === 'button' || variant === 'inline') return;
    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % civicMessages.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [variant]);

  // Button / Micro variant
  if (variant === 'button') {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-bold">
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white border-t-amber-400 animate-spin"></span>
        </span>
        <span>{title}</span>
      </div>
    );
  }

  // Inline / Compact row variant
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-3 p-4 text-xs text-gray-600 dark:text-slate-300">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        <span className="font-semibold">{title}</span>
      </div>
    );
  }

  // Ring dimension configuration
  const ringSizes = {
    sm: { outer: 'w-14 h-14', mid: 'w-10 h-10', inner: 'w-6 h-6', iconSize: 12 },
    md: { outer: 'w-20 h-20', mid: 'w-14 h-14', inner: 'w-9 h-9', iconSize: 16 },
    lg: { outer: 'w-28 h-28', mid: 'w-20 h-20', inner: 'w-13 h-13', iconSize: 22 },
  }[size] || { outer: 'w-20 h-20', mid: 'w-14 h-14', inner: 'w-9 h-9', iconSize: 16 };

  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto p-6">
      {/* ── TRICOLOR ORBITAL CONCENTRIC BUFFER ── */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring: Saffron Glowing Orbit */}
        <div
          className={`${ringSizes.outer} rounded-full border-[3px] border-amber-500/20 border-t-amber-500 border-r-amber-400 animate-spin shadow-lg shadow-amber-500/10`}
        />

        {/* Middle Ring: Navy / White Counter-Spinning Orbit */}
        <div
          className={`absolute ${ringSizes.mid} rounded-full border-2 border-blue-900/20 dark:border-white/20 border-b-blue-900 dark:border-b-white border-l-blue-700 dark:border-l-slate-300 animate-spin-reverse`}
        />

        {/* Inner Ring: Ashoka Green Orbital Core */}
        <div
          className={`absolute ${ringSizes.inner} rounded-full border-2 border-emerald-500/20 border-t-emerald-500 border-l-emerald-400 animate-spin`}
        />

        {/* Core Breathing Shield Emblem */}
        <div className="absolute flex items-center justify-center rounded-full bg-white dark:bg-[#131B38] p-1.5 shadow-md border border-gray-100 dark:border-slate-700 animate-pulse-glow">
          <ShieldCheck
            size={ringSizes.iconSize}
            className="text-amber-500 dark:text-amber-400"
          />
        </div>
      </div>

      {/* ── TITLE & ANIMATED CIVIC TELEMETRY STATUS ── */}
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <div className="h-5 flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="transition-all duration-300 font-mono text-[11px]">
            {civicMessages[activeMessageIndex]}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      {/* ── 3-STEP STAGGERED CIVIC DOTS ── */}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-blue-950 dark:bg-white animate-bounce" style={{ animationDelay: '180ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '360ms' }}></span>
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
        <div className="bg-white/95 dark:bg-[#131B38]/95 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-6 max-w-sm w-full">
          {content}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="w-full py-12 flex items-center justify-center bg-white/60 dark:bg-[#131B38]/40 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 backdrop-blur-xs my-4 shadow-inner">
      {content}
    </div>
  );
}
