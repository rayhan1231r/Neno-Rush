/**
 * NEON RUSH - Pure Game Rules, Math & Anti-Cheat Logic
 * Matches master reference design specifications.
 */

import { CoinPack, EnvironmentInfo, EnvironmentType, Mission, PurchaseTransaction } from '../types/game';

export const LANE_WIDTH = 2.6;
export const TOTAL_LANES = 3; // -1 (Left), 0 (Center), 1 (Right)
export const LANE_COORDINATES = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH,
} as const;

export const ENVIRONMENTS: EnvironmentInfo[] = [
  {
    id: 'city',
    name: 'City',
    subtitle: 'Neon Sunset Metropolis',
    skyColor: '#0c0f24',
    fogColor: '#0a0d20',
    roadColor: '#12172a',
    barrierColor: '#06b6d4',
    themeAccent: '#38bdf8',
    icon: '🏙️',
  },
  {
    id: 'beach',
    name: 'Beach',
    subtitle: 'Tropical Coastline Highway',
    skyColor: '#0f2b38',
    fogColor: '#0b2430',
    roadColor: '#d97706',
    barrierColor: '#14b8a6',
    themeAccent: '#06b6d4',
    icon: '🏖️',
  },
  {
    id: 'snow',
    name: 'Snow',
    subtitle: 'Glacial Mountain Pass',
    skyColor: '#0a1628',
    fogColor: '#081220',
    roadColor: '#e0f2fe',
    barrierColor: '#38bdf8',
    themeAccent: '#7dd3fc',
    icon: '❄️',
  },
  {
    id: 'desert',
    name: 'Desert',
    subtitle: 'Canyon Dune Canyon',
    skyColor: '#27170a',
    fogColor: '#201208',
    roadColor: '#78350f',
    barrierColor: '#f59e0b',
    themeAccent: '#fbbf24',
    icon: '🏜️',
  },
  {
    id: 'night_city',
    name: 'Night City',
    subtitle: 'Cyberpunk Neon Midnight',
    skyColor: '#090514',
    fogColor: '#080412',
    roadColor: '#0f0a1c',
    barrierColor: '#a855f7',
    themeAccent: '#ec4899',
    icon: '🌃',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    subtitle: 'Ancient Canopy Ruins',
    skyColor: '#051b14',
    fogColor: '#041610',
    roadColor: '#064e3b',
    barrierColor: '#10b981',
    themeAccent: '#34d399',
    icon: '🌴',
  },
];

export const DEFAULT_COIN_PACKS: CoinPack[] = [
  {
    id: 'pack_starter',
    sku: 'neon_rush_coins_starter_1000',
    name: 'Starter Pack',
    coinAmount: 1000,
    bonusAmount: 100,
    gemAmount: 10,
    priceUsd: 0.99,
    formattedPrice: '$0.99',
  },
  {
    id: 'pack_runner',
    sku: 'neon_rush_coins_runner_5000',
    name: 'Runner Pack',
    coinAmount: 5000,
    bonusAmount: 500,
    gemAmount: 60,
    priceUsd: 4.99,
    formattedPrice: '$4.99',
  },
  {
    id: 'pack_pro',
    sku: 'neon_rush_coins_pro_12000',
    name: 'Pro Pack',
    coinAmount: 12000,
    bonusAmount: 1500,
    gemAmount: 150,
    priceUsd: 9.99,
    formattedPrice: '$9.99',
    featured: true,
    bestValue: true,
    badge: 'Best Value',
  },
  {
    id: 'pack_champion',
    sku: 'neon_rush_coins_champion_30000',
    name: 'Champion Pack',
    coinAmount: 30000,
    bonusAmount: 5000,
    gemAmount: 400,
    priceUsd: 19.99,
    formattedPrice: '$19.99',
  },
  {
    id: 'pack_legend',
    sku: 'neon_rush_coins_legend_75000',
    name: 'Legend Pack',
    coinAmount: 75000,
    bonusAmount: 12500,
    gemAmount: 1100,
    priceUsd: 49.99,
    formattedPrice: '$49.99',
  },
  {
    id: 'pack_ultimate',
    sku: 'neon_rush_coins_ultimate_150000',
    name: 'Ultimate Pack',
    coinAmount: 150000,
    bonusAmount: 25000,
    gemAmount: 2500,
    priceUsd: 99.99,
    formattedPrice: '$99.99',
  },
];

export function getLaneX(laneIndex: number): number {
  const clamped = Math.max(-1, Math.min(1, Math.round(laneIndex)));
  return clamped * LANE_WIDTH;
}

export function clampLane(currentLane: number, delta: number): -1 | 0 | 1 {
  const next = currentLane + delta;
  if (next < -1) return -1;
  if (next > 1) return 1;
  return next as -1 | 0 | 1;
}

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

export function validateRunIntegrity(
  score: number,
  distance: number,
  coinsCollected: number,
  elapsedSeconds: number
): { isLegitimate: boolean; reason?: string } {
  if (distance < 0 || coinsCollected < 0 || score < 0 || elapsedSeconds <= 0) {
    return { isLegitimate: false, reason: 'Negative metrics provided' };
  }

  const avgSpeed = distance / elapsedSeconds;
  if (avgSpeed > 55) {
    return { isLegitimate: false, reason: 'Speed exceeds maximum physical limit' };
  }

  if (coinsCollected > Math.max(10, distance * 3.5)) {
    return { isLegitimate: false, reason: 'Coin collection density is unfeasible' };
  }

  const maxPossibleScore = calculateRunScore(distance, coinsCollected, 10, 2, true);
  if (score > maxPossibleScore * 1.5) {
    return { isLegitimate: false, reason: 'Score exceeds theoretical bounds for run length' };
  }

  return { isLegitimate: true };
}

export function updateMissionsProgress(
  missions: Mission[],
  stats: {
    distance: number;
    coins: number;
    jumps: number;
    slides: number;
    powerups: number;
    score: number;
    runs?: number;
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
      case 'runs':
        delta = stats.runs || 1;
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
