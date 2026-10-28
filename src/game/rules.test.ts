import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampLane,
  getLaneX,
  calculateRunScore,
  applyCurrencyUpdate,
  verifyPurchaseRequest,
  validateRunIntegrity,
  updateMissionsProgress,
  DEFAULT_COIN_PACKS,
} from './rules';
import { Mission } from '../types/game';

test('Lane logic: converts lane index to world X coordinates', () => {
  assert.equal(getLaneX(-1), -2.6);
  assert.equal(getLaneX(0), 0);
  assert.equal(getLaneX(1), 2.6);
  // Clamping check
  assert.equal(getLaneX(-5), -2.6);
  assert.equal(getLaneX(5), 2.6);
});

test('Lane logic: clamps lane switching within [-1, 1]', () => {
  assert.equal(clampLane(0, -1), -1);
  assert.equal(clampLane(-1, -1), -1); // Can't go past left
  assert.equal(clampLane(0, 1), 1);
  assert.equal(clampLane(1, 1), 1); // Can't go past right
});

test('Scoring logic: computes correct score with distance, coins, and multiplier', () => {
  // 100m, 10 coins, 1x multiplier
  // 100 + (10 * 10) = 200
  const baseScore = calculateRunScore(100, 10, 1, 0, false);
  assert.equal(baseScore, 200);

  // With 2x multiplier active
  const doubleScore = calculateRunScore(100, 10, 1, 0, true);
  assert.equal(doubleScore, 400);

  // With character bonus (0.5) and 2x active
  const heroScore = calculateRunScore(100, 10, 1, 0.5, true);
  assert.equal(heroScore, 600);
});

test('Currency logic: safely credits integer values and prevents negative balances', () => {
  const updateSuccess = applyCurrencyUpdate(500, 50, 100, -10);
  assert.equal(updateSuccess.success, true);
  assert.equal(updateSuccess.coins, 600);
  assert.equal(updateSuccess.gems, 40);

  // Floating point values are truncated
  const floatUpdate = applyCurrencyUpdate(100, 10, 50.7, 5.2);
  assert.equal(floatUpdate.coins, 150);
  assert.equal(floatUpdate.gems, 15);

  // Rejection when balance would go negative
  const failedUpdate = applyCurrencyUpdate(100, 10, -150, 0);
  assert.equal(failedUpdate.success, false);
  assert.equal(failedUpdate.coins, 100); // Unchanged
});

test('Purchase verification: detects valid packs and prevents token replay attacks', () => {
  const token = 'gplay_tok_valid_test_987654321';
  const history: string[] = [];

  // Valid first-time verification
  const res1 = verifyPurchaseRequest('pack_starter', token, DEFAULT_COIN_PACKS, history);
  assert.equal(res1.valid, true);
  assert.equal(res1.pack?.coinAmount, 1000);

  // Replay attempt with same token
  history.push(token);
  const resReplay = verifyPurchaseRequest('pack_starter', token, DEFAULT_COIN_PACKS, history);
  assert.equal(resReplay.valid, false);
  assert.equal(resReplay.errorCode, 'TOKEN_ALREADY_PROCESSED');

  // Unknown product ID
  const resUnknown = verifyPurchaseRequest('non_existent_pack', 'gplay_tok_fresh_12345678', DEFAULT_COIN_PACKS, history);
  assert.equal(resUnknown.valid, false);
  assert.equal(resUnknown.errorCode, 'CATALOG_NOT_FOUND');
});

test('Anti-cheat: validates reasonable run metrics and flags impossible scores', () => {
  // Reasonable 500m run in 30s with 40 coins
  const legit = validateRunIntegrity(1000, 500, 40, 30);
  assert.equal(legit.isLegitimate, true);

  // Impossible speed (e.g., teleporting 5000m in 5 seconds = 1000 m/s)
  const speedCheat = validateRunIntegrity(10000, 5000, 10, 5);
  assert.equal(speedCheat.isLegitimate, false);

  // Impossible coin count (e.g. 1000 coins in 50 meters)
  const coinCheat = validateRunIntegrity(15000, 50, 1000, 20);
  assert.equal(coinCheat.isLegitimate, false);
});

test('Missions logic: progresses missions and awards completion flags', () => {
  const initialMissions: Mission[] = [
    {
      id: 'm1',
      type: 'daily',
      title: 'Run 1,000m',
      description: 'Cover 1,000 meters in total',
      currentValue: 800,
      targetValue: 1000,
      rewardType: 'coins',
      rewardAmount: 250,
      completed: false,
      claimed: false,
      metric: 'distance',
    },
    {
      id: 'm2',
      type: 'daily',
      title: 'Collect 50 coins',
      description: 'Grab 50 neon gold coins',
      currentValue: 10,
      targetValue: 50,
      rewardType: 'coins',
      rewardAmount: 150,
      completed: false,
      claimed: false,
      metric: 'coins',
    },
  ];

  const { updatedMissions, newCompletedCount } = updateMissionsProgress(initialMissions, {
    distance: 300,
    coins: 15,
    jumps: 5,
    slides: 2,
    powerups: 1,
    score: 500,
  });

  assert.equal(newCompletedCount, 1); // m1 completed!
  assert.equal(updatedMissions[0].completed, true);
  assert.equal(updatedMissions[0].currentValue, 1000);
  assert.equal(updatedMissions[1].completed, false);
  assert.equal(updatedMissions[1].currentValue, 25);
});
