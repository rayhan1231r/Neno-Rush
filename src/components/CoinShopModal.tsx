/**
 * NEON RUSH - Coin Shop & Real Payments Modal
 * Strictly implements sections 5, 6 & 7:
 * - Real product catalog fetched from server backend
 * - Verified prices matching Google Play in-app products
 * - Checkout loading state with secure backend token verification
 * - Duplicate coin prevention & idempotent transactions
 * - Transaction history and restore purchases
 * - Clear separation of Google Play Billing from Sandbox preview
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  RotateCcw,
  History,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { CoinPack, PlayerProfile, PurchaseTransaction } from '../types/game';
import { BillingService } from '../services/billing';
import { StorageService } from '../services/storage';
import { sound } from '../game/audio';

interface CoinShopModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onCoinsPurchased: (coins: number, gems: number) => void;
}

export const CoinShopModal: React.FC<CoinShopModalProps> = ({
  profile,
  onClose,
  onCoinsPurchased,
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'history'>('packs');
  const [catalog, setCatalog] = useState<CoinPack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasingPack, setPurchasingPack] = useState<CoinPack | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<
    'idle' | 'requesting' | 'verifying_backend' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastVerifiedTx, setLastVerifiedTx] = useState<PurchaseTransaction | null>(null);
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [isSandbox, setIsSandbox] = useState<boolean>(BillingService.isSandbox());
  const [restoring, setRestoring] = useState<boolean>(false);
  const [restoreMessage, setRestoreMessage] = useState<string>('');

  useEffect(() => {
    loadCatalog();
    setTransactions(StorageService.loadTransactions());
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    const packs = await BillingService.fetchCatalog();
    setCatalog(packs);
    setLoading(false);
  };

  const handleBuy = async (pack: CoinPack) => {
    setPurchasingPack(pack);
    setCheckoutStep('requesting');
    setErrorMessage('');

    // Step 1: Simulate / Launch Play Billing
    setTimeout(async () => {
      setCheckoutStep('verifying_backend');

      const result = await BillingService.initiatePurchase(pack, profile.userId);

      if (result.success && result.transaction) {
        setCheckoutStep('success');
        setLastVerifiedTx(result.transaction);
        sound.playPurchaseSuccess();
        onCoinsPurchased(pack.coinAmount, pack.gemAmount);
        setTransactions(StorageService.loadTransactions());
      } else {
        setCheckoutStep('error');
        setErrorMessage(result.errorMessage || 'Purchase authorization was declined or cancelled.');
      }
    }, 700);
  };

  const handleRestore = async () => {
    setRestoring(true);
    setRestoreMessage('');
    const res = await BillingService.restorePurchases(profile.userId);
    setRestoring(false);
    setRestoreMessage(
      res.restoredCount > 0
        ? `Successfully restored ${res.restoredCount} past purchases.`
        : 'All eligible purchases are already synchronized with your account.'
    );
    setTransactions(StorageService.loadTransactions());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-none font-['Rajdhani']">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-amber-500/50 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_#f59e0b]">
              ¢
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide">
                CYBER COIN SHOP
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>OFFICIAL GOOGLE PLAY BILLING INTEGRATION</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE TRUSTED BACKEND
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance Pips */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-xs font-bold text-amber-400 font-['Orbitron']">¢ {profile.coins.toLocaleString()}</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-bold text-cyan-400 font-['Orbitron']">💎 {profile.gems.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Shop"
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Environment Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('packs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
                activeTab === 'packs'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              COIN PACKS
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              PURCHASE HISTORY ({transactions.length})
            </button>
          </div>

          {/* Sandbox Indicator & Restore */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${restoring ? 'animate-spin' : ''}`} />
              <span>{restoring ? 'SYNCHRONIZING...' : 'RESTORE PURCHASES'}</span>
            </button>
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSandbox ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{isSandbox ? 'WEB SANDBOX MODE' : 'ANDROID PLAY BILLING'}</span>
            </div>
          </div>
        </div>

        {restoreMessage && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-xl p-2.5 text-xs text-center font-medium">
            {restoreMessage}
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'packs' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <span className="font-['Orbitron'] text-sm">FETCHING GOOGLE PLAY IN-APP CATALOG...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catalog.map((pack) => (
                  <div
                    key={pack.id}
                    className={`relative bg-slate-900/90 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:scale-[1.01] shadow-lg ${
                      pack.bestValue
                        ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : pack.featured
                        ? 'border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.2)]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    {pack.badge && (
                      <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] font-['Orbitron'] tracking-wider shadow-md">
                        {pack.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{pack.icon}</span>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">SKU</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{pack.sku}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-white font-['Orbitron'] tracking-wide">
                        {pack.name}
                      </h3>

                      <div className="my-3 space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-amber-400 tabular-nums font-['Orbitron']">
                            +{pack.coinAmount.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-amber-300">COINS</span>
                        </div>
                        {pack.gemAmount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                            <span>💎</span>
                            <span>+{pack.gemAmount.toLocaleString()} BONUS GEMS</span>
                          </div>
                        )}
                        {pack.bonusPercentage > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 block">
                            +{pack.bonusPercentage}% EXTRA VALUE
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(pack)}
                      className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>BUY FOR {pack.formattedPrice}</span>
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Purchase History Tab */
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <History className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="font-['Orbitron'] text-sm">NO PURCHASE TRANSACTIONS RECORDED YET</p>
                  <p className="text-xs">When you purchase coin packs, verified receipts will appear here.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.transactionId}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-['Orbitron'] text-sm">{tx.productName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                          {tx.status}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                          {tx.provider === 'google_play' ? 'Google Play' : 'Sandbox Test'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono flex flex-wrap gap-x-4">
                        <span>Order: {tx.orderId}</span>
                        <span>Date: {new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <div className="text-amber-400 font-bold font-['Orbitron'] text-sm">
                        +{tx.coinsAwarded.toLocaleString()} Coins {tx.gemsAwarded > 0 && `+ ${tx.gemsAwarded} Gems`}
                      </div>
                      <div className="text-slate-400 text-xs font-semibold">
                        Paid: ${tx.pricePaid.toFixed(2)} {tx.currency}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Security & Compliance Footer */}
        <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            🔒 Google Play In-App Billing Compliance: Zero raw card details are accepted or stored in-game. Virtual currency is non-transferable.
          </p>
          <div className="flex items-center gap-3 text-slate-400 font-medium">
            <span>Server Catalog v2.4</span>
            <span>•</span>
            <span>Anti-Replay Active</span>
          </div>
        </div>
      </div>

      {/* Checkout Processing Overlay */}
      {purchasingPack && checkoutStep !== 'idle' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm font-['Rajdhani']">
          <div className="w-full max-w-sm bg-slate-950 border border-amber-500/60 rounded-3xl p-6 text-center space-y-5 shadow-[0_0_60px_rgba(245,158,11,0.4)] animate-in zoom-in-95">
            {checkoutStep === 'requesting' && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white font-['Orbitron']">AUTHORIZING PAYMENT</h3>
                  <p className="text-xs text-slate-400">
                    Connecting to {isSandbox ? 'Sandbox Payment Sheet' : 'Google Play Billing'}...
                  </p>
                </div>
              </>
            )}

            {checkoutStep === 'verifying_backend' && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white font-['Orbitron']">VERIFYING RECEIPT</h3>
                  <p className="text-xs text-slate-400">
                    Validating purchase token with trusted backend & anti-replay ledger...
                  </p>
                </div>
              </>
            )}

            {checkoutStep === 'success' && (
              <>
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white font-['Orbitron']">PAYMENT VERIFIED!</h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    +{purchasingPack.coinAmount.toLocaleString()} Coins credited to your account!
                  </p>
                  {purchasingPack.gemAmount > 0 && (
                    <p className="text-xs text-cyan-300 font-semibold">
                      +{purchasingPack.gemAmount.toLocaleString()} Gems added!
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 font-mono mt-2">
                    Order ID: {lastVerifiedTx?.orderId}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPurchasingPack(null);
                    setCheckoutStep('idle');
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-['Orbitron'] text-xs tracking-wider transition-all cursor-pointer"
                >
                  CONTINUE
                </button>
              </>
            )}

            {checkoutStep === 'error' && (
              <>
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white font-['Orbitron']">PAYMENT FAILED</h3>
                  <p className="text-xs text-rose-300">{errorMessage}</p>
                </div>
                <button
                  onClick={() => {
                    setPurchasingPack(null);
                    setCheckoutStep('idle');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-bold font-['Orbitron'] text-xs tracking-wider transition-all cursor-pointer"
                >
                  DISMISS
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
