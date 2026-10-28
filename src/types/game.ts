/**
 * NEON RUSH - Core Game Types and Interfaces
 */

export type CharacterRarity = 'starter' | 'street' | 'neon' | 'robot' | 'ninja' | 'space' | 'legendary' | 'special';
export type SkateboardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface CharacterItem {
  id: string;
  name: string;
  title: string;
  rarity: CharacterRarity;
  costType: 'free' | 'coins' | 'gems';
  price: number;
  description: string;
  perkDescription: string;
  multiplierBonus: number;
  unlocked: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  styleType: 'runner' | 'cyber' | 'ninja' | 'robot' | 'space' | 'chrono' | 'street' | 'empress';
}

export interface SkateboardItem {
  id: string;
  name: string;
  rarity: SkateboardRarity;
  costType: 'coins' | 'gems';
  price: number;
  description: string;
  shieldDurationSec: number;
  jumpMultiplier: number;
  unlocked: boolean;
  colors: {
    deck: string;
    stripe: string;
    wheels: string;
    trailGlow: string;
  };
}

export interface CoinPack {
  id: string;
  sku: string;
  name: string;
  coinAmount: number;
  gemAmount: number;
  bonusPercentage: number;
  priceUsd: number;
  formattedPrice: string;
  featured?: boolean;
  bestValue?: boolean;
  popular?: boolean;
  icon: string;
  badge?: string;
}

export interface PurchaseTransaction {
  transactionId: string;
  orderId: string;
  productId: string;
  productName: string;
  coinsAwarded: number;
  gemsAwarded: number;
  pricePaid: number;
  currency: string;
  provider: 'google_play' | 'sandbox_simulated';
  timestamp: number;
  status: 'verified' | 'pending' | 'refunded' | 'revoked';
  signatureToken?: string;
  purchaseToken: string;
}

export interface Mission {
  id: string;
  type: 'daily' | 'weekly' | 'achievement';
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  rewardType: 'coins' | 'gems';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  metric: 'distance' | 'coins' | 'jumps' | 'slides' | 'powerups' | 'score';
}

export interface DailyReward {
  day: number;
  rewardType: 'coins' | 'gems';
  amount: number;
  claimed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  characterId: string;
  score: number;
  distance: number;
  coinsCollected: number;
  timestamp: number;
  isCurrentUser?: boolean;
}

export interface PlayerProfile {
  userId: string;
  username: string;
  avatarSeed: string;
  coins: number;
  gems: number;
  highScore: number;
  highestDistance: number;
  lifetimeCoins: number;
  runsPlayed: number;
  selectedCharacterId: string;
  selectedSkateboardId: string;
  unlockedCharacterIds: string[];
  unlockedSkateboardIds: string[];
  lastLoginDate: string;
  loginStreak: number;
  claimedDailyRewards: number[];
  completedMissionIds: string[];
  claimedMissionIds: string[];
  isGuest: boolean;
  email?: string;
  createdAt: number;
  lastSyncedAt: number;
}

export type PowerUpType = 'magnet' | 'multiplier2x' | 'skateboard' | 'neondash';

export interface ActivePowerUp {
  type: PowerUpType;
  durationTotal: number;
  durationRemaining: number;
}

export interface RunStats {
  score: number;
  distance: number;
  coinsCollected: number;
  multiplier: number;
  skateboardsUsed: number;
  jumpCount: number;
  slideCount: number;
  powerUpsCollected: number;
  hitCount: number;
}
