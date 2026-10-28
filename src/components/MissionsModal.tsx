/**
 * NEON RUSH - Missions & Achievements Screen
 * 1-to-1 match with the "MISSIONS & ACHIEVEMENTS" panel in the master visual reference sheet:
 * - Tabs: Missions | Achievements
 * - Missions List:
 *     1. Daily Runner: Run 5,000 meters (2,460 / 5,000) — Reward: +500 Coins
 *     2. First Run: Complete 1 run (1 / 1) — Reward: +100 Coins [Claim]
 *     3. Collect 1,000 Coins: (1,000 / 1,000) — Reward: +400 Coins [Claim]
 *     4. High Score Champion: Reach 50,000 score (32,560 / 50,000) — Reward: +600 Coins
 * - Includes 7-Day Login Streak Rewards
 */

import React, { useState } from 'react';
import { X, Trophy, CheckCircle2, Award, Sparkles, Gift } from 'lucide-react';
import { Mission, PlayerProfile } from '../types/game';
import { DAILY_REWARDS_TABLE } from '../services/storage';
import { sound } from '../game/audio';

interface MissionsModalProps {
  profile: PlayerProfile;
  missions: Mission[];
  onClose: () => void;
  onClaimMission: (missionId: string) => void;
  onClaimDailyReward: (day: number) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  profile,
  missions,
  onClose,
  onClaimMission,
  onClaimDailyReward,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');

  const handleClaim = (mission: Mission) => {
    sound.playPurchaseSuccess();
    onClaimMission(mission.id);
  };

  const currentMissions = missions.filter((m) =>
    activeTab === 'missions' ? m.type === 'daily' : m.type === 'achievement'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm font-['Rajdhani']">
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-950 border-2 border-indigo-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] tracking-wide">
            MISSIONS & ACHIEVEMENTS
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Missions | Achievements matching reference */}
        <div className="flex items-center justify-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => {
              setActiveTab('missions');
              sound.playClick();
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Missions
          </button>
          <button
            onClick={() => {
              setActiveTab('achievements');
              sound.playClick();
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Scrollable Missions List matching reference */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {currentMissions.map((mission) => {
            const isCompleted = mission.completed || mission.currentValue >= mission.targetValue;
            const isClaimed = mission.claimed;
            const percent = Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100));

            return (
              <div
                key={mission.id}
                className={`bg-slate-900/80 border rounded-2xl p-3.5 transition-all shadow-md flex items-center justify-between gap-3 ${
                  isCompleted && !isClaimed
                    ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'border-slate-800'
                }`}
              >
                {/* Mission Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                  {mission.id.includes('daily')
                    ? '🏃'
                    : mission.id.includes('first')
                    ? '🎯'
                    : mission.id.includes('collect')
                    ? '💰'
                    : '⭐'}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-white font-['Orbitron'] truncate">
                      {mission.title}
                    </h4>
                    <span className="text-xs font-bold font-['Orbitron'] text-amber-300 flex items-center gap-1 shrink-0">
                      <span>+{mission.rewardAmount}</span>
                      <span className="text-[11px]">¢</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {mission.description}
                  </p>

                  {/* Progress Bar & Numeric Target */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_8px_#10b981]'
                            : 'bg-gradient-to-r from-cyan-400 to-sky-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold font-['Orbitron'] text-slate-400 shrink-0 tabular-nums">
                      {mission.currentValue.toLocaleString()} / {mission.targetValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Claim Button / Status matching reference */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-[11px] font-bold text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(mission)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-['Orbitron'] text-xs shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all cursor-pointer active:scale-95 animate-pulse"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold font-['Orbitron'] text-slate-500 px-2 py-1 rounded bg-slate-950">
                      {percent}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-Day Login Streak Strip at Bottom */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 font-['Orbitron'] flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-indigo-400" />
              7-Day Streak Rewards
            </span>
            <span className="text-[10px] text-cyan-400 font-bold font-['Orbitron']">
              Day 3 of 7
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAILY_REWARDS_TABLE.map((r) => {
              const isClaimed = profile.claimedDailyRewards.includes(r.day);
              const isToday = r.day === 3;
              return (
                <div
                  key={r.day}
                  onClick={() => {
                    if (isToday && !isClaimed) {
                      onClaimDailyReward(r.day);
                    }
                  }}
                  className={`flex flex-col items-center p-1.5 rounded-xl border text-center transition-all ${
                    isClaimed
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                      : isToday
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)] cursor-pointer animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] font-bold font-['Orbitron']">D{r.day}</span>
                  <span className="text-xs mt-0.5">{r.rewardType === 'gems' ? '💎' : '¢'}</span>
                  <span className="text-[9px] font-black font-['Orbitron'] tabular-nums">{r.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
