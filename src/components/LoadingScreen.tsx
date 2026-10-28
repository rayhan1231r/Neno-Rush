/**
 * NEON RUSH - 3D Loading / Splash Screen
 * Exact 1-to-1 match with the master reference sheet's opening 3D key art:
 * Crowned 3D NEON RUSH logo, "RUN - COLLECT - UPGRADE - BE LEGEND",
 * 3D skater surfing over cyber tracks with trains and coins,
 * dynamic animated progress bar (0% - 100%), and smooth transition into Title Screen.
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Play, Zap, Shield, Flame, Compass } from 'lucide-react';
import { sound } from '../game/audio';

interface LoadingScreenProps {
  onComplete: () => void;
}

const TIPS = [
  'Tip: Double tap screen or press "B" to deploy your hoverboard shield!',
  'Tip: Magnets pull all nearby gold coins into your path automatically.',
  'Tip: Jump over track barriers and slide under high overhead obstacles.',
  'Tip: 6 unique 3D environments: City, Beach, Snow, Desert, Night City & Jungle!',
  'Tip: Unlock all 18 characters from Aiden to Rex for massive score bonuses!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Progress animation simulating 3D asset initialization and shader compilation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        const delta = Math.floor(Math.random() * 14) + 6;
        return Math.min(100, prev + delta);
      });
    }, 120);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 2400);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, []);

  const handleStart = () => {
    sound.playPowerUp();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 font-['Rajdhani'] select-none overflow-hidden">
      {/* Background 3D Key Art Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Master art cropped into the 3D runner splash hero */}
        <div
          className="w-full h-full bg-cover bg-center md:bg-top opacity-55 scale-105 transform animate-pulse duration-[4000ms]"
          style={{
            backgroundImage: `url('/assets/aistudio/file_00000000978481f6a46b41e5a30822fe_1921bc8f.png')`,
            backgroundPosition: '12% 16%',
            backgroundSize: '240% auto',
          }}
        />
        {/* Cyber Neon Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]" />

        {/* Ambient Grid Line Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Banner Tag */}
      <div className="relative z-10 w-full pt-6 md:pt-10 flex flex-col items-center text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin duration-1000" />
          <span className="text-[11px] md:text-xs font-bold text-cyan-300 tracking-[0.2em] uppercase font-['Orbitron']">
            Next-Gen 3D Endless Runner
          </span>
        </div>
      </div>

      {/* Center 3D Logo Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-4 max-w-xl text-center">
        {/* Crown Icon Above Logo matching the reference sheet */}
        <div className="mb-2 relative">
          <svg className="w-16 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-bounce" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
          </svg>
        </div>

        {/* 3D NEON RUSH Title */}
        <div className="relative">
          <h1 className="font-['Orbitron'] font-black text-5xl sm:text-7xl md:text-8xl tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-rose-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.7)]">
            NEON RUSH
          </h1>
          <div className="absolute -inset-1 blur-2xl bg-cyan-500/20 -z-10 rounded-full" />
        </div>

        {/* Subtitle matching the reference */}
        <div className="mt-3 px-4 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md">
          <p className="font-['Orbitron'] text-xs sm:text-sm font-extrabold tracking-[0.3em] text-cyan-300">
            RUN • COLLECT • UPGRADE • BE LEGEND
          </p>
        </div>

        {/* Environment feature pill tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900/70 border border-slate-700/80 text-slate-300">
            🏙️ 6 3D ENVIRONMENTS
          </span>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900/70 border border-slate-700/80 text-slate-300">
            🛹 6 HOVERDECKS
          </span>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900/70 border border-slate-700/80 text-slate-300">
            ⚡ 18 CHARACTERS (A-Z)
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress & Start Action */}
      <div className="relative z-10 w-full max-w-md pb-8 sm:pb-12 px-6 flex flex-col items-center">
        {!isReady ? (
          <div className="w-full flex flex-col gap-3">
            {/* Loading Percentage & Status */}
            <div className="flex items-center justify-between text-xs font-bold font-['Orbitron'] text-cyan-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                LOADING 3D WORLD ASSETS...
              </span>
              <span className="tabular-nums font-black text-white">{progress}%</span>
            </div>

            {/* Glowing Progress Track */}
            <div className="w-full h-3 rounded-full bg-slate-900/90 border border-cyan-500/40 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-rose-500 transition-all duration-150 ease-out shadow-[0_0_12px_#06b6d4]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Rotating Gameplay Tip */}
            <p className="text-center text-xs text-slate-400 mt-1 min-h-[2.5rem] flex items-center justify-center italic">
              {TIPS[tipIndex]}
            </p>
          </div>
        ) : (
          <button
            onClick={handleStart}
            data-testid="enter-game-btn"
            className="w-full group relative flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-['Orbitron'] text-lg sm:text-xl tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all cursor-pointer transform hover:scale-105 active:scale-95 animate-pulse"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>ENTER NEON RUSH</span>
          </button>
        )}

        {/* Footer credit */}
        <p className="text-[10px] text-slate-500 tracking-wider mt-4 uppercase">
          NEON RUSH • MORE THAN A GAME, IT'S A LIFESTYLE!
        </p>
      </div>
    </div>
  );
};
