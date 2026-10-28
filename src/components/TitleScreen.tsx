/**
 * NEON RUSH - Main Menu UI
 * 1-to-1 match with the "MAIN MENU UI" panel from the master visual reference sheet:
 * - Top Bar: Coins (12,560), Gems (245), Sound Mute, Settings
 * - Center Stage: Crowned 3D NEON RUSH logo with live 3D character preview
 * - Right Vertical Action Bar: Account, Ranking, Characters, Skateboards, Shop, Missions, Settings
 * - Primary Action: Glossy green "▶ PLAY" button and "Daily Reward" pill
 * - In-Game Road & Environments dock: 6 environments (City, Beach, Snow, Desert, Night City, Jungle)
 * - Bottom Navigation Quick Bar
 */

import React from 'react';
import {
  Play,
  User,
  Trophy,
  Sparkles,
  ShoppingBag,
  CheckSquare,
  Settings,
  Volume2,
  VolumeX,
  Compass,
  Gift,
  Zap,
} from 'lucide-react';
import { EnvironmentType, PlayerProfile } from '../types/game';
import { ENVIRONMENTS } from '../game/rules';
import { sound } from '../game/audio';

interface TitleScreenProps {
  profile: PlayerProfile;
  isMuted: boolean;
  selectedEnvironment: EnvironmentType;
  onSelectEnvironment: (env: EnvironmentType) => void;
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
  selectedEnvironment,
  onSelectEnvironment,
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
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5 md:p-6 font-['Rajdhani']">
      {/* 1. TOP HEADER BAR matching reference */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Left: Player Profile Badge */}
        <button
          onClick={onOpenAccount}
          className="flex items-center gap-2.5 bg-slate-950/85 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl px-3 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 flex items-center justify-center text-white font-bold font-['Orbitron'] text-xs shadow-md">
            {profile.username ? profile.username.substring(0, 2).toUpperCase() : 'RI'}
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-white font-['Orbitron'] flex items-center gap-1">
              <span>{profile.username || 'Rifat'}</span>
              <span className="text-[10px] text-cyan-400">Lv.{profile.level || 12}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold font-mono">
              ID: {profile.userId.length > 10 ? profile.userId.substring(0, 8) : profile.userId}
            </div>
          </div>
        </button>

        {/* Right: Currency Clusters & Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Coins (Gold) */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-slate-950/90 border border-amber-500/60 hover:border-amber-400 rounded-xl px-3 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_8px_#f59e0b]">
              ¢
            </div>
            <span className="text-sm font-black text-amber-300 tabular-nums font-['Orbitron']">
              {profile.coins.toLocaleString()}
            </span>
            <span className="text-xs text-amber-400 font-black ml-0.5">+</span>
          </button>

          {/* Gems (Cyan Diamond) */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-slate-950/90 border border-cyan-500/60 hover:border-cyan-400 rounded-xl px-3 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer active:scale-95"
          >
            <span className="text-sm drop-shadow-[0_0_6px_#06b6d4]">💎</span>
            <span className="text-sm font-black text-cyan-300 tabular-nums font-['Orbitron']">
              {profile.gems.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-black ml-0.5">+</span>
          </button>

          {/* Audio Mute */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-9 h-9 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Settings / Close Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MIDDLE AREA: Center Title & Right Vertical Action Bar */}
      <div className="flex-1 flex items-center justify-between my-2 relative">
        {/* Left negative space for character viewing */}
        <div className="w-12 sm:w-16 pointer-events-none" />

        {/* Center: Bespoke Crown & NEON RUSH Title Lockup */}
        <div className="flex flex-col items-center pointer-events-auto select-none max-w-sm sm:max-w-md text-center mt-2">
          {/* Gold Crown */}
          <div className="relative mb-1">
            <svg className="w-12 h-9 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>

          {/* Glowing NEON RUSH Logo */}
          <h1 className="font-['Orbitron'] font-black text-4xl sm:text-5xl md:text-6xl tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-rose-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]">
            NEON RUSH
          </h1>
          <p className="mt-1 font-['Orbitron'] text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-cyan-300 uppercase px-3 py-0.5 rounded-full bg-slate-950/70 border border-cyan-500/30">
            RUN • COLLECT • UPGRADE • BE LEGEND
          </p>

          {/* Quick Environment Selector Bar right below title matching the reference */}
          <div className="mt-4 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
            {ENVIRONMENTS.map((env) => {
              const isSelected = selectedEnvironment === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectEnvironment(env.id);
                  }}
                  title={env.name}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold font-['Orbitron'] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_#06b6d4]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{env.icon}</span>
                  <span className="hidden sm:inline text-[11px]">{env.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. RIGHT VERTICAL ACTION BAR matching the reference sheet */}
        <div className="pointer-events-auto flex flex-col gap-2 bg-slate-950/85 border border-cyan-500/40 rounded-2xl p-2 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/60 text-slate-200 hover:text-cyan-300 transition-all cursor-pointer group active:scale-95"
            title="Account & Profile"
          >
            <User className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold font-['Orbitron']">Account</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/60 text-slate-200 hover:text-amber-300 transition-all cursor-pointer group active:scale-95"
            title="Global Ranking"
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold font-['Orbitron']">Ranking</span>
          </button>

          <button
            onClick={onOpenCharacters}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-indigo-500/20 border border-slate-800 hover:border-indigo-500/60 text-slate-200 hover:text-indigo-300 transition-all cursor-pointer group active:scale-95"
            title="Characters (18 Heroes)"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold font-['Orbitron']">Characters</span>
          </button>

          <button
            onClick={onOpenSkateboards}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/60 text-slate-200 hover:text-emerald-300 transition-all cursor-pointer group active:scale-95"
            title="Skateboards (6 Decks)"
          >
            <Compass className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold font-['Orbitron']">Skateboards</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 transition-all cursor-pointer group active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            title="Coin Shop"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-black font-['Orbitron']">Shop</span>
          </button>

          <button
            onClick={onOpenMissions}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/60 text-slate-200 hover:text-rose-300 transition-all cursor-pointer group active:scale-95"
            title="Missions & Daily Rewards"
          >
            <CheckSquare className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold font-['Orbitron']">Missions</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer group active:scale-95"
            title="Settings"
          >
            <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold font-['Orbitron']">Settings</span>
          </button>
        </div>
      </div>

      {/* 4. BOTTOM ACTION & DOCK: Play Button & Daily Reward */}
      <div className="w-full flex flex-col items-center pointer-events-auto gap-2.5">
        {/* Glossy Green PLAY Button matching reference sheet */}
        <button
          onClick={onStartGame}
          data-start="true"
          className="group relative px-12 sm:px-16 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-['Orbitron'] text-xl sm:text-2xl tracking-[0.15em] shadow-[0_0_35px_rgba(16,185,129,0.7)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3 overflow-hidden border-2 border-emerald-300/80"
        >
          <div className="absolute inset-0 bg-white/25 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
          <Play className="w-6 h-6 fill-slate-950 text-slate-950" />
          <span>PLAY</span>
        </button>

        {/* Daily Reward pill button right below Play button */}
        <button
          onClick={onOpenMissions}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer text-xs font-bold font-['Orbitron'] active:scale-95"
        >
          <Gift className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
          <span>Daily Reward</span>
        </button>

        {/* Bottom banner matching reference footer */}
        <div className="text-center text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">
          NEON RUSH — MORE THAN A GAME, IT'S A LIFESTYLE!
        </div>
      </div>
    </div>
  );
};
