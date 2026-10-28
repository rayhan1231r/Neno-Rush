/**
 * NEON RUSH - Gameplay HUD Overlay
 * Follows ultra-mode directives: >85% playfield unobstructed (pointer-events: none),
 * tabular-nums integer readouts, SVG icons, and active power-up timers with ghost bars.
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Shield, Zap, Magnet } from 'lucide-react';
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
  const magnetPowerUp = powerUps.find((p) => p.type === 'magnet');
  const mult2xPowerUp = powerUps.find((p) => p.type === 'multiplier2x');
  const dashPowerUp = powerUps.find((p) => p.type === 'neondash');

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-4 md:p-6 font-['Rajdhani']">
      {/* Top Status Clusters */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Score & Multiplier */}
        <div className="flex flex-col bg-slate-950/75 border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-cyan-400 font-['Orbitron']">SCORE</span>
            {multiplier > 1 && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black px-1.5 py-0.5 rounded font-['Orbitron']">
                x{multiplier}
              </span>
            )}
          </div>
          <span className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-wider font-['Orbitron'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Top Center: Distance */}
        <div className="hidden sm:flex flex-col items-center bg-slate-950/75 border border-violet-500/40 rounded-xl px-5 py-2 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <span className="text-[11px] font-bold tracking-widest text-violet-400 font-['Orbitron']">DISTANCE</span>
          <span className="text-xl md:text-2xl font-black text-white tabular-nums font-['Orbitron']">
            {distance.toLocaleString()} <span className="text-xs font-semibold text-violet-300">m</span>
          </span>
        </div>

        {/* Top Right: Run Coins + Quick Utility Controls */}
        <div className="flex items-center gap-3">
          {/* Run Coin Counter */}
          <div className="flex items-center gap-2 bg-slate-950/75 border border-amber-500/40 rounded-xl px-3.5 py-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_8px_#f59e0b]">
              ¢
            </div>
            <span className="text-xl md:text-2xl font-black text-amber-300 tabular-nums font-['Orbitron']">
              {coins}
            </span>
          </div>

          {/* Interactive Utility Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={onToggleMute}
              tabIndex={-1}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="w-10 h-10 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onPause}
              tabIndex={-1}
              aria-label="Pause Game"
              className="w-10 h-10 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Active Power-Up Meters & Skateboard Activator */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Active Power-up timer bars */}
        {powerUps.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
            {skateboardPowerUp && (
              <div className="flex items-center gap-2 bg-slate-950/85 border border-emerald-500/60 rounded-lg px-3 py-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 font-['Orbitron']">HOVER SHIELD</span>
                <span className="text-xs font-black text-white tabular-nums font-['Orbitron']">
                  {skateboardPowerUp.durationRemaining.toFixed(1)}s
                </span>
              </div>
            )}
            {magnetPowerUp && (
              <div className="flex items-center gap-2 bg-slate-950/85 border border-cyan-500/60 rounded-lg px-3 py-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Magnet className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 font-['Orbitron']">COIN MAGNET</span>
                <span className="text-xs font-black text-white tabular-nums font-['Orbitron']">
                  {magnetPowerUp.durationRemaining.toFixed(1)}s
                </span>
              </div>
            )}
            {mult2xPowerUp && (
              <div className="flex items-center gap-2 bg-slate-950/85 border border-amber-500/60 rounded-lg px-3 py-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 font-['Orbitron']">2X MULTIPLIER</span>
                <span className="text-xs font-black text-white tabular-nums font-['Orbitron']">
                  {mult2xPowerUp.durationRemaining.toFixed(1)}s
                </span>
              </div>
            )}
            {dashPowerUp && (
              <div className="flex items-center gap-2 bg-slate-950/85 border border-purple-500/60 rounded-lg px-3 py-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300 font-['Orbitron']">NEON DASH</span>
                <span className="text-xs font-black text-white tabular-nums font-['Orbitron']">
                  {dashPowerUp.durationRemaining.toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Skateboard Deploy Button (Tappable on mobile or click) */}
        {!skateboardPowerUp && (
          <button
            onClick={onActivateSkateboard}
            className="pointer-events-auto bg-slate-950/80 hover:bg-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold tracking-wider font-['Orbitron'] flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-95 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>DEPLOY HOVER SHIELD [B / DOUBLE-TAP]</span>
          </button>
        )}
      </div>
    </div>
  );
};
