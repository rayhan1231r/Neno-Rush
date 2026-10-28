/**
 * NEON RUSH - Pure Game Rules, Math & Anti-Cheat Logic
 */

import { CoinPack, Mission, PlayerProfile, PurchaseTransaction } from '../types/game';

export const LANE_WIDTH = 2.6;
export const TOTAL_LANES = 3; // -1 (Left), 0 (Center), 1 (Right)
export const LANE_COORDINATES = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH,
} as const;

export const DEFAULT_COIN_PACKS: CoinPack[] = [
  {
    id: 'pack_starter',
    sku: 'neon_rush_coins_starter_1000',
    name: 'Starter Pack',
    coinAmount: 1000,
    gemAmount: 10,
    bonusPercentage: 0,
    priceUsd: 0.99,
    formattedPrice: '$0.99',
    icon: '⚡',
  },
  {
    id: 'pack_runner',
    sku: 'neon_rush_coins_runner_5000',
    name: 'Runner Pack',
    coinAmount: 5000,
    gemAmount: 60,
    bonusPercentage: 10,
    priceUsd: 4.99,
    formattedPrice: '$4.99',
    icon: '🔥',
    popular: true,
  },
  {
    id: 'pack_pro',
    sku: 'neon_rush_coins_pro_12000',
    name: 'Pro Pack',
    coinAmount: 12000,
    gemAmount: 150,
    bonusPercentage: 20,
    priceUsd: 9.99,
    formattedPrice: '$9.99',
    featured: true,
    badge: 'POPULAR',
    icon: '💎',
  },
  {
    id: 'pack_champion',
    sku: 'neon_rush_coins_champion_30000',
    name: 'Champion Pack',
    coinAmount: 30000,
    gemAmount: 400,
    bonusPercentage: 35,
    priceUsd: 19.99,
    formattedPrice: '$19.99',
    icon: '🏆',
  },
  {
    id: 'pack_legend',
    sku: 'neon_rush_coins_legend_75000',
    name: 'Legend Pack',
    coinAmount: 75000,
    gemAmount: 1100,
    bonusPercentage: 50,
    priceUsd: 49.99,
    formattedPrice: '$49.99',
    icon: '👑',
  },
  {
    id: 'pack_ultimate',
    sku: 'neon_rush_coins_ultimate_150000',
    name: 'Ultimate Pack',
    coinAmount: 150000,
    gemAmount: 2500,
    bonusPercentage: 80,
    priceUsd: 99.99,
    formattedPrice: '$99.99',
    bestValue: true,
    badge: 'BEST VALUE',
    icon: '🚀',
  },
];

/**
 * Calculates lane target X coordinate from lane index (-1, 0, 1)
 */
export function getLaneX(laneIndex: number): number {
  const clamped = Math.max(-1, Math.min(1, Math.round(laneIndex)));
  return clamped * LANE_WIDTH;
}

/**
 * Clamps lane switch index
 */
export function clampLane(currentLane: number, delta: number): -1 | 0 | 1 {
  const next = currentLane + delta;
  if (next < -1) return -1;
  if (next > 1) return 1;
  return next as -1 | 0 | 1;
}

/**
 * Calculate instantaneous and continuous run score
 */
export function calculateRunScore(
  distanceMeters: number,
  coinsCollected: number,
  baseMultiplier: number = 1,
  characterMultiplierBonus: number = 0,
  hasDoubleMultiplier: boolean = false
): number {
  const effectiveMultiplier = (baseMultiplier + characterMultiplierBonus) * (hasDoubleMultiplier ? 2 : 1);
  const distancePoints = Math.floor(distanceMeters * effectiveMultiplier);
  const coinPoints = Math.floor(coinsCollected * 10 * effectiveMultiplier);
  return Math.max(0, distancePoints + coinPoints);
}

/**
 * Safe currency crediting with integer guarantee and no negative balances
 */
