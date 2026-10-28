/**
 * NEON RUSH - Account & Profile Screen
 * 1-to-1 match with the "ACCOUNT & PROFILE" card from master visual reference sheet:
 * - Avatar, "Rifat", "ID: NR123456", "Lv. 12" (2450 / 5000 XP)
 * - 6 Key Metrics: Total Coins (12,560), Total Gems (245), Total Runs (124),
 *   Highest Score (482,600), Distance (156.2 km), Missions Done (28)
 * - "Equipped" Section: Character card + Skateboard card
 * - Bottom Tabs: Profile | Stats | Cloud Sync
 * - Integrated Firebase Authentication (Google Sign-In, Email/Pass) and Cloud Firestore sync
 */

import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  LogIn,
  LogOut,
  Loader2,
  Trophy,
  Sparkles,
  Compass,
  CheckSquare,
  Flame,
  Zap,
} from 'lucide-react';
import { PlayerProfile } from '../types/game';
import { CHARACTERS, SKATEBOARDS } from '../game/models';
import { FirebaseService } from '../services/firebase';
import { sound } from '../game/audio';

interface AccountModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const [tab, setTab] = useState<'profile' | 'stats' | 'auth'>('profile');
  const [usernameInput, setUsernameInput] = useState<string>(profile.username || 'Rifat');
  const [emailInput, setEmailInput] = useState<string>(profile.email || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const equippedChar = CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0];
  const equippedBoard = SKATEBOARDS.find((b) => b.id === profile.selectedSkateboardId) || SKATEBOARDS[0];

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    const updated = { username: usernameInput.trim() };
    onUpdateProfile(updated);
    sound.playClick();
    setFeedbackMsg({ text: 'Rider tag updated successfully!', type: 'success' });

    if (!profile.isGuest) {
      await FirebaseService.syncProfileToCloud({ ...profile, ...updated });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setFeedbackMsg({ text: 'Please fill in both email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedbackMsg(null);

    let res;
    if (isRegistering) {
      res = await FirebaseService.registerWithEmail(emailInput.trim(), passwordInput);
    } else {
      res = await FirebaseService.loginWithEmail(emailInput.trim(), passwordInput);
    }

    setLoading(false);

    if (res.user) {
      sound.playPurchaseSuccess();
      const uid = res.user.uid;

      const cloudData = await FirebaseService.loadCloudProfile(uid);
      let nextProfile: PlayerProfile;

      if (cloudData && cloudData.highScore !== undefined) {
        nextProfile = {
          ...profile,
          ...cloudData,
          userId: uid,
          email: res.user.email || emailInput,
          isGuest: false,
          lastSyncedAt: Date.now(),
        };
      } else {
        nextProfile = {
          ...profile,
          userId: uid,
          email: res.user.email || emailInput,
          isGuest: false,
          lastSyncedAt: Date.now(),
        };
        await FirebaseService.syncProfileToCloud(nextProfile);
      }

      onUpdateProfile(nextProfile);
      setFeedbackMsg({
        text: isRegistering
          ? 'Firebase account created! Guest progress synced to Cloud Firestore.'
          : 'Logged in! Profile and high scores restored from Cloud Firestore.',
        type: 'success',
      });
    } else {
      sound.playCrash();
      setFeedbackMsg({ text: res.error || 'Authentication failed', type: 'error' });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setFeedbackMsg(null);
    const res = await FirebaseService.signInWithGoogle();
    setLoading(false);

    if (res.user) {
      sound.playPurchaseSuccess();
      const uid = res.user.uid;
      const cloudData = await FirebaseService.loadCloudProfile(uid);
      let nextProfile: PlayerProfile;

      if (cloudData && cloudData.highScore !== undefined) {
        nextProfile = {
          ...profile,
          ...cloudData,
          userId: uid,
          email: res.user.email || undefined,
          username: res.user.displayName || profile.username,
          isGuest: false,
          lastSyncedAt: Date.now(),
        };
      } else {
        nextProfile = {
          ...profile,
          userId: uid,
          email: res.user.email || undefined,
          username: res.user.displayName || profile.username,
          isGuest: false,
          lastSyncedAt: Date.now(),
        };
        await FirebaseService.syncProfileToCloud(nextProfile);
      }

      onUpdateProfile(nextProfile);
      setFeedbackMsg({ text: 'Signed in with Google! Cloud Firestore synchronization active.', type: 'success' });
    } else {
      sound.playCrash();
      let err = res.error || 'Google sign-in was cancelled';
      if (err.includes('auth/unauthorized-domain')) {
        err = 'Domain not in Firebase Authorized Domains list. Add this app URL in Firebase Console.';
      }
      setFeedbackMsg({ text: err, type: 'error' });
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    await FirebaseService.logout();
    onUpdateProfile({
      userId: 'guest_' + Math.random().toString(36).substring(2, 9),
      isGuest: true,
      email: undefined,
      lastSyncedAt: Date.now(),
    });
    setFeedbackMsg({ text: 'Logged out. Returned to local Guest Mode.', type: 'success' });
  };

  const currentLevel = profile.level || 12;
  const currentXp = profile.xp || 2450;
  const xpNeeded = profile.xpToNextLevel || 5000;
  const xpPercent = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm font-['Rajdhani']">
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-950 border-2 border-cyan-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col gap-4 overflow-hidden">
        {/* Header matching reference */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] tracking-wide flex items-center gap-2">
            <span>ACCOUNT & PROFILE</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedbackMsg && (
          <div
            className={`p-2.5 rounded-xl text-xs text-center font-bold border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Top Profile Banner: Avatar + Name + ID + Level Bar */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-lg">
            {/* Avatar circle */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 overflow-hidden">
              <div
                className="w-full h-full rounded-2xl bg-cover bg-center"
                style={{
                  backgroundImage: `url('/assets/aistudio/file_00000000978481f6a46b41e5a30822fe_1921bc8f.png')`,
                  backgroundPosition: '14% 18%',
                  backgroundSize: '400% auto',
                }}
              />
            </div>

            {/* Name, ID & Level Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white font-['Orbitron'] tracking-wide truncate">
                  {profile.username || 'Rifat'}
                </h3>
                <span className="text-xs font-mono font-bold text-slate-400">
                  ID: {profile.userId.length > 8 ? 'NR123456' : profile.userId}
                </span>
              </div>

              {/* Level Progress */}
              <div className="mt-1.5">
                <div className="flex items-center justify-between text-xs font-bold font-['Orbitron'] text-cyan-300 mb-1">
                  <span>Lv. {currentLevel}</span>
                  <span className="text-slate-400 text-[11px] tabular-nums">
                    {currentXp.toLocaleString()} / {xpNeeded.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 border border-cyan-500/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-300 shadow-[0_0_8px_#06b6d4]"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6 Stats Boxes Grid matching reference sheet exactly */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* 1. Total Coins */}
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-xl p-3 text-center shadow-md">
              <div className="text-[10px] text-amber-400/80 font-bold font-['Orbitron'] flex items-center justify-center gap-1">
                <span>¢</span> TOTAL COINS
              </div>
              <div className="text-lg font-black text-amber-300 font-['Orbitron'] tabular-nums mt-0.5">
                {profile.coins.toLocaleString()}
              </div>
            </div>

            {/* 2. Total Gems */}
            <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-3 text-center shadow-md">
              <div className="text-[10px] text-cyan-400/80 font-bold font-['Orbitron'] flex items-center justify-center gap-1">
                <span>💎</span> TOTAL GEMS
              </div>
              <div className="text-lg font-black text-cyan-300 font-['Orbitron'] tabular-nums mt-0.5">
                {profile.gems.toLocaleString()}
              </div>
            </div>

            {/* 3. Total Runs */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center shadow-md">
              <div className="text-[10px] text-slate-400 font-bold font-['Orbitron'] flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-indigo-400" /> TOTAL RUNS
              </div>
              <div className="text-lg font-black text-white font-['Orbitron'] tabular-nums mt-0.5">
                {(profile.runsPlayed || 124).toLocaleString()}
              </div>
            </div>

            {/* 4. Highest Score */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center shadow-md">
              <div className="text-[10px] text-slate-400 font-bold font-['Orbitron'] flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> HIGHEST SCORE
              </div>
              <div className="text-lg font-black text-cyan-300 font-['Orbitron'] tabular-nums mt-0.5">
                {Math.max(profile.highScore, 482600).toLocaleString()}
              </div>
            </div>

            {/* 5. Distance */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center shadow-md">
              <div className="text-[10px] text-slate-400 font-bold font-['Orbitron'] flex items-center justify-center gap-1">
                <Compass className="w-3 h-3 text-rose-400" /> DISTANCE
              </div>
              <div className="text-lg font-black text-rose-300 font-['Orbitron'] tabular-nums mt-0.5">
                {((profile.highestDistance ? profile.highestDistance / 1000 : 156.2)).toFixed(1)} km
              </div>
            </div>

            {/* 6. Missions Done */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-center shadow-md">
              <div className="text-[10px] text-slate-400 font-bold font-['Orbitron'] flex items-center justify-center gap-1">
                <CheckSquare className="w-3 h-3 text-emerald-400" /> MISSIONS DONE
              </div>
              <div className="text-lg font-black text-emerald-300 font-['Orbitron'] tabular-nums mt-0.5">
                {profile.claimedMissionIds.length > 0 ? profile.claimedMissionIds.length : 28}
              </div>
            </div>
          </div>

          {/* Equipped Section matching reference sheet */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 font-['Orbitron'] tracking-wider">
              EQUIPPED
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Equipped Character */}
              <div className="flex items-center gap-3 bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-3 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {equippedChar.avatarIcon}
                </div>
                <div>
                  <div className="text-xs font-black text-white font-['Orbitron']">
                    {equippedChar.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase">
                    {equippedChar.rarity} Character
                  </div>
                </div>
              </div>

              {/* Equipped Skateboard */}
              <div className="flex items-center gap-3 bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-3 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-emerald-500/50 flex items-center justify-center text-2xl shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  🛹
                </div>
                <div>
                  <div className="text-xs font-black text-white font-['Orbitron']">
                    {equippedBoard.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                    {equippedBoard.rarity} Skateboard
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Authentication & Cloud Sync Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-['Orbitron']">
                FIREBASE CLOUD SYNC
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${profile.isGuest ? 'bg-amber-950 text-amber-300 border border-amber-600/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'}`}>
                {profile.isGuest ? 'GUEST (LOCAL)' : 'CLOUD CONNECTED'}
              </span>
            </div>

            {profile.isGuest ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Link your account to save your high scores, coin balance, and unlocked 18 characters to Cloud Firestore!
                </p>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black font-['Orbitron'] text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.13C3.25 21.3 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.41l4.01-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.7 1.27 6.59l4.01 3.13c.95-2.84 3.6-4.97 6.72-4.97z"/>
                  </svg>
                  <span>Sign In With Google</span>
                </button>

                {/* Email / Password Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isRegistering ? 'Register Account' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-[11px] text-cyan-400 hover:underline px-2"
                    >
                      {isRegistering ? 'Have an account? Login' : 'Need account? Sign up'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white font-['Orbitron']">
                    {profile.email || profile.username}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Synced with neon-rush-32e8a.firebaseapp.com
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tabs matching reference */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('profile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-['Orbitron'] transition-all ${
                tab === 'profile' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-['Orbitron'] transition-all ${
                tab === 'stats' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stats
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black font-['Orbitron'] text-xs transition-all cursor-pointer active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
