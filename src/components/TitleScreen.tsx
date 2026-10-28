/**
 * NEON RUSH - Title Screen & Main Menu
 * Implements ultra-mode craft guidelines: bespoke inline SVG title lockup,
 * live 3D character centerpiece showcase, low-occlusion negative-space layout,
 * primary Start CTA with data-start="true", and unified bottom navigation dock.
 */

import React from 'react';
import {
  Play,
  Users,
  Compass,
  ShoppingBag,
  Trophy,
  CheckSquare,
  Settings,
  User,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { PlayerProfile } from '../types/game';

interface TitleScreenProps {
  profile: PlayerProfile;
  isMuted: boolean;
  onStartGame: () => void;
  onToggleMute: () => void;
  onOpenCharacters: () => void;
  onOpenSkateboards: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
  onOpenAccount: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  isMuted,
  onStartGame,
  onToggleMute,
  onOpenCharacters,
  onOpenSkateboards,
  onOpenShop,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenAccount,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 md:p-8 font-['Rajdhani']">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* User Profile Pill */}
        <button
          onClick={onOpenAccount}
          className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 rounded-2xl px-3.5 py-2 shadow-lg transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold font-['Orbitron'] text-sm shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            {profile.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white font-['Orbitron'] flex items-center gap-1.5">
              <span>{profile.username}</span>
              {profile.isGuest && (
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded font-mono">GUEST</span>
              )}
            </div>
            <div className="text-[11px] text-cyan-400 font-semibold">
              PB: <span className="tabular-nums font-['Orbitron'] font-bold text-white">{profile.highScore.toLocaleString()}</span>
            </div>
          </div>
        </button>

        {/* Currency Clusters & Utility Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Gold Coins */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-2 bg-slate-950/85 border border-amber-500/50 hover:border-amber-400 rounded-xl px-3.5 py-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_8px_#f59e0b]">
              ¢
            </div>
            <span className="text-sm md:text-base font-black text-amber-300 tabular-nums font-['Orbitron']">
              {profile.coins.toLocaleString()}
            </span>
            <span className="text-xs text-amber-400 font-black group-hover:scale-125 transition-transform">+</span>
          </button>

          {/* Premium Gems */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-2 bg-slate-950/85 border border-cyan-500/50 hover:border-cyan-400 rounded-xl px-3.5 py-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer group active:scale-95"
          >
            <span className="text-sm">💎</span>
            <span className="text-sm md:text-base font-black text-cyan-300 tabular-nums font-['Orbitron']">
              {profile.gems.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-black group-hover:scale-125 transition-transform">+</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-10 h-10 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-10 h-10 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centerpiece Title & Play Area */}
      <div className="flex flex-col items-center justify-between my-auto h-[60%] pointer-events-auto">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative pt-2">
          <svg className="w-64 sm:w-80 md:w-[420px] h-auto drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background shadow stroke */}
            <text
              x="250"
              y="75"
              textAnchor="middle"
              className="font-['Orbitron'] font-black text-6xl tracking-[0.25em]"
              fill="#050814"
              stroke="#0f172a"
              strokeWidth="14"
              strokeLinejoin="round"
            >
              NEON RUSH
            </text>

            {/* Glowing outer neon stroke */}
            <text
              x="250"
              y="75"
              textAnchor="middle"
              className="font-['Orbitron'] font-black text-6xl tracking-[0.25em]"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="6"
              strokeLinejoin="round"
            >
              NEON RUSH
            </text>

            {/* Primary gradient fill */}
            <text
              x="250"
              y="75"
              textAnchor="middle"
              className="font-['Orbitron'] font-black text-6xl tracking-[0.25em]"
              fill="url(#neonGradient)"
            >
              NEON RUSH
            </text>

            {/* High-speed cyber accent line */}
            <line x1="80" y1="94" x2="420" y2="94" stroke="#f43f5e" strokeWidth="3" strokeDasharray="16 8" />
            <text x="250" y="112" textAnchor="middle" className="font-['Rajdhani'] font-bold text-xs tracking-[0.4em] fill-cyan-300">
              ENDLESS 3D CYBER RUNNER
            </text>
          </svg>
        </div>

        {/* Lower Action Stack (Leaves middle 40% open for 3D character) */}
        <div className="flex flex-col items-center">
          <button
            onClick={onStartGame}
            data-start="true"
            className="group relative px-10 py-4 md:py-4.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black font-['Orbitron'] tracking-[0.15em] text-base sm:text-lg shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-95 transition-all cursor-pointer flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>PLAY NOW</span>
          </button>

          {/* Flat borderless control-hint line */}
          <p className="mt-3 text-xs font-semibold text-slate-400 tracking-wider">
            WASD / Arrows Move · Space Jump · S / Down Slide · B Skateboard · Esc Pause
          </p>
        </div>
      </div>

      {/* Unified Bottom Navigation Dock */}
      <div className="w-full flex justify-center pointer-events-auto">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-2 md:p-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-2xl">
          <button
            onClick={onOpenCharacters}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group active:scale-95"
          >
            <Users className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-wider font-['Orbitron']">CHARACTERS</span>
          </button>

          <button
            onClick={onOpenSkateboards}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer group active:scale-95"
          >
            <Compass className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-wider font-['Orbitron']">SKATEBOARDS</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-all cursor-pointer group active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black tracking-wider font-['Orbitron']">COIN SHOP</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-purple-500/40 text-slate-300 hover:text-purple-300 transition-all cursor-pointer group active:scale-95"
          >
            <Trophy className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-wider font-['Orbitron']">RANKINGS</span>
          </button>

          <button
            onClick={onOpenMissions}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition-all cursor-pointer group active:scale-95"
          >
            <CheckSquare className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-wider font-['Orbitron']">MISSIONS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
