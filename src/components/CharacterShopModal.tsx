/**
 * NEON RUSH - Characters (A - Z) Customization Gallery
 * 1-to-1 match with the "CHARACTERS (A - Z)" panel in the master visual reference sheet:
 * 18 distinct cartoon 3D cyberpunk characters:
 * - Aiden (Common), Bella (Common), Cipher (Rare), Dino (Rare), Echo (Epic), Frost (Epic)
 * - Gizmo (Epic), Hana (Legendary), Ivy (Legendary), Jax (Rare), Kira (Epic), Luna (Legendary)
 * - Max (Common), Nova (Epic), Orion (Legendary), Pixel (Rare), Queen (Legendary), Rex (Epic)
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

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'Epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'Rare':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm font-['Rajdhani']">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-950 border-2 border-cyan-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col gap-4 overflow-hidden">
        {/* Header matching reference sheet */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] tracking-wide">
              CHARACTERS (A - Z)
            </h2>
            <span className="text-xs font-bold text-cyan-400 font-['Orbitron'] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40">
              18 HEROES
            </span>
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
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl p-2.5 text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* 18 Character Grid & Detail View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {/* Left: 18 Characters Grid (6x3) matching reference sheet */}
          <div className="lg:col-span-2 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {CHARACTERS.map((char) => {
              const unlocked = profile.unlockedCharacterIds.includes(char.id);
              const equipped = profile.selectedCharacterId === char.id;
              const isSelected = selectedChar.id === char.id;

              return (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedChar(char);
                    sound.playClick();
                  }}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                      : equipped
                      ? 'border-emerald-500/70 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  {/* Status Indicator */}
                  {equipped && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  {!unlocked && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Character Avatar Box */}
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mt-1 shadow-inner">
                    {char.avatarIcon}
                  </div>

                  {/* Name */}
                  <div className="text-xs font-black text-white font-['Orbitron'] mt-1 text-center truncate w-full">
                    {char.name}
                  </div>

                  {/* Rarity Tag */}
                  <span
                    className={`mt-1 text-[9px] font-bold font-['Orbitron'] px-1.5 py-0.5 rounded-md border uppercase ${getRarityBadge(
                      char.rarity
                    )}`}
                  >
                    {char.rarity}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Character Showcase Card */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white font-['Orbitron']">
                    {selectedChar.name}
                  </h3>
                  <p className="text-xs text-cyan-400 font-semibold">{selectedChar.title}</p>
                </div>
                <span
                  className={`text-xs font-bold font-['Orbitron'] px-2 py-0.5 rounded-lg border uppercase ${getRarityBadge(
                    selectedChar.rarity
                  )}`}
                >
                  {selectedChar.rarity}
                </span>
              </div>

              {/* Character Visual Avatar */}
              <div className="w-full h-32 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-6xl shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_70%)]" />
                <span className="relative z-10">{selectedChar.avatarIcon}</span>
              </div>

              {/* Perks & Stats */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-['Orbitron']">
                    PASSIVE PERK
                  </div>
                  <div className="text-white font-semibold mt-0.5">
                    {selectedChar.perkDescription}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-['Orbitron']">
                  <span className="text-slate-400 text-xs">Score Multiplier:</span>
                  <span className="text-amber-400 font-black">
                    +{Math.round(selectedChar.multiplierBonus * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {isEquipped ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black font-['Orbitron'] text-xs text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>EQUIPPED NOW</span>
                </div>
              ) : isUnlocked ? (
                <button
                  onClick={() => handleEquip(selectedChar)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  EQUIP {selectedChar.name.toUpperCase()}
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock(selectedChar)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
                >
                  <span>UNLOCK FOR</span>
                  <span>{selectedChar.costType === 'gems' ? '💎' : '¢'}</span>
                  <span>{selectedChar.price.toLocaleString()}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
