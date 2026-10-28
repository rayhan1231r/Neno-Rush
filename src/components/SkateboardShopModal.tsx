/**
 * NEON RUSH - Skateboard Customization Modal
 * 6 unique hoverdecks with shield duration bonuses, jump multipliers, and glowing thrusters.
 */

import React, { useState } from 'react';
import { X, Check, Lock, Shield, Compass } from 'lucide-react';
import { PlayerProfile, SkateboardItem } from '../types/game';
import { SKATEBOARDS } from '../game/models';
import { sound } from '../game/audio';

interface SkateboardShopModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onEquipSkateboard: (boardId: string) => void;
  onUnlockSkateboard: (board: SkateboardItem) => boolean;
}

export const SkateboardShopModal: React.FC<SkateboardShopModalProps> = ({
  profile,
  onClose,
  onEquipSkateboard,
  onUnlockSkateboard,
}) => {
  const [selectedBoard, setSelectedBoard] = useState<SkateboardItem>(
    SKATEBOARDS.find((b) => b.id === profile.selectedSkateboardId) || SKATEBOARDS[0]
  );
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isUnlocked = profile.unlockedSkateboardIds.includes(selectedBoard.id);
  const isEquipped = profile.selectedSkateboardId === selectedBoard.id;

  const handleEquip = (board: SkateboardItem) => {
    sound.playClick();
    onEquipSkateboard(board.id);
  };

  const handleUnlock = (board: SkateboardItem) => {
    const success = onUnlockSkateboard(board);
    if (success) {
      sound.playPurchaseSuccess();
      setErrorMsg('');
      onEquipSkateboard(board.id);
    } else {
      sound.playCrash();
      setErrorMsg(`Insufficient ${board.costType === 'gems' ? 'gems' : 'coins'} to unlock ${board.name}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-emerald-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              🛹
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                HOVERDECKS
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                MAGNETIC SKATEBOARDS GRANT CRASH PROTECTION SHIELDS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-xs font-bold text-amber-400 font-['Orbitron']">¢ {profile.coins.toLocaleString()}</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-bold text-cyan-400 font-['Orbitron']">💎 {profile.gems.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl p-2.5 text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-y-auto pr-1">
          {/* Left: 6 Skateboard Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SKATEBOARDS.map((board) => {
              const unlocked = profile.unlockedSkateboardIds.includes(board.id);
              const equipped = profile.selectedSkateboardId === board.id;
              const isSelected = selectedBoard.id === board.id;

              return (
                <button
                  key={board.id}
                  onClick={() => {
                    setSelectedBoard(board);
                    setErrorMsg('');
                    sound.playClick();
                  }}
                  className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-['Orbitron'] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {board.rarity}
                    </span>

                    {equipped ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : !unlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : null}
                  </div>

                  {/* Skateboard Graphic Illustration */}
                  <div className="my-3 flex justify-center items-center py-2">
                    <div
                      className="w-20 h-7 rounded-full border shadow-md flex items-center justify-center relative"
                      style={{
                        backgroundColor: board.colors.deck,
                        borderColor: board.colors.stripe,
                        boxShadow: `0 0 12px ${board.colors.trailGlow}50`,
                      }}
                    >
                      <div
                        className="w-12 h-1 rounded-full"
                        style={{ backgroundColor: board.colors.stripe }}
                      />
                      {/* Hover Glow Thrusters */}
                      <div
                        className="absolute -bottom-1 w-10 h-1 rounded-full blur-[2px]"
                        style={{ backgroundColor: board.colors.trailGlow }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white font-['Orbitron'] truncate">{board.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      Shield: {board.shieldDurationSec}s · Jump x{board.jumpMultiplier}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Board Detail */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-['Orbitron'] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block mb-2">
                  {selectedBoard.rarity} HOVERDECK
                </span>
                <h3 className="text-2xl font-black text-white font-['Orbitron']">{selectedBoard.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedBoard.description}</p>
              </div>

              {/* Stats Box */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Crash Shield Duration
                  </span>
                  <span className="font-bold text-emerald-300 font-['Orbitron']">
                    {selectedBoard.shieldDurationSec} SECONDS
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" /> Jump Height Factor
                  </span>
                  <span className="font-bold text-cyan-300 font-['Orbitron']">
                    x{selectedBoard.jumpMultiplier.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                💡 <span className="text-slate-200">How to use:</span> Press [B] or double-tap the screen during gameplay to deploy your equipped hoverboard shield. If you strike an obstacle, the board sacrifices itself so your run continues!
              </div>
            </div>

            <div className="mt-5">
              {isEquipped ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  CURRENTLY EQUIPPED
                </button>
              ) : isUnlocked ? (
                <button
                  onClick={() => handleEquip(selectedBoard)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  EQUIP HOVERBOARD
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock(selectedBoard)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    UNLOCK FOR {selectedBoard.costType === 'gems' ? '💎' : '¢'}{' '}
                    {selectedBoard.price.toLocaleString()} {selectedBoard.costType.toUpperCase()}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
