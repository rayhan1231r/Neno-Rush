/**
 * NEON RUSH - Gameplay HUD Overlay
 * 1-to-1 match with the in-game HUD & POWER-UPS design from master reference sheet:
 * - 6 Power-Ups:
 *     1. Magnet (Attracts coins) - 🧲
 *     2. Shield (Protects from 1 hit) - 🛡️
 *     3. 2x Score (Double score) - ⚡ 2x
 *     4. Super Jump (Higher jump) - ⬆️
 *     5. Coin Boost (More coins) - 💰
 *     6. Skateboard Boost (Temporary board power) - 🛹
 * - Real-time Score, Distance, Run Coins with 3D glow
 * - Sound mute and pause controls
 * - Quick Deploy Hover Shield [B / Double-Tap]
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Shield, Zap, Magnet, ArrowUp, DollarSign } from 'lucide-react';
import { ActivePowerUp } from '../types/game';

interface GameplayHUDProps {
  score: number;
  distance: number;
  coins: number;
  multiplier: number;
  powerUps: ActivePowerUp[];
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onActivateSkateboard: () => void;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  score,
  distance,
  coins,
  multiplier,
  powerUps,
  isMuted,
  onToggleMute,
  onPause,
  onActivateSkateboard,
}) => {
  const skateboardPowerUp = powerUps.find((p) => p.type === 'skateboard');

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-3 sm:p-5 font-['Rajdhani']">
      {/* Top Status Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Score & Active Multiplier */}
        <div className="flex flex-col bg-slate-950/80 border border-cyan-500/50 rounded-2xl px-4 py-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-cyan-400 font-['Orbitron']">
              SCORE
            </span>
            {multiplier > 1 && (
              <span className="bg-amber-400/25 text-amber-300 border border-amber-400/60 text-[10px] font-black px-1.5 py-0.5 rounded-full font-['Orbitron'] animate-pulse">
                x{multiplier}
              </span>
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-wider font-['Orbitron'] drop-shadow-[0_2px_10px_rgba(6,182,212,0.5)]">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Top Center: Distance */}
        <div className="hidden sm:flex flex-col items-center bg-slate-950/80 border border-violet-500/50 rounded-2xl px-5 py-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-violet-400 font-['Orbitron']">
            DISTANCE
          </span>
          <span className="text-xl sm:text-2xl font-black text-white tabular-nums font-['Orbitron']">
            {distance.toLocaleString()} <span className="text-xs font-semibold text-violet-300">m</span>
          </span>
        </div>

        {/* Top Right: Coins & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Run Coin Counter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/50 rounded-2xl px-3.5 py-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_8px_#f59e0b]">
              ¢
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums font-['Orbitron']">
              {coins}
            </span>
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="w-10 h-10 rounded-xl bg-slate-950/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={onPause}
              aria-label="Pause"
              className="w-10 h-10 rounded-xl bg-slate-950/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Active 6 Power-Ups HUD Meters */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {powerUps.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
            {powerUps.map((p) => {
              const percent = Math.max(0, Math.min(100, (p.durationRemaining / p.durationTotal) * 100));
              return (
                <div
                  key={p.type}
                  className="flex items-center gap-2 bg-slate-950/90 border rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-sm"
                  style={{ borderColor: p.color }}
                >
                  <span className="text-sm">{p.icon}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold font-['Orbitron']">
                      <span style={{ color: p.color }}>{p.name}</span>
                      <span className="text-white font-mono tabular-nums">
                        {p.durationRemaining.toFixed(1)}s
                      </span>
                    </div>
                    {/* Ghost bar */}
                    <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{ width: `${percent}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Skateboard Deploy Button */}
        {!skateboardPowerUp && (
          <button
            onClick={onActivateSkateboard}
            className="pointer-events-auto bg-slate-950/90 hover:bg-slate-900 border-2 border-emerald-500/80 hover:border-emerald-400 text-emerald-300 px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wider font-['Orbitron'] flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>DEPLOY HOVERBOARD SHIELD [B / DOUBLE-TAP]</span>
          </button>
        )}
      </div>
    </div>
  );
};
