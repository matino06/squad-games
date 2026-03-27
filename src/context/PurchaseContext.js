import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// expo-in-app-purchases requires a custom native build — guard against Expo Go
let InAppPurchases = null;
try {
  InAppPurchases = require('expo-in-app-purchases');
} catch {
  // Running in Expo Go or simulator without native module — IAP unavailable
}

export const PRODUCT_ID = 'com.yourname.mafiagame.bigsquad_monthly';
const STORAGE_KEY = '@gamevault_bigsquad_subscribed';

const PurchaseContext = createContext(null);

export function PurchaseProvider({ children }) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState('$1.99');
  const connected = useRef(false);

  useEffect(() => {
    // Load persisted purchase state immediately
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val === 'true') setIsPurchased(true);
    });

    // Connect to StoreKit and fetch product price (requires native build)
    if (!InAppPurchases) return;
    (async () => {
      try {
        await InAppPurchases.connectAsync();
        connected.current = true;

        const { results } = await InAppPurchases.getProductsAsync([PRODUCT_ID]);
        if (results?.length > 0) {
          setPrice(results[0].price);
        }

        InAppPurchases.setPurchaseListener(({ responseCode, results: purchases }) => {
          if (responseCode === InAppPurchases.IAPResponseCode.OK) {
            purchases?.forEach(async purchase => {
              if (!purchase.acknowledged) {
                await InAppPurchases.finishTransactionAsync(purchase, false);
              }
            });
            AsyncStorage.setItem(STORAGE_KEY, 'true');
            setIsPurchased(true);
            setIsLoading(false);
          } else {
            // USER_CANCELED or ERROR
            setIsLoading(false);
          }
        });
      } catch {
        // Not available on simulator without native build — silently ignore
      }
    })();

    return () => {
      if (connected.current) {
        InAppPurchases.disconnectAsync().catch(() => {});
      }
    };
  }, []);

  const purchaseProduct = async () => {
    if (!InAppPurchases) return;
    setIsLoading(true);
    try {
      await InAppPurchases.purchaseItemAsync(PRODUCT_ID);
      // Result handled in setPurchaseListener above
    } catch {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!InAppPurchases) return;
    setIsLoading(true);
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        const found = results?.some(p => p.productId === PRODUCT_ID);
        if (found) {
          await AsyncStorage.setItem(STORAGE_KEY, 'true');
          setIsPurchased(true);
        }
      }
    } catch {}
    setIsLoading(false);
  };

  return (
    <PurchaseContext.Provider value={{ isPurchased, isLoading, price, purchaseProduct, restorePurchases }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error('usePurchase must be used within PurchaseProvider');
  return ctx;
}
