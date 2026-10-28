/**
 * NEON RUSH - Missions & 7-Day Daily Rewards Modal
 * Implements daily missions, distance challenges, login streak bonus calendar,
 * and duplicate claim prevention.
 */

import React, { useState } from 'react';
import { X, CheckCircle2, Gift, Calendar, Trophy, Zap, Award } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'missions' | 'daily'>('missions');

  const handleClaimReward = (m: Mission) => {
    if (!m.completed || m.claimed) return;
    sound.playPurchaseSuccess();
    onClaimMission(m.id);
  };

  const handleClaimDay = (day: number) => {
    sound.playPurchaseSuccess();
    onClaimDailyReward(day);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-rose-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              🎯
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                MISSIONS & REWARDS
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                DAILY RUN QUESTS & 7-DAY LOGIN STREAK CALENDAR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('missions');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ACTIVE MISSIONS</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('daily');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-DAY LOGIN STREAK ({profile.loginStreak} DAYS)</span>
          </button>
        </div>

        {/* Tab 1: Missions */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'missions' ? (
            <div className="space-y-3">
              {missions.map((m) => {
                const progressPct = Math.min(100, Math.round((m.currentValue / m.targetValue) * 100));
                const isClaimable = m.completed && !m.claimed;

                return (
                  <div
                    key={m.id}
                    className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isClaimable
                        ? 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                        : m.claimed
                        ? 'border-slate-800 opacity-60'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-['Orbitron']">
                          {m.type}
                        </span>
                        <h4 className="font-bold text-white font-['Orbitron'] text-sm">{m.title}</h4>
                      </div>

                      <p className="text-xs text-slate-400">{m.description}</p>

                      {/* Progress Bar */}
                      <div className="w-full max-w-md space-y-1">
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                          <span>
                            Progress: {m.currentValue.toLocaleString()} / {m.targetValue.toLocaleString()}
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Reward & Claim Button */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">REWARD</span>
                        <span className="text-sm font-black font-['Orbitron'] text-amber-300 flex items-center gap-1 justify-end">
                          {m.rewardType === 'gems' ? '💎' : '¢'} +{m.rewardAmount.toLocaleString()}{' '}
                          {m.rewardType.toUpperCase()}
                        </span>
                      </div>

                      {m.claimed ? (
                        <div className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold font-['Orbitron'] text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>CLAIMED</span>
                        </div>
                      ) : isClaimable ? (
                        <button
                          onClick={() => handleClaimReward(m)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black font-['Orbitron'] text-xs tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95 transition-all cursor-pointer animate-pulse"
                        >
                          CLAIM REWARD
                        </button>
                      ) : (
                        <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 font-bold font-['Orbitron'] text-xs">
                          IN PROGRESS
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tab 2: 7-Day Login Streak */
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-['Orbitron'] text-sm">CURRENT LOGIN STREAK</h4>
                  <p className="text-xs text-slate-400">Log in every 24 hours to claim ascending coin & gem bonuses!</p>
                </div>
                <div className="text-2xl font-black text-rose-400 font-['Orbitron']">
                  🔥 {profile.loginStreak} DAYS
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {DAILY_REWARDS_TABLE.map((r) => {
                  const isClaimed = profile.claimedDailyRewards.includes(r.day);
                  const isToday = profile.loginStreak === r.day;
                  const isAvailable = isToday && !isClaimed;

                  return (
                    <div
                      key={r.day}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between gap-3 ${
                        isAvailable
                          ? 'bg-rose-950/40 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
                          : isClaimed
                          ? 'bg-slate-900/60 border-slate-800 opacity-60'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-400 font-['Orbitron']">
                        DAY {r.day}
                      </span>

                      <div className="text-3xl my-1">
                        {r.day === 7 ? '👑' : r.rewardType === 'gems' ? '💎' : '💰'}
                      </div>

                      <div>
                        <span className="text-xs font-black text-amber-300 font-['Orbitron'] block">
                          +{r.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {r.rewardType}
                        </span>
                      </div>

                      {isClaimed ? (
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-['Orbitron']">
                          <CheckCircle2 className="w-3.5 h-3.5" /> CLAIMED
                        </div>
                      ) : isAvailable ? (
                        <button
                          onClick={() => handleClaimDay(r.day)}
                          className="w-full py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold font-['Orbitron'] text-[10px] tracking-wider cursor-pointer shadow-md active:scale-95"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {r.day < profile.loginStreak ? 'EXPIRED' : 'LOCKED'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
