/**
 * NEON RUSH - Trusted Backend Server
 * Express full-stack API + Vite middleware integration.
 * Provides secure purchase token verification, anti-cheat leaderboard validation,
 * catalog management, and transaction ledger.
 */

import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_COIN_PACKS, validateRunIntegrity, verifyPurchaseRequest } from './src/game/rules';
import { LeaderboardEntry, PurchaseTransaction } from './src/types/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Trusted Server Ledger (can be mirrored to Cloud Firestore in production)
const processedPurchaseTokens = new Set<string>();
const transactionLedger: PurchaseTransaction[] = [];

// Seeded global leaderboard entries matching master reference sheet
const allTimeLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'usr_nova', username: 'Nova', characterId: 'char_nova', score: 1126500, distance: 48200, coinsCollected: 12420, timestamp: Date.now() - 3600000 },
  { rank: 2, userId: 'usr_aiden', username: 'Aiden', characterId: 'char_aiden', score: 1124500, distance: 47900, coinsCollected: 11900, timestamp: Date.now() - 7200000 },
  { rank: 3, userId: 'usr_luna', username: 'Luna', characterId: 'char_luna', score: 980210, distance: 41200, coinsCollected: 9840, timestamp: Date.now() - 12000000 },
  { rank: 4, userId: 'usr_jax', username: 'Jax', characterId: 'char_jax', score: 842760, distance: 35400, coinsCollected: 8210, timestamp: Date.now() - 18000000 },
  { rank: 5, userId: 'usr_kira', username: 'Kira', characterId: 'char_kira', score: 765430, distance: 31200, coinsCollected: 7420, timestamp: Date.now() - 24000000 },
  { rank: 6, userId: 'usr_echo', username: 'Echo', characterId: 'char_echo', score: 487320, distance: 22100, coinsCollected: 5120, timestamp: Date.now() - 30000000 },
  { rank: 7, userId: 'usr_dino', username: 'Dino', characterId: 'char_dino', score: 421560, distance: 19800, coinsCollected: 4320, timestamp: Date.now() - 36000000 },
];

let serverCoinCatalog = [...DEFAULT_COIN_PACKS];

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'neon-rush-backend', time: Date.now() });
});

// 2. Verified In-App Purchase Catalog
app.get('/api/catalog', (_req: Request, res: Response) => {
  res.json({ success: true, catalog: serverCoinCatalog });
});

// 3. Purchase Token Verification Endpoint (Trusted Backend)
app.post('/api/billing/verify-purchase', (req: Request, res: Response) => {
  const { productId, purchaseToken, orderId, userId, provider } = req.body;

  if (!productId || !purchaseToken) {
    return res.status(400).json({ success: false, error: 'Missing productId or purchaseToken' });
  }

  // Idempotency & Replay Attack Prevention
  if (processedPurchaseTokens.has(purchaseToken)) {
    return res.status(409).json({
      success: false,
      error: 'SECURITY WARNING: Purchase token has already been consumed and processed.',
      code: 'TOKEN_REPLAY_ATTACK',
    });
  }

  // Validate with Server Catalog
  const verification = verifyPurchaseRequest(
    productId,
    purchaseToken,
    serverCoinCatalog,
    Array.from(processedPurchaseTokens)
  );

  if (!verification.valid || !verification.pack) {
    return res.status(400).json({
      success: false,
      error: `Invalid product pack or token rejection (${verification.errorCode})`,
    });
  }

  const pack = verification.pack;

  // Mark token as consumed atomically
  processedPurchaseTokens.add(purchaseToken);

  const transaction: PurchaseTransaction = {
    transactionId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderId: orderId || `GPA.${Date.now()}`,
    productId: pack.id,
    productName: pack.name,
    coinsAwarded: pack.coinAmount,
    gemsAwarded: pack.gemAmount,
    pricePaid: pack.priceUsd,
    currency: 'USD',
    provider: provider === 'google_play' ? 'google_play' : 'sandbox_simulated',
    timestamp: Date.now(),
    status: 'verified',
    purchaseToken,
  };

  transactionLedger.unshift(transaction);

  console.log(`[PAYMENT VERIFIED] Order: ${transaction.orderId} for User: ${userId} -> Awarded ${pack.coinAmount} Coins`);

  return res.json({
    success: true,
    transaction,
    message: 'Purchase verified successfully. Currency ready to credit.',
  });
});

// 4. Retrieve Transaction History
app.get('/api/billing/transactions', (_req: Request, res: Response) => {
  res.json({ success: true, transactions: transactionLedger.slice(0, 50) });
});

// 5. Restore Purchases
app.get('/api/billing/restore', (_req: Request, res: Response) => {
  res.json({ success: true, restoredCount: 0, message: 'All consumable purchases up-to-date.' });
});

// 6. Anti-Cheat Score Submission
app.post('/api/leaderboard/submit', (req: Request, res: Response) => {
  const { score, distance, coins, durationSec, userId, username, characterId } = req.body;

  // Anti-cheat verification
  const check = validateRunIntegrity(Number(score), Number(distance), Number(coins), Number(durationSec || 1));
  if (!check.isLegitimate) {
    return res.status(403).json({
      success: false,
      error: `Anti-cheat flag: ${check.reason}`,
    });
  }

  // Add or update entry in leaderboard
  const existingIdx = allTimeLeaderboard.findIndex((e) => e.userId === userId);
  const newEntry: LeaderboardEntry = {
    rank: 0,
    userId: userId || 'player_' + Math.random().toString(36).substring(2, 6),
    username: username || 'NeonRider',
    characterId: characterId || 'char_starter',
    score: Number(score),
    distance: Number(distance),
    coinsCollected: Number(coins),
    timestamp: Date.now(),
  };

  if (existingIdx >= 0) {
    if (newEntry.score > allTimeLeaderboard[existingIdx].score) {
      allTimeLeaderboard[existingIdx] = newEntry;
    }
  } else {
    allTimeLeaderboard.push(newEntry);
  }

  // Sort and re-rank
  allTimeLeaderboard.sort((a, b) => b.score - a.score);
  allTimeLeaderboard.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  const playerRank = allTimeLeaderboard.findIndex((e) => e.userId === userId) + 1;

  res.json({
    success: true,
    rank: playerRank,
    topScores: allTimeLeaderboard.slice(0, 15),
  });
});

// 7. Get Top Leaderboard Rankings
app.get('/api/leaderboard/top', (req: Request, res: Response) => {
  const currentUserId = req.query.userId as string;
  const list = allTimeLeaderboard.slice(0, 20).map((entry) => ({
    ...entry,
    isCurrentUser: currentUserId ? entry.userId === currentUserId : false,
  }));

  res.json({
    success: true,
    leaderboard: list,
  });
});

// 8. Admin Configuration (Role-Protected)
app.post('/api/admin/config', (req: Request, res: Response) => {
  const { adminSecret, updatedCatalog } = req.body;
  if (adminSecret !== 'neon_rush_admin_2026') {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Secret' });
  }

  if (Array.isArray(updatedCatalog)) {
    serverCoinCatalog = updatedCatalog;
  }

  res.json({ success: true, catalog: serverCoinCatalog });
});

// Serve frontend via Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEON RUSH SERVER] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
