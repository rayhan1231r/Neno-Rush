# NEON RUSH — Google Play Billing, Trusted Backend & Firebase Integration Guide

This guide details the complete production deployment and configuration steps for **NEON RUSH**, including Android Google Play Billing Library integration, trusted backend purchase verification, and Firebase Firestore/Auth integration.

---

## 1. Architecture Overview

```
 ┌──────────────────────────────────────────────────────────────┐
 │                     Android Application                      │
 │                                                              │
 │   ┌──────────────────────────┐    ┌──────────────────────┐   │
 │   │  Three.js Web Client UI  │───>│ Android Native Host  │   │
 │   │ (React + Vite + ThreeJS) │<───│  (BillingClient 7+)  │   │
 │   └─────────────┬────────────┘    └──────────┬───────────┘   │
 └─────────────────┼────────────────────────────┼───────────────┘
                   │ Purchase Token             │
                   ▼                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    Trusted Backend Server                    │
 │  POST /api/billing/verify-purchase                           │
 │  - Validates purchase token against Google Play API          │
 │  - Prevents token replay attacks (deduplication ledger)      │
 │  - Atomically credits currency to user document              │
 └─────────────────┬────────────────────────────────────────────┘
                   │
                   ▼
 ┌──────────────────────────────────────────────────────────────┐
 │            Cloud Firestore & Firebase Authentication         │
 │  - /users/{userId} (Profile, coins, gems, inventory)         │
 │  - /transactions/{orderId} (Audited purchase ledger)         │
 │  - /leaderboard/{period} (Anti-cheat validated scores)       │
 └──────────────────────────────────────────────────────────────┘
```

---

## 2. Google Play Console In-App Product Setup

Configure the 6 managed products (one-time consumable purchases) in the **Google Play Console** under **Monetize > In-app products**:

| Product ID / SKU | Product Name | Type | Price (USD) | Coin Quantity | Gem Bonus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `neon_rush_coins_starter_1000` | Starter Pack | Consumable | $0.99 | 1,000 | 10 |
| `neon_rush_coins_runner_5000` | Runner Pack | Consumable | $4.99 | 5,000 | 60 |
| `neon_rush_coins_pro_12000` | Pro Pack | Consumable | $9.99 | 12,000 | 150 |
| `neon_rush_coins_champion_30000` | Champion Pack | Consumable | $19.99 | 30,000 | 400 |
| `neon_rush_coins_legend_75000` | Legend Pack | Consumable | $49.99 | 75,000 | 1,100 |
| `neon_rush_coins_ultimate_150000` | Ultimate Pack | Consumable | $99.99 | 150,000 | 2,500 |

### Activation Checklist:
1. Upload your signed release Android App Bundle (AAB) to an **Internal Test Track**.
2. Activate all 6 in-app products in Google Play Console.
3. Add tester Google accounts under **License Testing** in Play Console settings to test purchases with sandbox test credit cards without incurring charges.

---

## 3. Native Android Wrapper (`PlayBillingBridge.kt`)

When packaging the web app as an Android app (via Capacitor, TWA, or native WebView), expose the `AndroidPlayBilling` Javascript Interface:

```kotlin
package com.neonrush.game

import android.app.Activity
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.android.billingclient.api.*
import org.json.JSONObject

class PlayBillingBridge(private val activity: Activity, private val webView: WebView) : PurchasesUpdatedListener {
    private var billingClient: BillingClient = BillingClient.newBuilder(activity)
        .setListener(this)
        .enablePendingPurchases()
        .build()

    init {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                // Billing client ready
            }
            override fun onBillingServiceDisconnected() {
                // Retry connection
            }
        })
    }

    @JavascriptInterface
    fun isAvailable(): Boolean = billingClient.isReady

    @JavascriptInterface
    fun launchBillingFlow(sku: String, accountToken: String) {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(sku)
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        )
        val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()

        billingClient.queryProductDetailsAsync(params) { _, productDetailsList ->
            val productDetails = productDetailsList.firstOrNull() ?: return@queryProductDetailsAsync
            val flowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(
                    listOf(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .build()
                    )
                )
                .setObfuscatedAccountId(accountToken)
                .build()

            activity.runOnUiThread {
                billingClient.launchBillingFlow(activity, flowParams)
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    val payload = JSONObject().apply {
                        put("orderId", purchase.orderId)
                        put("purchaseToken", purchase.purchaseToken)
                        put("packageName", purchase.packageName)
                        put("purchaseTime", purchase.purchaseTime)
                    }

                    activity.runOnUiThread {
                        webView.evaluateJavascript("window.onGooglePlayPurchaseComplete('$payload')", null)
                    }

                    // Consume the in-app purchase so it can be bought again
                    val consumeParams = ConsumeParams.newBuilder()
                        .setPurchaseToken(purchase.purchaseToken)
                        .build()
                    billingClient.consumeAsync(consumeParams) { _, _ -> }
                }
            }
        }
    }
}
```

---

## 4. Trusted Backend Purchase Verification (`server.ts`)

The server endpoint `POST /api/billing/verify-purchase` executes the following server-side checks:

1. **Replay Check**: Validates that `purchaseToken` has never been presented before.
2. **Catalog Validation**: Matches `productId` against server-side prices and coin allotments.
3. **Google Play Developer API Verification**: In production, calls `androidpublisher.purchases.products.get`:
   ```ts
   import { google } from 'googleapis';

   const androidPublisher = google.androidpublisher({
     version: 'v3',
     auth: new google.auth.GoogleAuth({
       keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
       scopes: ['https://www.googleapis.com/auth/androidpublisher'],
     }),
   });

   const purchaseResult = await androidPublisher.purchases.products.get({
     packageName: 'com.neonrush.game',
     productId: req.body.productId,
     token: req.body.purchaseToken,
   });

   if (purchaseResult.data.purchaseState !== 0) {
     throw new Error('Unverified purchase state');
   }
   ```
4. **Atomic Credit**: Credits coins and gems to the player document and records the transaction receipt in the immutable ledger.

---

## 5. Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Is request authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Is owner of document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User Profile Documents
    match /users/{userId} {
      allow read: if true;
      // Normal clients cannot write arbitrary coin balances directly
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) 
        && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['coins', 'gems', 'isAdmin']));
    }

    // Purchase Transaction Ledger (Server-only write)
    match /transactions/{transactionId} {
      allow read: if isOwner(resource.data.userId);
      allow write: if false; // Only Cloud Functions or trusted backend via Admin SDK can write
    }

    // Global Leaderboards
    match /leaderboard/{period}/scores/{scoreId} {
      allow read: if true;
      allow write: if false; // Scores must be validated through server anti-cheat endpoint
    }
  }
}
```

---

## 6. Testing & Sandbox Verification

1. **Web Preview Mode**:
   - The web app runs in **Sandbox Test Mode** by default.
   - All 6 packs can be purchased in the sandbox. Each purchase sends a real token request to `/api/billing/verify-purchase`, validates idempotency, and records a verified transaction.
2. **Google Play Billing Sandbox**:
   - Install the signed build on an Android device logged in with a Google Play license tester account.
   - Tapping "BUY" triggers the official Google Play bottom sheet with test payment methods.
3. **Admin Console**:
   - Access the Admin Console via Settings with token `neon_rush_admin_2026` to tweak prices, grant instant dev currency, or inspect catalog states.