export function applyCurrencyUpdate(
  currentCoins: number,
  currentGems: number,
  deltaCoins: number,
  deltaGems: number
): { coins: number; gems: number; success: boolean } {
  const safeDeltaCoins = Math.trunc(deltaCoins);
  const safeDeltaGems = Math.trunc(deltaGems);

  const nextCoins = currentCoins + safeDeltaCoins;
  const nextGems = currentGems + safeDeltaGems;

  if (nextCoins < 0 || nextGems < 0) {
    return {
      coins: currentCoins,
      gems: currentGems,
      success: false,
    };
  }

  return {
    coins: nextCoins,
    gems: nextGems,
    success: true,
  };
}

/**
 * Validates purchase token idempotency and server catalog match
 */
export function verifyPurchaseRequest(
  productId: string,
  purchaseToken: string,
  catalog: CoinPack[] = DEFAULT_COIN_PACKS,
  processedTokenHistory: string[] = []
): {
  valid: boolean;
  pack?: CoinPack;
  errorCode?: 'CATALOG_NOT_FOUND' | 'TOKEN_ALREADY_PROCESSED' | 'INVALID_TOKEN';
} {
  if (!purchaseToken || purchaseToken.trim().length < 8) {
    return { valid: false, errorCode: 'INVALID_TOKEN' };
  }

  if (processedTokenHistory.includes(purchaseToken)) {
    return { valid: false, errorCode: 'TOKEN_ALREADY_PROCESSED' };
  }

  const pack = catalog.find((p) => p.id === productId || p.sku === productId);
  if (!pack) {
    return { valid: false, errorCode: 'CATALOG_NOT_FOUND' };
  }

  return { valid: true, pack };
}

/**
 * Anti-cheat validation for submitted run score
 * Checks that the score does not exceed physical game limits for given distance & coins
 */
export function validateRunIntegrity(
  score: number,
  distance: number,
  coinsCollected: number,
  elapsedSeconds: number
): { isLegitimate: boolean; reason?: string } {
  if (distance < 0 || coinsCollected < 0 || score < 0 || elapsedSeconds <= 0) {
    return { isLegitimate: false, reason: 'Negative metrics provided' };
  }

  // Speed check: maximum theoretical speed is ~40 m/s in hyper boost
  const avgSpeed = distance / elapsedSeconds;
  if (avgSpeed > 50) {
    return { isLegitimate: false, reason: 'Speed exceeds maximum physical limit' };
  }

  // Coin density check: maximum 3 coins per meter
  if (coinsCollected > Math.max(10, distance * 2.5)) {
    return { isLegitimate: false, reason: 'Coin collection density is unfeasible' };
  }

  // Score upper bound check with max 10x multiplier
  const maxPossibleScore = calculateRunScore(distance, coinsCollected, 10, 2, true);
  if (score > maxPossibleScore * 1.25) {
    return { isLegitimate: false, reason: 'Score exceeds theoretical bounds for run length' };
  }

  return { isLegitimate: true };
}

/**
 * Progresses missions based on run stats
 */
export function updateMissionsProgress(
  missions: Mission[],
  stats: {
    distance: number;
    coins: number;
    jumps: number;
    slides: number;
    powerups: number;
    score: number;
  }
): { updatedMissions: Mission[]; newCompletedCount: number } {
  let newCompletedCount = 0;

  const updatedMissions = missions.map((mission) => {
    if (mission.completed) return mission;

    let delta = 0;
    switch (mission.metric) {
      case 'distance':
        delta = stats.distance;
        break;
      case 'coins':
        delta = stats.coins;
        break;
      case 'jumps':
        delta = stats.jumps;
        break;
      case 'slides':
        delta = stats.slides;
        break;
      case 'powerups':
        delta = stats.powerups;
        break;
      case 'score':
        delta = stats.score;
        break;
    }

    const nextValue = Math.min(mission.targetValue, mission.currentValue + delta);
    const completed = nextValue >= mission.targetValue;
    if (completed && !mission.completed) {
      newCompletedCount++;
    }

    return {
      ...mission,
      currentValue: nextValue,
      completed,
    };
  });

  return { updatedMissions, newCompletedCount };
}
