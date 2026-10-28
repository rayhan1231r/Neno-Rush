/**
 * NEON RUSH - Settings & Android Integration Guide Modal
 * Configures audio, graphics, and provides Android Google Play Billing packaging instructions.
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, Shield, Key, Sliders, Lock } from 'lucide-react';
import { sound } from '../game/audio';

interface SettingsModalProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  onToggleMute,
  onClose,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'android_billing'>('general');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-3xl max-h-[92vh] bg-slate-950 border border-slate-700 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-lg border border-slate-600">
              ⚙️
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                SETTINGS
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                AUDIO, GRAPHICS & ANDROID GOOGLE PLAY BILLING ARCHITECTURE
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

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('general');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            GENERAL SETTINGS
          </button>
          <button
            onClick={() => {
              setActiveTab('android_billing');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android_billing'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            GOOGLE PLAY BILLING GUIDE
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              {/* Sound Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-['Orbitron'] text-sm">SYNTHWAVE AUDIO & SFX</h4>
                  <p className="text-xs text-slate-400">
                    Real-time Web Audio API procedural synthesis for soundtrack and game effects.
                  </p>
                </div>
                <button
                  onClick={onToggleMute}
                  className={`px-4 py-2.5 rounded-xl font-bold font-['Orbitron'] text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'MUTED' : 'ENABLED'}</span>
                </button>
              </div>

              {/* Graphics Pacing */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-white font-['Orbitron'] text-sm">3D RENDERING ENGINE</h4>
                <p className="text-xs text-slate-400">
                  Adaptive software-WebGL detection via <code className="text-cyan-300 font-mono">WEBGL_debug_renderer_info</code>. Uses <code className="text-cyan-300 font-mono">fenceSync</code> loop pacing on software GPUs for smooth 60fps operation without CPU freezing.
                </p>
              </div>

              {/* Admin Portal Gateway */}
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-300 font-['Orbitron'] text-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>ADMINISTRATOR CATALOG CONFIG</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Adjust coin packs, pricing tiers, and reward distributions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider cursor-pointer shadow-md"
                >
                  OPEN ADMIN
                </button>
              </div>
            </div>
          ) : (
            /* Android Play Billing Guide */
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-cyan-300 font-['Orbitron'] text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>ANDROID NATIVE BILLING ARCHITECTURE</span>
                </h4>
                <p>
                  In accordance with Google Play Developer Policies, all in-game virtual coin and gem purchases made within the Android app are routed strictly through the official Google Play Billing Library.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white font-['Orbitron']">1. Native Android Javascript Bridge:</h5>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`// Android Activity adds JavascriptInterface:
webView.addJavascriptInterface(new PlayBillingBridge(this), "AndroidPlayBilling");

// When player taps "BUY", Javascript invokes:
window.AndroidPlayBilling.launchBillingFlow(sku, accountToken);

// On native purchase completion:
webView.evaluateJavascript("window.onGooglePlayPurchaseComplete('" + json + "')", null);`}
                </pre>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white font-['Orbitron']">2. Google Play Console Product Configuration:</h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-white">neon_rush_coins_starter_1000</strong> — Starter Pack ($0.99)</li>
                  <li><strong className="text-white">neon_rush_coins_runner_5000</strong> — Runner Pack ($4.99)</li>
                  <li><strong className="text-white">neon_rush_coins_pro_12000</strong> — Pro Pack ($9.99)</li>
                  <li><strong className="text-white">neon_rush_coins_champion_30000</strong> — Champion Pack ($19.99)</li>
                  <li><strong className="text-white">neon_rush_coins_legend_75000</strong> — Legend Pack ($49.99)</li>
                  <li><strong className="text-white">neon_rush_coins_ultimate_150000</strong> — Ultimate Pack ($99.99)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white font-['Orbitron']">3. Trusted Backend Verification:</h5>
                <p>
                  Tokens are sent to <code className="text-cyan-300 font-mono">POST /api/billing/verify-purchase</code> where the Google Play Developer API verifies signatures, checks idempotency against the replay cache, and credits virtual currency via atomic transactions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
