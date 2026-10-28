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
    id: 'm_daily_runner',
    type: 'daily',
    title: 'Daily Runner',
    description: 'Run 5,000 meters across any environment',
    currentValue: 2460,
    targetValue: 5000,
    rewardType: 'coins',
    rewardAmount: 500,
    completed: false,
    claimed: false,
    metric: 'distance',
  },
  {
    id: 'm_first_run',
    type: 'daily',
    title: 'First Run',
    description: 'Complete 1 run session',
    currentValue: 1,
    targetValue: 1,
    rewardType: 'coins',
    rewardAmount: 100,
    completed: true,
    claimed: false,
    metric: 'runs',
  },
  {
    id: 'm_collect_1000',
    type: 'daily',
    title: 'Collect 1,000 Coins',
    description: 'Collect 1,000 coins on the tracks',
    currentValue: 1000,
    targetValue: 1000,
    rewardType: 'coins',
    rewardAmount: 400,
    completed: true,
    claimed: false,
    metric: 'coins',
  },
  {
    id: 'm_high_score',
    type: 'achievement',
    title: 'High Score Champion',
    description: 'Reach 50,000 score in an endless run',
    currentValue: 32560,
    targetValue: 50000,
    rewardType: 'coins',
    rewardAmount: 600,
    completed: false,
    claimed: false,
    metric: 'score',
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
    userId: 'NR123456',
    username: 'Rifat',
    avatarSeed: 'char_aiden',
    level: 12,
    xp: 2450,
    xpToNextLevel: 5000,
    coins: 12560,
    gems: 245,
    highScore: 482600,
    highestDistance: 156200,
    lifetimeCoins: 12560,
    runsPlayed: 124,
    selectedCharacterId: 'char_aiden',
    selectedSkateboardId: 'board_classic',
    unlockedCharacterIds: [
      'char_aiden',
      'char_bella',
      'char_cipher',
      'char_dino',
      'char_echo',
      'char_frost',
      'char_gizmo',
      'char_jax',
    ],
    unlockedSkateboardIds: ['board_classic', 'board_neon_blade'],
    lastLoginDate: new Date().toISOString().split('T')[0],
    loginStreak: 3,
    claimedDailyRewards: [1, 2],
    completedMissionIds: ['m_first_run', 'm_collect_1000'],
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
