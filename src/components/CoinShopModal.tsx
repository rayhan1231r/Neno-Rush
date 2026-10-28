/**
 * NEON RUSH - Coin Shop (Google Play / Cards) & Item Unlock Store
 * 1-to-1 match with the "COIN SHOP (Google Play / Cards)" & "SHOP (Unlock Items)" panels:
 * - Coin Packs:
 *     - Starter Pack: 1,000 + 100 Bonus ($0.99)
 *     - Runner Pack: 5,000 + 500 Bonus ($4.99)
 *     - Pro Pack (Best Value): 12,000 + 1,500 Bonus ($9.99)
 *     - Champion Pack: 30,000 + 5,000 Bonus ($19.99)
 *     - Legend Pack: 75,000 + 12,500 Bonus ($49.99)
 *     - Ultimate Pack: 150,000 + 25,000 Bonus ($99.99)
 * - Item Unlocks:
 *     - Hana (Legendary): 120,000 Coins
 *     - Rex (Epic): 80,000 Coins
 *     - Luna (Legendary): 150,000 Coins
 *     - Pixel (Rare): 60,000 Coins
 * - Real Google Play Billing integration with trusted backend verification & Sandbox fallback
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
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { CoinPack, PlayerProfile, PurchaseTransaction } from '../types/game';
import { BillingService } from '../services/billing';
import { StorageService } from '../services/storage';
import { sound } from '../game/audio';

interface CoinShopModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onCoinsPurchased: (coins: number, gems: number) => void;
  onUnlockItem?: (type: 'char' | 'board', id: string, cost: number) => boolean;
}

export const CoinShopModal: React.FC<CoinShopModalProps> = ({
  profile,
  onClose,
  onCoinsPurchased,
  onUnlockItem,
}) => {
  const [activeTab, setActiveTab] = useState<'coin_packs' | 'unlock_items' | 'history'>('coin_packs');
  const [itemSubTab, setItemSubTab] = useState<'characters' | 'skateboards'>('characters');
  const [catalog, setCatalog] = useState<CoinPack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasingPack, setPurchasingPack] = useState<CoinPack | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<
    'idle' | 'requesting' | 'verifying_backend' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastVerifiedTx, setLastVerifiedTx] = useState<PurchaseTransaction | null>(null);
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [isSandbox] = useState<boolean>(BillingService.isSandbox());
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

    setTimeout(async () => {
      setCheckoutStep('verifying_backend');
      const result = await BillingService.initiatePurchase(pack, profile.userId);

      if (result.success && result.transaction) {
        setCheckoutStep('success');
        setLastVerifiedTx(result.transaction);
        sound.playPurchaseSuccess();
        onCoinsPurchased(pack.coinAmount + (pack.bonusAmount || 0), pack.gemAmount);
        setTransactions(StorageService.loadTransactions());
      } else {
        setCheckoutStep('error');
        setErrorMessage(result.errorMessage || 'Purchase authorization was declined or cancelled.');
      }
    }, 600);
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
  };

  // Direct Coin Unlock Items from reference sheet
  const unlockableCharacters = [
    { id: 'char_hana', name: 'Hana', rarity: 'Legendary', price: 120000, icon: '🥷' },
    { id: 'char_rex', name: 'Rex', rarity: 'Epic', price: 80000, icon: '🦖' },
    { id: 'char_luna', name: 'Luna', rarity: 'Legendary', price: 150000, icon: '🌙' },
    { id: 'char_pixel', name: 'Pixel', rarity: 'Rare', price: 60000, icon: '👾' },
  ];

  const unlockableBoards = [
    { id: 'board_neon_blade', name: 'Neon Blade', rarity: 'Rare', price: 25000, icon: '⚡' },
    { id: 'board_fire_storm', name: 'Fire Storm', rarity: 'Epic', price: 45000, icon: '🔥' },
    { id: 'board_galaxy_ride', name: 'Galaxy Ride', rarity: 'Epic', price: 60000, icon: '🌌' },
    { id: 'board_cyber_wave', name: 'Cyber Wave', rarity: 'Legendary', price: 90000, icon: '🌊' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm font-['Rajdhani']">
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-950 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col gap-4 overflow-hidden">
        {/* Header matching reference sheet */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] tracking-wide">
              {activeTab === 'coin_packs' ? 'COIN SHOP (Google Play / Cards)' : 'SHOP (Unlock Items)'}
            </h2>
            <div className="flex items-center gap-3 text-xs font-bold font-['Orbitron'] mt-1">
              <span className="text-amber-300">Your Coins: {profile.coins.toLocaleString()}</span>
              <span className="text-cyan-300">Your Gems: {profile.gems.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Shop"
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => {
              setActiveTab('coin_packs');
              sound.playClick();
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
              activeTab === 'coin_packs'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coin Packs
          </button>
          <button
            onClick={() => {
              setActiveTab('unlock_items');
              sound.playClick();
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-['Orbitron'] tracking-wider transition-all cursor-pointer ${
              activeTab === 'unlock_items'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unlock Items
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              sound.playClick();
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold font-['Orbitron'] transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* TAB 1: COIN PACKS (Google Play) matching reference sheet exactly */}
          {activeTab === 'coin_packs' && (
            <div className="space-y-2.5">
              {catalog.map((pack) => {
                const isBestValue = pack.bestValue || pack.sku === 'coin_pack_pro';
                return (
                  <div
                    key={pack.id}
                    className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isBestValue
                        ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Best Value Badge matching reference */}
                    {isBestValue && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] font-['Orbitron'] tracking-wider shadow-md">
                        Best Value
                      </span>
                    )}

                    {/* Pack Icon & Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-center justify-center text-2xl shadow-sm">
                        💰
                      </div>
                      <div>
                        <div className="text-sm font-black text-white font-['Orbitron']">
                          {pack.name}
                        </div>
                        <div className="text-xs font-bold text-amber-300 font-['Orbitron']">
                          {pack.coinAmount.toLocaleString()}
                          {pack.bonusAmount ? (
                            <span className="text-amber-400 ml-1 font-semibold">
                              + {pack.bonusAmount.toLocaleString()} (Bonus)
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Price Buy Button */}
                    <button
                      onClick={() => handleBuy(pack)}
                      disabled={checkoutStep === 'requesting' || checkoutStep === 'verifying_backend'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-['Orbitron'] text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {pack.formattedPrice}
                    </button>
                  </div>
                );
              })}

              {/* Footer Note matching reference sheet */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 pt-2 font-['Orbitron']">
                <span className="text-emerald-400">▶</span>
                <span>Secure purchase via Google Play</span>
              </div>
            </div>
          )}

          {/* TAB 2: UNLOCK ITEMS matching reference sheet */}
          {activeTab === 'unlock_items' && (
            <div className="space-y-3">
              {/* Characters | Skateboards Subtab */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setItemSubTab('characters')}
                  className={`px-4 py-1 rounded-xl text-xs font-bold font-['Orbitron'] ${
                    itemSubTab === 'characters'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Characters
                </button>
                <button
                  onClick={() => setItemSubTab('skateboards')}
                  className={`px-4 py-1 rounded-xl text-xs font-bold font-['Orbitron'] ${
                    itemSubTab === 'skateboards'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Skateboards
                </button>
              </div>

              {/* 2x2 Grid of Items matching reference */}
              <div className="grid grid-cols-2 gap-3">
                {(itemSubTab === 'characters' ? unlockableCharacters : unlockableBoards).map((item) => {
                  const isUnlocked =
                    itemSubTab === 'characters'
                      ? profile.unlockedCharacterIds.includes(item.id)
                      : profile.unlockedSkateboardIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-sm mb-2">
                        {item.icon}
                      </div>

                      <div className="text-xs font-black text-white font-['Orbitron']">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold uppercase">
                        {item.rarity}
                      </div>

                      <div className="text-xs font-black text-amber-300 font-['Orbitron'] my-1.5 flex items-center gap-1">
                        <span>¢</span>
                        <span>{item.price.toLocaleString()}</span>
                      </div>

                      {isUnlocked ? (
                        <div className="w-full py-1.5 rounded-xl bg-slate-800 text-[10px] font-bold text-slate-400 font-['Orbitron']">
                          Unlocked
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (profile.coins >= item.price) {
                              onCoinsPurchased(-item.price, 0);
                              sound.playPurchaseSuccess();
                            } else {
                              sound.playCrash();
                            }
                          }}
                          className="w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black font-['Orbitron'] text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION HISTORY & RESTORE */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 font-['Orbitron']">
                  GOOGLE PLAY TRANSACTIONS
                </span>
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 transition-all cursor-pointer"
                >
                  <RotateCcw className={`w-3 h-3 ${restoring ? 'animate-spin' : ''}`} />
                  <span>Restore</span>
                </button>
              </div>

              {restoreMessage && (
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs text-center font-bold">
                  {restoreMessage}
                </div>
              )}

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                  No previous transactions found on this device.
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.transactionId}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white font-['Orbitron']">
                          {tx.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Order: {tx.orderId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-300 font-bold font-['Orbitron']">
                          +{tx.coinsAwarded.toLocaleString()} Coins
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          VERIFIED
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Status Overlay During Checkout */}
        {checkoutStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              {checkoutStep === 'requesting' && (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
                  <h3 className="text-base font-bold text-white font-['Orbitron']">
                    Connecting to Google Play...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Preparing secure in-app purchase request
                  </p>
                </>
              )}
              {checkoutStep === 'verifying_backend' && (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
                  <h3 className="text-base font-bold text-white font-['Orbitron']">
                    Verifying with Backend...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Validating purchase token with trusted API server
                  </p>
                </>
              )}
              {checkoutStep === 'success' && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-300 font-['Orbitron']">
                    Purchase Successful!
                  </h3>
                  <p className="text-xs text-slate-300">
                    {purchasingPack?.name} verified and credited to your account.
                  </p>
                  <button
                    onClick={() => setCheckoutStep('idle')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-['Orbitron'] text-xs transition-all cursor-pointer"
                  >
                    CONTINUE
                  </button>
                </>
              )}
              {checkoutStep === 'error' && (
                <>
                  <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
                  <h3 className="text-base font-bold text-rose-300 font-['Orbitron']">
                    Purchase Failed
                  </h3>
                  <p className="text-xs text-slate-400">{errorMessage}</p>
                  <button
                    onClick={() => setCheckoutStep('idle')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-['Orbitron'] text-xs transition-all cursor-pointer"
                  >
                    CLOSE
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
