/**
 * NEON RUSH - Core Game Types and Interfaces
 * Matches master reference design with 18 characters (A-Z), 6 skateboards,
 * 6 in-game environments, and 6 power-ups.
 */

export type CharacterRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type SkateboardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type EnvironmentType = 'city' | 'beach' | 'snow' | 'desert' | 'night_city' | 'jungle';

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
  avatarIcon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  styleType: 'runner' | 'cyber' | 'ninja' | 'robot' | 'space' | 'dino' | 'ice' | 'alien' | 'royal' | 'tech';
}

export interface SkateboardItem {
  id: string;
  name: string;
  rarity: SkateboardRarity;
  costType: 'free' | 'coins' | 'gems';
  price: number;
  description: string;
  shieldDurationSec: number;
  jumpMultiplier: number;
  speedBonusPct: number;
  unlocked: boolean;
  colors: {
    deck: string;
    stripe: string;
    wheels: string;
    trailGlow: string;
  };
}

export interface EnvironmentInfo {
  id: EnvironmentType;
  name: string;
  subtitle: string;
  skyColor: string;
  fogColor: string;
  roadColor: string;
  barrierColor: string;
  themeAccent: string;
  icon: string;
}

export interface CoinPack {
  id: string;
  sku: string;
  name: string;
  coinAmount: number;
  bonusAmount: number;
  gemAmount: number;
  priceUsd: number;
  formattedPrice: string;
  featured?: boolean;
  bestValue?: boolean;
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
  purchaseToken: string;
}

export interface Mission {
  id: string;
  type: 'daily' | 'achievement';
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  rewardType: 'coins' | 'gems';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  metric: 'distance' | 'coins' | 'jumps' | 'slides' | 'powerups' | 'score' | 'runs';
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
  characterName?: string;
  score: number;
  distance: number;
  coinsCollected: number;
  timestamp: number;
  isCurrentUser?: boolean;
}

export interface PlayerProfile {
  userId: string;
  username: string;
  tagId?: string; // e.g. "NR123456"
  avatarSeed: string;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  coins: number;
  gems: number;
  highScore: number;
  highestDistance: number;
  lifetimeCoins: number;
  runsPlayed: number;
  missionsCompletedCount?: number;
  selectedCharacterId: string;
  selectedSkateboardId: string;
  selectedEnvironment?: EnvironmentType;
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

export type PowerUpType = 'magnet' | 'shield' | 'multiplier2x' | 'superjump' | 'coinboost' | 'skateboard';

export interface ActivePowerUp {
  type: PowerUpType;
  name: string;
  durationTotal: number;
  durationRemaining: number;
  icon: string;
  color: string;
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
