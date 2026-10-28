/**
 * NEON RUSH - Game Over Modal
 * Displays run metrics, score breakdown, earned coins, and instant retry.
 */

import React from 'react';
import { RotateCcw, Home, ShoppingBag, Trophy, Award } from 'lucide-react';
import { RunStats } from '../types/game';

interface GameOverModalProps {
  stats: RunStats;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onHome: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  isNewRecord,
  onRestart,
  onHome,
  onOpenShop,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-md bg-slate-950 border border-rose-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold font-['Orbitron'] tracking-widest">
            <span>GRID OVERLOAD</span>
          </div>
          <h2 className="text-4xl font-black text-white font-['Orbitron'] tracking-wide drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
            SYSTEM CRASH
          </h2>
        </div>

        {/* New High Score Alert */}
        {isNewRecord && (
          <div className="w-full bg-amber-500/20 border border-amber-400/60 rounded-xl py-2 px-4 flex items-center justify-center gap-2 text-amber-300 font-['Orbitron'] text-xs font-black tracking-wider animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW ALL-TIME RECORD!</span>
          </div>
        )}

        {/* Run Metrics Grid */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Final Score */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 font-['Orbitron'] tracking-wider">RUN SCORE</span>
            <span className="text-2xl font-black text-cyan-300 tabular-nums font-['Orbitron']">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* High Score */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 font-['Orbitron'] tracking-wider">PERSONAL BEST</span>
            <span className="text-2xl font-black text-amber-300 tabular-nums font-['Orbitron']">
              {Math.max(stats.score, highScore).toLocaleString()}
            </span>
          </div>

          {/* Distance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 font-['Orbitron'] tracking-wider">DISTANCE</span>
            <span className="text-xl font-black text-white tabular-nums font-['Orbitron']">
              {stats.distance.toLocaleString()} <span className="text-xs text-slate-400">m</span>
            </span>
          </div>

          {/* Coins Earned */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 font-['Orbitron'] tracking-wider">COINS EARNED</span>
            <span className="text-xl font-black text-amber-400 tabular-nums font-['Orbitron'] flex items-center gap-1">
              <span>+{stats.coinsCollected}</span>
              <span className="text-xs">¢</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onRestart}
            data-start="true"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black font-['Orbitron'] tracking-wider text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 fill-slate-950" />
            RETRY RUN [SPACE / ENTER]
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenShop}
              className="py-3 px-4 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              COIN SHOP
            </button>

            <button
              onClick={onHome}
              className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
