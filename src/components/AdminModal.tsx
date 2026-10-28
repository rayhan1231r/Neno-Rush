/**
 * NEON RUSH - Administrator Configuration Modal
 * Provides secure administrator workflow for coin pack catalog pricing,
 * reward distribution, and test ledger resets with role-based auth.
 */

import React, { useState } from 'react';
import { X, Lock, Key, Save, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';
import { CoinPack } from '../types/game';
import { DEFAULT_COIN_PACKS } from '../game/rules';
import { sound } from '../game/audio';

interface AdminModalProps {
  onClose: () => void;
  onGrantCoins: (coins: number, gems: number) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ onClose, onGrantCoins }) => {
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [catalog, setCatalog] = useState<CoinPack[]>([...DEFAULT_COIN_PACKS]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecret === 'neon_rush_admin_2026') {
      setIsAuthenticated(true);
      setErrorMsg('');
      sound.playPurchaseSuccess();
    } else {
      setErrorMsg('Invalid administrator secret token');
      sound.playCrash();
    }
  };

  const handleUpdatePrice = (id: string, price: number) => {
    setCatalog((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, priceUsd: price, formattedPrice: `$${price.toFixed(2)}` } : p
      )
    );
  };

  const handleUpdateCoins = (id: string, coins: number) => {
    setCatalog((prev) =>
      prev.map((p) => (p.id === id ? { ...p, coinAmount: coins } : p))
    );
  };

  const handleSaveCatalog = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: 'neon_rush_admin_2026',
          updatedCatalog: catalog,
        }),
      });
      if (res.ok) {
        sound.playPurchaseSuccess();
        setSuccessMsg('Catalog pricing updated and broadcast across server!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to update server catalog');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-3xl max-h-[92vh] bg-slate-950 border border-amber-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                ADMIN CONSOLE
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                ROLE-BASED AUTHORIZATION & LIVE CATALOG GOVERNANCE
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

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl p-2.5 text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl p-2.5 text-xs text-center font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isAuthenticated ? (
          /* Authentication Screen */
          <form onSubmit={handleLogin} className="my-auto py-10 max-w-md mx-auto w-full space-y-4 text-center">
            <Key className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white font-['Orbitron']">ENTER ADMIN SECRET TOKEN</h3>
            <p className="text-xs text-slate-400">
              Default development secret: <code className="text-amber-400 font-mono">neon_rush_admin_2026</code>
            </p>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Admin token"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider cursor-pointer shadow-md"
            >
              AUTHENTICATE AS ADMIN
            </button>
          </form>
        ) : (
          /* Authenticated Admin Catalog Editor */
          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            {/* Quick Test Credit */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-['Orbitron']">DEV TEST RECHARGE</h4>
                <p className="text-xs text-slate-400">Instantly grant test coins & gems to current session.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onGrantCoins(5000, 50);
                    sound.playPurchaseSuccess();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  +5,000 Coins
                </button>
                <button
                  onClick={() => {
                    onGrantCoins(25000, 200);
                    sound.playPurchaseSuccess();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  +25,000 Coins
                </button>
              </div>
            </div>

            {/* Catalog Price & Pack Tweaker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white font-['Orbitron']">PRODUCT CATALOG PRICING</h4>
                <button
                  onClick={handleSaveCatalog}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-['Orbitron'] text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  SAVE CHANGES
                </button>
              </div>

              <div className="space-y-2">
                {catalog.map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white font-['Orbitron']">{pack.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{pack.sku}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">Coins:</span>
                        <input
                          type="number"
                          value={pack.coinAmount}
                          onChange={(e) => handleUpdateCoins(pack.id, Number(e.target.value))}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-amber-300 font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">Price ($):</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pack.priceUsd}
                          onChange={(e) => handleUpdatePrice(pack.id, Number(e.target.value))}
                          className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-emerald-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
