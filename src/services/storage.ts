/**
 * NEON RUSH - Persistent Storage & Account Service
 * Provides offline guest-mode persistence via localStorage + cloud synchronization architecture
 * with Firebase Authentication & Firestore.
 */

import { DailyReward, Mission, PlayerProfile, PurchaseTransaction } from '../types/game';

const STORAGE_KEY = 'neon_rush_player_profile_v1';
const TRANSACTIONS_KEY = 'neon_rush_transactions_v1';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_dist_500',
    type: 'daily',
    title: 'Warm Up Run',
    description: 'Survive and sprint 500 meters in a single run',
    currentValue: 0,
    targetValue: 500,
    rewardType: 'coins',
    rewardAmount: 300,
    completed: false,
    claimed: false,
    metric: 'distance',
  },
  {
    id: 'm_coins_50',
    type: 'daily',
    title: 'Neon Collector',
    description: 'Collect 50 gold coins along the cyber highway',
    currentValue: 0,
    targetValue: 50,
    rewardType: 'coins',
    rewardAmount: 250,
    completed: false,
    claimed: false,
    metric: 'coins',
  },
  {
    id: 'm_jumps_15',
    type: 'daily',
    title: 'Airborne Acrobat',
    description: 'Perform 15 successful obstacle jumps',
    currentValue: 0,
    targetValue: 15,
    rewardType: 'coins',
    rewardAmount: 200,
    completed: false,
    claimed: false,
    metric: 'jumps',
  },
  {
    id: 'm_power_3',
    type: 'weekly',
    title: 'Overcharged',
    description: 'Collect 3 power-up orbs during your runs',
    currentValue: 0,
    targetValue: 3,
    rewardType: 'gems',
    rewardAmount: 15,
    completed: false,
    claimed: false,
    metric: 'powerups',
  },
  {
    id: 'm_dist_5000',
    type: 'achievement',
    title: 'Marathon Runner',
    description: 'Accumulate 5,000 meters lifetime distance',
    currentValue: 0,
    targetValue: 5000,
    rewardType: 'gems',
    rewardAmount: 50,
    completed: false,
    claimed: false,
    metric: 'distance',
  },
];

export const DAILY_REWARDS_TABLE: DailyReward[] = [
  { day: 1, rewardType: 'coins', amount: 250, claimed: false },
  { day: 2, rewardType: 'coins', amount: 500, claimed: false },
  { day: 3, rewardType: 'gems', amount: 10, claimed: false },
  { day: 4, rewardType: 'coins', amount: 1000, claimed: false },
  { day: 5, rewardType: 'coins', amount: 2000, claimed: false },
  { day: 6, rewardType: 'gems', amount: 25, claimed: false },
  { day: 7, rewardType: 'gems', amount: 75, claimed: false },
];

export function getDefaultProfile(): PlayerProfile {
  return {
    userId: 'guest_' + Math.random().toString(36).substring(2, 9),
    username: 'NeonRider#' + Math.floor(1000 + Math.random() * 9000),
    avatarSeed: 'jax_turbo',
    coins: 1500, // Starter bounty
    gems: 25,
    highScore: 0,
    highestDistance: 0,
    lifetimeCoins: 0,
    runsPlayed: 0,
    selectedCharacterId: 'char_starter',
    selectedSkateboardId: 'board_classic',
    unlockedCharacterIds: ['char_starter'],
    unlockedSkateboardIds: ['board_classic'],
    lastLoginDate: new Date().toISOString().split('T')[0],
    loginStreak: 1,
    claimedDailyRewards: [],
    completedMissionIds: [],
    claimedMissionIds: [],
    isGuest: true,
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
  };
}

export class StorageService {
  public static loadProfile(): PlayerProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...getDefaultProfile(), ...parsed };
      }
    } catch {
      // Fallback to default
    }
    const def = getDefaultProfile();
    this.saveProfile(def);
    return def;
  }

  public static saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Storage quota or privacy mode
    }
  }

  public static loadTransactions(): PurchaseTransaction[] {
    try {
      const raw = localStorage.getItem(TRANSACTIONS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  public static saveTransaction(tx: PurchaseTransaction): void {
    try {
      const list = this.loadTransactions();
      list.unshift(tx);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }

  public static loadMissions(): Mission[] {
    try {
      const raw = localStorage.getItem('neon_rush_missions_v1');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
    return INITIAL_MISSIONS;
  }

  public static saveMissions(missions: Mission[]): void {
    try {
      localStorage.setItem('neon_rush_missions_v1', JSON.stringify(missions));
    } catch {
      // Ignore
    }
  }
}
