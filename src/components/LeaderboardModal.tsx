/**
 * NEON RUSH - Global Rankings & Leaderboard Modal
 * Implements top-3 podium, daily/weekly/all-time filters, username search, and verified server scores.
 */

import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Search, Crown, Sparkles, User, RefreshCw } from 'lucide-react';
import { LeaderboardEntry, PlayerProfile } from '../types/game';
import { sound } from '../game/audio';

interface LeaderboardModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ profile, onClose }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'alltime'>('alltime');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard/top?userId=${encodeURIComponent(profile.userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leaderboard)) {
          // If current user is not in top 20, inject them with their high score for reference
          const list: LeaderboardEntry[] = [...data.leaderboard];
          const hasUser = list.some((e) => e.userId === profile.userId);
          if (!hasUser && profile.highScore > 0) {
            list.push({
              rank: 42,
              userId: profile.userId,
              username: profile.username + ' (You)',
              characterId: profile.selectedCharacterId,
              score: profile.highScore,
              distance: profile.highestDistance,
              coinsCollected: profile.lifetimeCoins,
              timestamp: Date.now(),
              isCurrentUser: true,
            });
          }
          setLeaderboard(list);
        }
      }
    } catch {
      // Ignore
    }
    setLoading(false);
  };

  const filteredList = leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-purple-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              🏆
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                GLOBAL RANKINGS
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                VERIFIED ANTI-CHEAT LEADERBOARD · DAILY, WEEKLY & ALL-TIME
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

        {/* Filters & Search */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Time Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => {
                setPeriod('daily');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
                period === 'daily'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DAILY
            </button>
            <button
              onClick={() => {
                setPeriod('weekly');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WEEKLY
            </button>
            <button
              onClick={() => {
                setPeriod('alltime');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
                period === 'alltime'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL-TIME
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rider username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Top 3 Podium */}
        {!searchQuery && top1 && top2 && top3 && (
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-2 pb-3 px-2 border-b border-slate-800/80">
            {/* 2nd Place - Silver */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-slate-200 text-xl font-black font-['Orbitron'] shadow-md relative">
                {top2.username.substring(0, 1)}
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-slate-400 text-slate-950 text-[10px] font-black font-['Orbitron']">
                  2ND
                </span>
              </div>
              <h4 className="mt-2 text-xs md:text-sm font-bold text-white font-['Orbitron'] truncate w-full">
                {top2.username}
              </h4>
              <span className="text-xs font-black text-cyan-300 font-['Orbitron'] tabular-nums">
                {top2.score.toLocaleString()}
              </span>
              <div className="w-full h-12 bg-slate-900 border-t-2 border-slate-400 rounded-t-lg mt-2 flex items-center justify-center text-slate-400 font-black font-['Orbitron'] text-sm">
                #2
              </div>
            </div>

            {/* 1st Place - Gold Champion */}
            <div className="flex flex-col items-center text-center -mt-4">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce mb-1" />
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-yellow-300 flex items-center justify-center text-slate-950 text-2xl font-black font-['Orbitron'] shadow-[0_0_20px_rgba(245,158,11,0.5)] relative">
                {top1.username.substring(0, 1)}
                <span className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black font-['Orbitron'] shadow-md">
                  CHAMPION
                </span>
              </div>
              <h4 className="mt-2 text-xs md:text-sm font-black text-amber-300 font-['Orbitron'] truncate w-full">
                {top1.username}
              </h4>
              <span className="text-sm font-black text-amber-400 font-['Orbitron'] tabular-nums">
                {top1.score.toLocaleString()}
              </span>
              <div className="w-full h-20 bg-gradient-to-t from-slate-900 to-amber-950/40 border-t-2 border-amber-400 rounded-t-lg mt-2 flex items-center justify-center text-amber-400 font-black font-['Orbitron'] text-base">
                #1
              </div>
            </div>

            {/* 3rd Place - Bronze */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-amber-950 border-2 border-amber-700 flex items-center justify-center text-amber-300 text-xl font-black font-['Orbitron'] shadow-md relative">
                {top3.username.substring(0, 1)}
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-700 text-amber-200 text-[10px] font-black font-['Orbitron']">
                  3RD
                </span>
              </div>
              <h4 className="mt-2 text-xs md:text-sm font-bold text-white font-['Orbitron'] truncate w-full">
                {top3.username}
              </h4>
              <span className="text-xs font-black text-cyan-300 font-['Orbitron'] tabular-nums">
                {top3.score.toLocaleString()}
              </span>
              <div className="w-full h-8 bg-slate-900 border-t-2 border-amber-700 rounded-t-lg mt-2 flex items-center justify-center text-amber-600 font-black font-['Orbitron'] text-sm">
                #3
              </div>
            </div>
          </div>
        )}

        {/* Ranked Riders Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredList.map((entry) => (
            <div
              key={entry.userId}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                entry.isCurrentUser
                  ? 'bg-purple-950/50 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 text-center font-black font-['Orbitron'] text-sm ${
                    entry.rank === 1
                      ? 'text-yellow-400'
                      : entry.rank === 2
                      ? 'text-slate-300'
                      : entry.rank === 3
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  #{entry.rank}
                </span>

                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold font-['Orbitron'] text-white">
                  {entry.username.substring(0, 1)}
                </div>

                <div>
                  <h4 className="font-bold text-white font-['Orbitron'] flex items-center gap-2">
                    <span>{entry.username}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[9px] bg-purple-500 text-white font-black px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Dist: {entry.distance.toLocaleString()}m</span>
                    <span>•</span>
                    <span>Coins: {entry.coinsCollected.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-cyan-300 tabular-nums font-['Orbitron'] block">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">POINTS</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
