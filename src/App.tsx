/**
 * NEON RUSH - Complete 3D Endless Runner Application
 * Master Game Shell orchestrator. Mounts isolated Three.js WebGL viewport,
 * connects responsive HUD and modals, integrates persistent storage,
 * and handles anti-cheat verified leaderboards and Google Play Billing.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NeonRushEngine } from './game/NeonRushEngine';
import { sound } from './game/audio';
import { StorageService } from './services/storage';
import { updateMissionsProgress, applyCurrencyUpdate } from './game/rules';
import { CHARACTERS, SKATEBOARDS } from './game/models';
import {
  ActivePowerUp,
  CharacterItem,
  Mission,
  PlayerProfile,
  RunStats,
  SkateboardItem,
} from './types/game';

import { FirebaseService, testFirestoreConnection } from './services/firebase';

// HUD & Modals
import { TitleScreen } from './components/TitleScreen';
import { GameplayHUD } from './components/GameplayHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { CoinShopModal } from './components/CoinShopModal';
import { CharacterShopModal } from './components/CharacterShopModal';
import { SkateboardShopModal } from './components/SkateboardShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { MissionsModal } from './components/MissionsModal';
import { AccountModal } from './components/AccountModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<NeonRushEngine | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<'ready' | 'running' | 'paused' | 'gameover'>('ready');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Player Profile & Progress
  const [profile, setProfile] = useState<PlayerProfile>(() => StorageService.loadProfile());
  const [missions, setMissions] = useState<Mission[]>(() => StorageService.loadMissions());

  // Real-time HUD stats
  const [hudScore, setHudScore] = useState<number>(0);
  const [hudDistance, setHudDistance] = useState<number>(0);
  const [hudCoins, setHudCoins] = useState<number>(0);
  const [hudMultiplier, setHudMultiplier] = useState<number>(1);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);

  // End of run snapshot
  const [lastRunStats, setLastRunStats] = useState<RunStats | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Modals Visibility
  const [activeModal, setActiveModal] = useState<
    'none' | 'shop' | 'characters' | 'skateboards' | 'leaderboard' | 'missions' | 'account' | 'settings' | 'admin'
  >('none');

  // Handle Score Update from Engine
  const handleScoreUpdate = useCallback(
    (score: number, distance: number, coins: number, multiplier: number) => {
      setHudScore(score);
      setHudDistance(distance);
      setHudCoins(coins);
      setHudMultiplier(multiplier);
    },
    []
  );

  // Handle Power-Up Timers from Engine
  const handlePowerUpUpdate = useCallback((powerUps: ActivePowerUp[]) => {
    setActivePowerUps([...powerUps]);
  }, []);

  // Handle Shield Hit
  const handleHit = useCallback((remainingShield: number) => {
    // Visual or vibration cue
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(
    async (stats: RunStats) => {
      setGameState('gameover');
      document.body.dataset.state = 'gameover';
      setLastRunStats(stats);

      const isNewBest = stats.score > profile.highScore;
      setIsNewHighScore(isNewBest);

      // Progress Missions
      const { updatedMissions } = updateMissionsProgress(missions, {
        distance: stats.distance,
        coins: stats.coinsCollected,
        jumps: stats.jumpCount,
        slides: stats.slideCount,
        powerups: stats.powerUpsCollected,
        score: stats.score,
      });
      setMissions(updatedMissions);
      StorageService.saveMissions(updatedMissions);

      // Update Player Profile
      const updatedProfile: PlayerProfile = {
        ...profile,
        coins: profile.coins + stats.coinsCollected,
        lifetimeCoins: profile.lifetimeCoins + stats.coinsCollected,
        highScore: Math.max(profile.highScore, stats.score),
        highestDistance: Math.max(profile.highestDistance, stats.distance),
        runsPlayed: profile.runsPlayed + 1,
        lastSyncedAt: Date.now(),
      };
      setProfile(updatedProfile);
      StorageService.saveProfile(updatedProfile);

      // Cloud Firestore sync if authenticated
      if (!profile.isGuest) {
        FirebaseService.syncProfileToCloud(updatedProfile);
        FirebaseService.syncMissionsToCloud(updatedMissions);
      }

      // Submit Score to Server Anti-Cheat Leaderboard
      try {
        await fetch('/api/leaderboard/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: stats.score,
            distance: stats.distance,
            coins: stats.coinsCollected,
            durationSec: Math.max(1, stats.distance / 25),
            userId: profile.userId,
            username: profile.username,
            characterId: profile.selectedCharacterId,
          }),
        });
      } catch {
        // Offline mode fallback
      }
    },
    [profile, missions]
  );

  // Initialize Three.js Engine Once
  useEffect(() => {
    if (!canvasMountRef.current || engineRef.current) return;

    const char = CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0];
    const engine = new NeonRushEngine(
      canvasMountRef.current,
      {
        onScoreUpdate: handleScoreUpdate,
        onPowerUpUpdate: handlePowerUpUpdate,
        onHit: handleHit,
        onGameOver: handleGameOver,
        onStateChange: (newState) => setGameState(newState),
      },
      profile.selectedCharacterId,
      profile.selectedSkateboardId,
      char.multiplierBonus
    );

    engineRef.current = engine;
    document.body.dataset.state = 'title';

    // Autostart support via ?autostart=1 query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      setTimeout(() => {
        engine.startRun();
      }, 100);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Listen for Firebase Auth State Changes & Sync Cloud Profile
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = FirebaseService.onAuthState(async (user) => {
      if (user) {
        const cloudData = await FirebaseService.loadCloudProfile(user.uid);
        if (cloudData && cloudData.highScore !== undefined) {
          setProfile((prev) => {
            const merged: PlayerProfile = {
              ...prev,
              ...cloudData,
              userId: user.uid,
              email: user.email || prev.email,
              isGuest: false,
              lastSyncedAt: Date.now(),
            };
            StorageService.saveProfile(merged);
            return merged;
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Update Engine when equipped character or skateboard changes
  const handleEquipCharacter = (charId: string) => {
    const char = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];
    const updated = { ...profile, selectedCharacterId: charId };
    setProfile(updated);
    StorageService.saveProfile(updated);

    if (engineRef.current) {
      engineRef.current.updateEquippedItems(charId, profile.selectedSkateboardId, char.multiplierBonus);
    }
  };

  const handleEquipSkateboard = (boardId: string) => {
    const char = CHARACTERS.find((c) => c.id === profile.selectedCharacterId) || CHARACTERS[0];
    const updated = { ...profile, selectedSkateboardId: boardId };
    setProfile(updated);
    StorageService.saveProfile(updated);

    if (engineRef.current) {
      engineRef.current.updateEquippedItems(profile.selectedCharacterId, boardId, char.multiplierBonus);
    }
  };

  const handleUnlockCharacter = (char: CharacterItem): boolean => {
    const price = char.price;
    if (char.costType === 'gems') {
      if (profile.gems < price) return false;
      const res = applyCurrencyUpdate(profile.coins, profile.gems, 0, -price);
      if (!res.success) return false;
      const updated: PlayerProfile = {
        ...profile,
        gems: res.gems,
        unlockedCharacterIds: [...profile.unlockedCharacterIds, char.id],
      };
      setProfile(updated);
      StorageService.saveProfile(updated);
      return true;
    } else {
      if (profile.coins < price) return false;
      const res = applyCurrencyUpdate(profile.coins, profile.gems, -price, 0);
      if (!res.success) return false;
      const updated: PlayerProfile = {
        ...profile,
        coins: res.coins,
        unlockedCharacterIds: [...profile.unlockedCharacterIds, char.id],
      };
      setProfile(updated);
      StorageService.saveProfile(updated);
      return true;
    }
  };

  const handleUnlockSkateboard = (board: SkateboardItem): boolean => {
    const price = board.price;
    if (board.costType === 'gems') {
      if (profile.gems < price) return false;
      const res = applyCurrencyUpdate(profile.coins, profile.gems, 0, -price);
      if (!res.success) return false;
      const updated: PlayerProfile = {
        ...profile,
        gems: res.gems,
        unlockedSkateboardIds: [...profile.unlockedSkateboardIds, board.id],
      };
      setProfile(updated);
      StorageService.saveProfile(updated);
      return true;
    } else {
      if (profile.coins < price) return false;
      const res = applyCurrencyUpdate(profile.coins, profile.gems, -price, 0);
      if (!res.success) return false;
      const updated: PlayerProfile = {
        ...profile,
        coins: res.coins,
        unlockedSkateboardIds: [...profile.unlockedSkateboardIds, board.id],
      };
      setProfile(updated);
      StorageService.saveProfile(updated);
      return true;
    }
  };

  // Currency Additions from Real Purchases or Admin Tests
  const handleCoinsPurchased = (coins: number, gems: number) => {
    const res = applyCurrencyUpdate(profile.coins, profile.gems, coins, gems);
    if (res.success) {
      const updated = {
        ...profile,
        coins: res.coins,
        gems: res.gems,
        lifetimeCoins: profile.lifetimeCoins + coins,
      };
      setProfile(updated);
      StorageService.saveProfile(updated);
    }
  };

  // Mission Claims
  const handleClaimMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.claimed) return;

    const deltaCoins = mission.rewardType === 'coins' ? mission.rewardAmount : 0;
    const deltaGems = mission.rewardType === 'gems' ? mission.rewardAmount : 0;
    const res = applyCurrencyUpdate(profile.coins, profile.gems, deltaCoins, deltaGems);

    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );
    setMissions(updatedMissions);
    StorageService.saveMissions(updatedMissions);

    const updatedProfile = {
      ...profile,
      coins: res.coins,
      gems: res.gems,
      claimedMissionIds: [...profile.claimedMissionIds, missionId],
    };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
  };

  // Daily Streak Claim
  const handleClaimDailyReward = (day: number) => {
    if (profile.claimedDailyRewards.includes(day)) return;

    const dayReward = [
      { day: 1, type: 'coins', amount: 250 },
      { day: 2, type: 'coins', amount: 500 },
      { day: 3, type: 'gems', amount: 10 },
      { day: 4, type: 'coins', amount: 1000 },
      { day: 5, type: 'coins', amount: 2000 },
      { day: 6, type: 'gems', amount: 25 },
      { day: 7, type: 'gems', amount: 75 },
    ].find((d) => d.day === day);

    if (!dayReward) return;

    const deltaCoins = dayReward.type === 'coins' ? dayReward.amount : 0;
    const deltaGems = dayReward.type === 'gems' ? dayReward.amount : 0;
    const res = applyCurrencyUpdate(profile.coins, profile.gems, deltaCoins, deltaGems);

    const updated = {
      ...profile,
      coins: res.coins,
      gems: res.gems,
      claimedDailyRewards: [...profile.claimedDailyRewards, day],
    };
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startRun();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartRun();
      engineRef.current.startRun();
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.restartRun();
    }
  };

  const handleActivateSkateboard = () => {
    if (engineRef.current) {
      engineRef.current.activatePowerUp('skateboard', 12);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white select-none">
      {/* Isolated Three.js WebGL Canvas Mount */}
      <div
        ref={canvasMountRef}
        data-testid="threejs-canvas-viewport"
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Screen 1: Title Screen / Main Menu */}
      {gameState === 'ready' && activeModal === 'none' && (
        <TitleScreen
          profile={profile}
          isMuted={isMuted}
          onStartGame={handleStartGame}
          onToggleMute={handleToggleMute}
          onOpenCharacters={() => setActiveModal('characters')}
          onOpenSkateboards={() => setActiveModal('skateboards')}
          onOpenShop={() => setActiveModal('shop')}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenAccount={() => setActiveModal('account')}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* Screen 2: In-Game Active HUD */}
      {gameState === 'running' && (
        <GameplayHUD
          score={hudScore}
          distance={hudDistance}
          coins={hudCoins}
          multiplier={hudMultiplier}
          powerUps={activePowerUps}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={() => engineRef.current?.pauseRun()}
          onActivateSkateboard={handleActivateSkateboard}
        />
      )}

      {/* Screen 3: Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => engineRef.current?.resumeRun()}
          onRestart={handleRestart}
          onHome={handleHome}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Screen 4: Game Over Modal */}
      {gameState === 'gameover' && lastRunStats && (
        <GameOverModal
          stats={lastRunStats}
          highScore={profile.highScore}
          isNewRecord={isNewHighScore}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenShop={() => setActiveModal('shop')}
        />
      )}

      {/* Screen 5: Coin Shop Modal (Google Play Billing Store) */}
      {activeModal === 'shop' && (
        <CoinShopModal
          profile={profile}
          onClose={() => setActiveModal('none')}
          onCoinsPurchased={handleCoinsPurchased}
        />
      )}

      {/* Screen 6: Characters Modal (8 cartoon runners) */}
      {activeModal === 'characters' && (
        <CharacterShopModal
          profile={profile}
          onClose={() => setActiveModal('none')}
          onEquipCharacter={handleEquipCharacter}
          onUnlockCharacter={handleUnlockCharacter}
        />
      )}

      {/* Screen 7: Skateboard Modal (6 hoverdecks) */}
      {activeModal === 'skateboards' && (
        <SkateboardShopModal
          profile={profile}
          onClose={() => setActiveModal('none')}
          onEquipSkateboard={handleEquipSkateboard}
          onUnlockSkateboard={handleUnlockSkateboard}
        />
      )}

      {/* Screen 8: Global Rankings & Leaderboard */}
      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          profile={profile}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Screen 9: Missions & 7-Day Rewards */}
      {activeModal === 'missions' && (
        <MissionsModal
          profile={profile}
          missions={missions}
          onClose={() => setActiveModal('none')}
          onClaimMission={handleClaimMission}
          onClaimDailyReward={handleClaimDailyReward}
        />
      )}

      {/* Screen 10: Rider Account & Firebase Cloud Sync */}
      {activeModal === 'account' && (
        <AccountModal
          profile={profile}
          onClose={() => setActiveModal('none')}
          onUpdateProfile={(updated) => {
            const next = { ...profile, ...updated };
            setProfile(next);
            StorageService.saveProfile(next);
          }}
        />
      )}

      {/* Screen 11: Settings & Android Packaging */}
      {activeModal === 'settings' && (
        <SettingsModal
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onClose={() => setActiveModal('none')}
          onOpenAdmin={() => setActiveModal('admin')}
        />
      )}

      {/* Screen 12: Admin Catalog Governance */}
      {activeModal === 'admin' && (
        <AdminModal
          onClose={() => setActiveModal('none')}
          onGrantCoins={handleCoinsPurchased}
        />
      )}
    </div>
  );
}
