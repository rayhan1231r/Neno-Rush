/**
 * NEON RUSH - Pause Modal
 * Single focused status card in game world typography and palette.
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-sm bg-slate-950 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] text-center flex flex-col items-center gap-5">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-widest text-cyan-400 font-['Orbitron']">GAME PAUSED</span>
          <h2 className="text-3xl font-black text-white font-['Orbitron'] tracking-wide">SYSTEM STANDBY</h2>
        </div>

        <div className="w-full space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-['Orbitron'] tracking-wider text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME RUN
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            RESTART TRACK
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            QUIT TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
