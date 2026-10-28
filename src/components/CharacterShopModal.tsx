/**
 * NEON RUSH - Character Customization Gallery
 * 8 distinct cartoon 3D cyberpunk characters with distinct rarities, perks, and unlock prices.
 */

import React, { useState } from 'react';
import { X, Check, Lock, Shield, Zap, Sparkles, Award } from 'lucide-react';
import { CharacterItem, PlayerProfile } from '../types/game';
import { CHARACTERS } from '../game/models';
import { sound } from '../game/audio';

interface CharacterShopModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onEquipCharacter: (characterId: string) => void;
  onUnlockCharacter: (character: CharacterItem) => boolean;
}

export const CharacterShopModal: React.FC<CharacterShopModalProps> = ({
  profile,
  onClose,
  onEquipCharacter,
  onUnlockCharacter,
}) => {
  const [selectedChar, setSelectedChar] = useState<CharacterItem>(
    CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0]
  );
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isUnlocked = profile.unlockedCharacterIds.includes(selectedChar.id);
  const isEquipped = profile.selectedCharacterId === selectedChar.id;

  const handleEquip = (char: CharacterItem) => {
    sound.playClick();
    onEquipCharacter(char.id);
  };

  const handleUnlock = (char: CharacterItem) => {
    const success = onUnlockCharacter(char);
    if (success) {
      sound.playPurchaseSuccess();
      setErrorMsg('');
      onEquipCharacter(char.id);
    } else {
      sound.playCrash();
      setErrorMsg(`Insufficient ${char.costType === 'gems' ? 'gems' : 'coins'} to unlock ${char.name}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-cyan-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              ⚡
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                CYBER RUNNERS
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                8 ORIGINAL 3D CARTOON RUNNERS WITH PASSIVE PERKS
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

        {/* Character Grid & Detail View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-y-auto pr-1">
          {/* Left: 8 Character Grid Selection */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHARACTERS.map((char) => {
              const unlocked = profile.unlockedCharacterIds.includes(char.id);
              const equipped = profile.selectedCharacterId === char.id;
              const isSelected = selectedChar.id === char.id;

              return (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedChar(char);
                    setErrorMsg('');
                    sound.playClick();
                  }}
                  className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Status Badges */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-['Orbitron']"
                      style={{
                        backgroundColor: `${char.colors.primary}25`,
                        color: char.colors.glow,
                        border: `1px solid ${char.colors.glow}40`,
                      }}
                    >
                      {char.rarity}
                    </span>

                    {equipped ? (
                      <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : !unlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : null}
                  </div>

                  {/* Character Avatar Icon representation */}
                  <div className="my-2 flex justify-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black font-['Orbitron'] text-xl shadow-lg border"
                      style={{
                        backgroundColor: char.colors.secondary,
                        borderColor: char.colors.glow,
                        color: char.colors.primary,
                        boxShadow: `0 0 15px ${char.colors.glow}30`,
                      }}
                    >
                      {char.name.substring(0, 1)}
                    </div>
                  </div>

                  {/* Name & Perks */}
                  <div>
                    <h4 className="text-xs font-bold text-white font-['Orbitron'] truncate">{char.name}</h4>
                    <p className="text-[10px] text-cyan-400 font-semibold truncate">
                      +{Math.round(char.multiplierBonus * 100)}% Bonus
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Character Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span
                  className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-['Orbitron'] inline-block mb-2"
                  style={{
                    backgroundColor: `${selectedChar.colors.primary}25`,
                    color: selectedChar.colors.glow,
                    border: `1px solid ${selectedChar.colors.glow}50`,
                  }}
                >
                  {selectedChar.rarity} TIER
                </span>
                <h3 className="text-2xl font-black text-white font-['Orbitron']">{selectedChar.name}</h3>
                <p className="text-xs font-semibold text-cyan-400">{selectedChar.title}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{selectedChar.description}</p>

              {/* Perk Box */}
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-['Orbitron']">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SPECIAL PASSIVE PERK</span>
                </div>
                <p className="text-xs text-slate-300">{selectedChar.perkDescription}</p>
              </div>

              {/* Color Scheme */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 font-['Orbitron']">PALETTE SCHEME</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg border border-white/20"
                    style={{ backgroundColor: selectedChar.colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-lg border border-white/20"
                    style={{ backgroundColor: selectedChar.colors.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-6 h-6 rounded-lg border border-white/20"
                    style={{ backgroundColor: selectedChar.colors.accent }}
                    title="Visor Accent"
                  />
                  <div
                    className="w-6 h-6 rounded-lg border border-white/20"
                    style={{ backgroundColor: selectedChar.colors.glow }}
                    title="Neon Glow"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-5">
              {isEquipped ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  CURRENTLY EQUIPPED
                </button>
              ) : isUnlocked ? (
                <button
                  onClick={() => handleEquip(selectedChar)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  EQUIP RUNNER
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock(selectedChar)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    UNLOCK FOR {selectedChar.costType === 'gems' ? '💎' : '¢'}{' '}
                    {selectedChar.price.toLocaleString()} {selectedChar.costType.toUpperCase()}
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
