"use client";

import { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame, SHOP_ITEMS, SPIN_PRIZES } from "@/lib/game-state";
import { playSound } from "@/lib/sounds";
import { triggerPopup } from "@/components/XPPopup";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const { state, purchaseItem, canSpin, useSpin } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<typeof SPIN_PRIZES[number] | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const handlePurchase = (itemId: string, price: number, name: string) => {
    if (state.coins < price) {
      playSound("error", state.soundEnabled);
      setPurchaseMessage("Not enough coins!");
      setTimeout(() => setPurchaseMessage(null), 2000);
      return;
    }

    const success = purchaseItem(itemId);
    if (success) {
      playSound("coin", state.soundEnabled);
      triggerPopup(`Got ${name}!`, "coin");
      setPurchaseMessage(`Purchased ${name}!`);
      setTimeout(() => setPurchaseMessage(null), 2000);
    }
  };

  const handleSpin = () => {
    if (!canSpin() || spinning) return;

    setSpinning(true);
    setSpinResult(null);

    let count = 0;
    const spinInterval = setInterval(() => {
      playSound("spin", state.soundEnabled);
      count++;
      if (count > 15) {
        clearInterval(spinInterval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const prize = useSpin();
      setSpinResult(prize);
      setSpinning(false);

      if (prize) {
        playSound("spinWin", state.soundEnabled);
        triggerPopup(`Won: ${prize.name}!`, "coin");
      }
    }, 2000);
  };

  const powerUps = SHOP_ITEMS.filter(i => i.type === "power-up");
  const cosmetics = SHOP_ITEMS.filter(i => i.type === "cosmetic");
  const roomItems = SHOP_ITEMS.filter(i => i.type === "room-item");
  const petItems = SHOP_ITEMS.filter(i => i.type === "pet-item");

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <section className="animate-slide-up">
        <p className="text-zinc-400 text-sm">Rewards</p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1">
          Shop
        </h1>
      </section>

      {/* Coin Balance */}
      <section className="mt-6">
        <Card glow="yellow" className="inline-flex items-center gap-3 px-6">
          <span className="text-3xl">🪙</span>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{state.coins}</p>
            <p className="text-xs text-zinc-500">Your Balance</p>
          </div>
        </Card>
        {purchaseMessage && (
          <p className="mt-2 text-sm font-medium text-violet-600 animate-fade-in">
            {purchaseMessage}
          </p>
        )}
      </section>

      {/* Daily Spin */}
      <section className="mt-8 animate-slide-up delay-1">
        <Card glow="purple" className="text-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full opacity-50 blur-3xl" />
          <div className="relative">
            <CardTitle className="text-2xl">Daily Spin</CardTitle>
            <CardDescription className="mt-2">
              Complete 50% of daily quests to unlock your free spin!
            </CardDescription>

            <div className="mt-6 relative">
              <div className={cn(
                "w-32 h-32 mx-auto rounded-full border-4 border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 flex items-center justify-center text-5xl transition-all duration-300",
                spinning && "animate-spin",
                canSpin() && !spinning && "cursor-pointer hover:scale-105 hover:border-violet-300"
              )}>
                {spinning ? "🎲" : spinResult ? "🎁" : "🎰"}
              </div>

              {spinResult && !spinning && (
                <div className="mt-4 animate-fade-in">
                  <p className="text-sm text-zinc-500">You won:</p>
                  <p className="text-xl font-bold text-violet-600">{spinResult.name}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSpin}
                disabled={!canSpin() || spinning}
              >
                {spinning ? "Spinning..." : canSpin() ? "SPIN!" : "Complete quests to unlock"}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Power-Ups */}
      <section className="mt-8 animate-slide-up delay-2">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <span>⚡</span> Power-Ups
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {powerUps.map((item) => {
            const owned = state.inventory.find(i => i.id === item.id);
            return (
              <Card key={item.id} glow="purple" className="flex flex-col">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <CardDescription className="flex-1 text-sm">{item.description}</CardDescription>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-600">🪙 {item.price}</span>
                  {owned && <span className="text-xs text-zinc-400">Owned: {owned.quantity}</span>}
                </div>
                <Button
                  className="mt-3 w-full"
                  onClick={() => handlePurchase(item.id, item.price, item.name)}
                  disabled={state.coins < item.price}
                >
                  {state.coins >= item.price ? "Buy" : "Not enough coins"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pet Items */}
      {state.pet && (
        <section className="mt-8 animate-slide-up delay-3">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <span>🐾</span> Pet Items
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {petItems.map((item) => {
              const owned = state.inventory.find(i => i.id === item.id);
              return (
                <Card key={item.id} glow="pink" className="flex flex-col">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription className="flex-1 text-sm">{item.description}</CardDescription>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-600">🪙 {item.price}</span>
                    {owned && <span className="text-xs text-zinc-400">Owned: {owned.quantity}</span>}
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => handlePurchase(item.id, item.price, item.name)}
                    disabled={state.coins < item.price}
                  >
                    {state.coins >= item.price ? "Buy" : "Not enough coins"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Cosmetics */}
      <section className="mt-8 animate-slide-up delay-4">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <span>✨</span> Cosmetics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cosmetics.map((item) => {
            const owned =
              state.unlockedThemes.includes(item.id) ||
              state.unlockedHair.includes(item.id) ||
              state.unlockedOutfits.includes(item.id) ||
              state.unlockedAccessories.includes(item.id);
            return (
              <Card key={item.id} className="flex flex-col">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <CardDescription className="flex-1 text-sm">{item.description}</CardDescription>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-600">🪙 {item.price}</span>
                  {owned && <span className="text-xs text-emerald-500 font-medium">✓ Owned</span>}
                </div>
                <Button
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => handlePurchase(item.id, item.price, item.name)}
                  disabled={state.coins < item.price || owned}
                >
                  {owned ? "Owned" : state.coins >= item.price ? "Buy" : "Not enough coins"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Room Items */}
      <section className="mt-8 animate-slide-up delay-5">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <span>🏠</span> Room Items
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roomItems.map((item) => {
            const owned = state.roomItems.some(i => i.id === item.id);
            return (
              <Card key={item.id} glow="blue" className="flex flex-col">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <CardDescription className="flex-1 text-sm">{item.description}</CardDescription>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-600">🪙 {item.price}</span>
                  {owned && <span className="text-xs text-emerald-500 font-medium">✓ Owned</span>}
                </div>
                <Button
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => handlePurchase(item.id, item.price, item.name)}
                  disabled={state.coins < item.price || owned}
                >
                  {owned ? "Owned" : state.coins >= item.price ? "Buy" : "Not enough coins"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
