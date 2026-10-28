/**
 * NEON RUSH - Account & Profile Modal
 * Implements real Firebase Authentication (Google Sign-In & Email/Password),
 * Cloud Firestore synchronization, guest mode fallback, and lifetime statistics.
 */

import React, { useState } from 'react';
import { X, User, Cloud, ShieldCheck, Mail, LogIn, LogOut, Loader2, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types/game';
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
  const [usernameInput, setUsernameInput] = useState<string>(profile.username);
  const [emailInput, setEmailInput] = useState<string>(profile.email || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

      // Check for existing cloud profile or merge local guest data
      const cloudData = await FirebaseService.loadCloudProfile(uid);
      let nextProfile: PlayerProfile;

      if (cloudData && cloudData.highScore !== undefined) {
        // Restore from cloud
        nextProfile = {
          ...profile,
          ...cloudData,
          userId: uid,
          email: res.user.email || emailInput,
          isGuest: false,
          lastSyncedAt: Date.now(),
        };
      } else {
        // Upload current guest profile into newly created account
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
      // Format friendly error message
      let err = res.error || 'Authentication failed';
      if (err.includes('auth/email-already-in-use')) {
        err = 'Email is already registered. Please click LOGIN instead.';
      } else if (err.includes('auth/invalid-credential') || err.includes('auth/wrong-password')) {
        err = 'Invalid email or password.';
      } else if (err.includes('auth/weak-password')) {
        err = 'Password should be at least 6 characters.';
      }
      setFeedbackMsg({ text: err, type: 'error' });
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
          username: cloudData.username || res.user.displayName || profile.username,
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
        err = 'This domain is not in your Firebase Authorized Domains list. Add this app URL in Firebase Console > Authentication > Settings > Authorized domains.';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-2xl max-h-[92vh] bg-slate-950 border border-cyan-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                RIDER ACCOUNT
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>PLAYER ID: {profile.userId}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className={profile.isGuest ? 'text-amber-400' : 'text-emerald-400'}>
                  {profile.isGuest ? 'GUEST PROFILE (LOCAL)' : 'FIREBASE CLOUD SYNCED'}
                </span>
              </div>
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

        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl text-xs text-center font-bold border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Lifetime Run Statistics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 font-['Orbitron'] tracking-wider">
              CAREER RUN METRICS
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-500 font-bold block font-['Orbitron']">HIGH SCORE</span>
                <span className="text-lg font-black text-cyan-300 font-['Orbitron'] tabular-nums">
                  {profile.highScore.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-500 font-bold block font-['Orbitron']">MAX DISTANCE</span>
                <span className="text-lg font-black text-violet-300 font-['Orbitron'] tabular-nums">
                  {profile.highestDistance.toLocaleString()}m
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-500 font-bold block font-['Orbitron']">LIFETIME COINS</span>
                <span className="text-lg font-black text-amber-300 font-['Orbitron'] tabular-nums">
                  {profile.lifetimeCoins.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-500 font-bold block font-['Orbitron']">RUNS COMPLETED</span>
                <span className="text-lg font-black text-white font-['Orbitron'] tabular-nums">
                  {profile.runsPlayed.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Username */}
          <form onSubmit={handleSaveUsername} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white font-['Orbitron']">CUSTOMIZE RIDER HANDLE</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={20}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-['Orbitron']"
                placeholder="Rider name"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all cursor-pointer"
              >
                SAVE
              </button>
            </div>
          </form>

          {/* Cloud Account Sync (Firebase Auth & Firestore) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-['Orbitron']">FIREBASE CLOUD AUTH & FIRESTORE</h4>
                <p className="text-xs text-slate-400">
                  Project: <code className="text-cyan-300 font-mono">neon-rush-32e8a</code> · Real-time sync for balances, inventory & high scores.
                </p>
              </div>
              <Cloud className={`w-6 h-6 ${profile.isGuest ? 'text-slate-500' : 'text-emerald-400'}`} />
            </div>

            {profile.isGuest ? (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <span>CONTINUE WITH GOOGLE</span>
                  )}
                </button>

                <div className="flex items-center gap-2 text-slate-600 text-xs my-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span>OR WITH EMAIL & PASSWORD</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Password (minimum 6 characters)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={() => setIsRegistering(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold font-['Orbitron'] text-xs tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loading && !isRegistering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>LOGIN</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={() => setIsRegistering(true)}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loading && isRegistering && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />}
                      <span>CREATE ACCOUNT</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white font-['Orbitron']">{profile.email}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cloud Firestore Synced</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
