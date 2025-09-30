import React, { useState, useEffect, useRef } from 'react';

// Sound System using Web Audio API
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.backgroundMusicGain = null;
    this.sfxGain = null;
    this.backgroundOscillator = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.backgroundMusicEnabled = true;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.backgroundMusicGain = this.audioContext.createGain();
      this.backgroundMusicGain.gain.value = 0.1; // Very soft background
      this.backgroundMusicGain.connect(this.audioContext.destination);
      
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.3; // Moderate sound effects
      this.sfxGain.connect(this.audioContext.destination);
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  // Background music disabled
  startBackgroundMusic() {
    // Background music functionality removed
    return;
  }

  stopBackgroundMusic() {
    if (this.backgroundOscillator) {
      try {
        this.backgroundOscillator.stop();
        this.backgroundOscillator = null;
        console.log('🎵 Background music stopped');
      } catch (error) {
        console.warn('Error stopping background music:', error);
      }
    }
  }

  // Pleasant ping sound for egg collection
  playCollectSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGain);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play collect sound:', error);
    }
  }

  // Cash register sound for selling
  playSellSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.sfxGain);
      
      oscillator1.type = 'triangle';
      oscillator1.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
      oscillator1.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4
      oscillator2.frequency.setValueAtTime(392, this.audioContext.currentTime + 0.1); // G4
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      
      oscillator1.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 0.3);
      oscillator2.start(this.audioContext.currentTime);
      oscillator2.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play sell sound:', error);
    }
  }

  // Success sound for selling products (more elaborate)
  playProductSellSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      // Play a pleasant chord progression
      const frequencies = [523, 659, 784]; // C5, E5, G5
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.sfxGain);
          
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.4);
        }, index * 50);
      });
    } catch (error) {
      console.warn('Could not play product sell sound:', error);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else if (this.backgroundMusicEnabled) {
      this.startBackgroundMusic();
    }
    return this.isMuted;
  }

  toggleBackgroundMusic() {
    this.backgroundMusicEnabled = !this.backgroundMusicEnabled;
    if (this.backgroundMusicEnabled && !this.isMuted) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return this.backgroundMusicEnabled;
  }
}

// Global sound manager instance
const soundManager = new SoundManager();

// Game configuration
const GAME_CONFIG = {
  eggBaseTime: 6000,
  feedConsumptionRate: 6 / 60, // per second per chicken (3x faster)
  goldenFeedRate: 9 / 60, // per second per golden chicken (3x faster)
  gracePeriod: 3 * 60 * 1000, // 3 minutes
  gameSpeed: 60, // 60x real time
  saveInterval: 10000, // 10 seconds
};

// Production recipes
const RECIPES = {
  boiledEggs: {
    name: 'Boiled Eggs',
    icon: '🥚',
    eggCost: 1,
    goldenEggCost: 0,
    chickenCost: 0,
    baseTime: 3000, // 3 seconds
    sellPrice: 30,
    description: 'Simple & quick'
  },
  scrambledEggs: {
    name: 'Scrambled Eggs',
    icon: '🍳',
    eggCost: 1,
    goldenEggCost: 0,
    chickenCost: 0,
    baseTime: 5000, // 5 seconds
    sellPrice: 40,
    description: 'Quick and tasty'
  },
  omelet: {
    name: 'Omelet', 
    icon: '🍳',
    eggCost: 2,
    goldenEggCost: 0,
    chickenCost: 0,
    baseTime: 15000, // 15 seconds
    sellPrice: 80,
    description: 'Fluffy perfection'
  },
  eggSalad: {
    name: 'Egg Salad',
    icon: '🥗',
    eggCost: 8,
    goldenEggCost: 1,
    chickenCost: 0,
    baseTime: 25000, // 25 seconds
    sellPrice: 120,
    description: 'Fresh & healthy'
  },
  sandwich: {
    name: 'Sandwich',
    icon: '🥪',
    eggCost: 6,
    goldenEggCost: 1,
    chickenCost: 0,
    baseTime: 30000, // 30 seconds
    sellPrice: 150,
    description: 'Hearty meal'
  },
  custard: {
    name: 'Custard',
    icon: '🍮',
    eggCost: 12,
    goldenEggCost: 2,
    chickenCost: 0,
    baseTime: 90000, // 90 seconds
    sellPrice: 350,
    description: 'Creamy luxury'
  },
  friedChicken: {
    name: 'Fried Chicken',
    icon: '🍗',
    eggCost: 3,
    goldenEggCost: 0,
    chickenCost: 2,
    baseTime: 45000, // 45 seconds
    sellPrice: 250,
    description: 'Crispy delight'
  },
  chickenWrap: {
    name: 'Chicken Wrap',
    icon: '🌯',
    eggCost: 5,
    goldenEggCost: 1,
    chickenCost: 2,
    baseTime: 60000, // 60 seconds
    sellPrice: 300,
    description: 'Wrapped goodness'
  },
  chickenCurry: {
    name: 'Chicken Curry',
    icon: '🥘',
    eggCost: 4,
    goldenEggCost: 1,
    chickenCost: 3,
    baseTime: 90000, // 90 seconds
    sellPrice: 400,
    description: 'Spicy & rich'
  },
  roastChicken: {
    name: 'Roast Chicken',
    icon: '🍖',
    eggCost: 0,
    goldenEggCost: 0,
    chickenCost: 3,
    baseTime: 120000, // 2 minutes
    sellPrice: 500,
    description: 'Premium feast'
  },
  gourmetBurger: {
    name: 'Gourmet Burger',
    icon: '🍔',
    eggCost: 6,
    goldenEggCost: 2,
    chickenCost: 4,
    baseTime: 180000, // 3 minutes
    sellPrice: 800,
    description: 'Premium burger perfection'
  },
  eggsBenedict: {
    name: 'Eggs Benedict',
    icon: '🍳',
    eggCost: 12,
    goldenEggCost: 4,
    chickenCost: 0,
    baseTime: 240000, // 4 minutes
    sellPrice: 950,
    description: 'Luxury breakfast'
  },
  truffleOmelet: {
    name: 'Truffle Omelet',
    icon: '🥚',
    eggCost: 8,
    goldenEggCost: 6,
    chickenCost: 0,
    baseTime: 300000, // 5 minutes
    sellPrice: 1200,
    description: 'Ultimate delicacy'
  },
  chickenWellington: {
    name: 'Chicken Wellington',
    icon: '🥩',
    eggCost: 10,
    goldenEggCost: 3,
    chickenCost: 5,
    baseTime: 420000, // 7 minutes
    sellPrice: 1500,
    description: 'Masterpiece dish'
  },
  goldenSoufflé: {
    name: 'Golden Soufflé',
    icon: '🍰',
    eggCost: 4,
    goldenEggCost: 8,
    chickenCost: 0,
    baseTime: 360000, // 6 minutes
    sellPrice: 1350,
    description: 'Ethereal perfection'
  },
  bbqChickenPlatter: {
    name: 'BBQ Chicken Platter',
    icon: '🍗',
    eggCost: 15,
    goldenEggCost: 3,
    chickenCost: 6,
    baseTime: 480000, // 8 minutes
    sellPrice: 1800,
    description: 'Epic feast for kings'
  },
  imperialBanquet: {
    name: 'Imperial Banquet',
    icon: '🍽️',
    eggCost: 25,
    goldenEggCost: 10,
    chickenCost: 8,
    baseTime: 600000, // 10 minutes
    sellPrice: 2500,
    description: 'The ultimate culinary achievement'
  },
};

function App() {
  // Load saved game or use defaults
  const loadGame = () => {
    try {
      const saved = localStorage.getItem('chickenEmpireGame');
      if (saved) {
        const parsedState = JSON.parse(saved);
        return { ...getInitialState(), ...parsedState, lastUpdate: Date.now() };
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
    return getInitialState();
  };

  const getInitialState = () => ({
    money: 20,
    readyEggs: 0,
    readyGoldenEggs: 0,
    eggInventory: 0,
    goldenEggInventory: 0,
    chickens: 3,
    goldenChickens: 0,
    feed: 50,
    cooks: 1,
    coopUpgrades: 0,
    kitchenUpgrades: 0,
    
    // Auto Collector System
    autoCollectorOwned: false,
    autoCollectorLevel: 0,
    autoCollectorTimeLeft: 0, // in milliseconds
    autoCollectorLastRun: Date.now(),
    
    // Breeding System
    breedingQueue: [],
    breedingSlots: 1,
    
    // Production system
    productionQueue: [],
    productionSlots: 1,
    products: {
      boiledEggs: 0,
      scrambledEggs: 0,
      omelet: 0,
      eggSalad: 0,
      sandwich: 0,
      custard: 0,
      friedChicken: 0,
      chickenWrap: 0,
      chickenCurry: 0,
      roastChicken: 0,
      gourmetBurger: 0,
      eggsBenedict: 0,
      truffleOmelet: 0,
      chickenWellington: 0,
      goldenSoufflé: 0,
      bbqChickenPlatter: 0,
      imperialBanquet: 0,
    },
    
    // Game time
    gameTime: Date.now(),
    gameDay: 1,
    lastUpdate: Date.now(),
    lastSalaryTime: Date.now(),
    feedGracePeriod: null,
    
    // Transaction History
    transactions: [],
  });

  const [gameState, setGameState] = useState(loadGame);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameFrozen, setGameFrozen] = useState(false);

  // Transaction logging system
  const logTransaction = (type, description, amount, details = {}) => {
    const transaction = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      type, // 'purchase', 'sale', 'expense', 'income'
      description,
      amount,
      details,
    };
    
    setGameState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions].slice(0, 100) // Keep last 100 transactions
    }));
  };

  // Floating text system
  const showFloatingText = (text, color = '#2E8B57') => {
    const id = Date.now() + Math.random();
    const newText = { id, text, color, x: Math.random() * 200 + 100, y: Math.random() * 100 + 50 };
    setFloatingTexts(prev => [...prev.slice(-5), newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  };

  const collectEggs = () => {
    if (gameFrozen) {
      showFloatingText('⏸️ Game is frozen!', '#6b7280');
      return;
    }
    
    const totalReady = gameState.readyEggs + gameState.readyGoldenEggs;
    if (totalReady === 0) return;

    setGameState(prev => ({
      ...prev,
      readyEggs: 0,
      readyGoldenEggs: 0,
      eggInventory: prev.eggInventory + gameState.readyEggs,
      goldenEggInventory: prev.goldenEggInventory + gameState.readyGoldenEggs,
    }));

    if (gameState.readyGoldenEggs > 0 && gameState.readyEggs > 0) {
      showFloatingText(`+${gameState.readyEggs} 🥚 +${gameState.readyGoldenEggs} 🥇`, '#FFD93D');
    } else if (gameState.readyGoldenEggs > 0) {
      showFloatingText(`+${gameState.readyGoldenEggs} 🥇`, '#FFD93D');
    } else {
      showFloatingText(`+${gameState.readyEggs} 🥚`);
    }
    
    // Play collection sound effect
    if (soundEnabled) {
      soundManager.playCollectSound();
    }
  };

  const sellEggs = () => {
    if (gameFrozen) {
      showFloatingText('⏸️ Game is frozen!', '#6b7280');
      return;
    }
    
    const eggValue = gameState.eggInventory * 2 + gameState.goldenEggInventory * 10;
    if (eggValue === 0) return;

    setGameState(prev => ({
      ...prev,
      money: prev.money + eggValue,
      eggInventory: 0,
      goldenEggInventory: 0,
    }));
    showFloatingText(`+$${eggValue}`, '#16a34a');
    
    // Log transaction
    logTransaction('sale', 'Sold Eggs', eggValue, { 
      regularEggs: gameState.eggInventory, 
      goldenEggs: gameState.goldenEggInventory 
    });
    
    // Play sell sound effect
    if (soundEnabled) {
      soundManager.playSellSound();
    }
  };

  const buyChicken = () => {
    if (gameFrozen) {
      showFloatingText('⏸️ Game is frozen!', '#6b7280');
      return;
    }
    
    const price = 30 + Math.floor(gameState.chickens * 3);
    if (gameState.money >= price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        chickens: prev.chickens + 1,
      }));
      showFloatingText(`-$${price}`, '#ef4444');
      logTransaction('purchase', 'Bought Regular Chicken', -price, { item: 'Regular Chicken' });
    }
  };

  const buyGoldenChicken = () => {
    if (gameFrozen) {
      showFloatingText('⏸️ Game is frozen!', '#6b7280');
      return;
    }
    
    const price = 1000 + gameState.goldenChickens * 200;
    if (gameState.money >= price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        goldenChickens: prev.goldenChickens + 1,
      }));
      showFloatingText(`-$${price}`, '#ef4444');
      logTransaction('purchase', 'Bought Golden Chicken', -price, { item: 'Golden Chicken' });
    }
  };

  const buyFeed = (type) => {
    const feedPackages = {
      small: { amount: 100, cost: 50 },
      large: { amount: 500, cost: 250 },
      mega: { amount: 1000, cost: 500 },
    };
    
    const pack = feedPackages[type];
    if (pack && gameState.money >= pack.cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - pack.cost,
        feed: prev.feed + pack.amount,
      }));
      showFloatingText(`+${pack.amount} 🌾`, '#ca8a04');
      logTransaction('purchase', `Bought ${pack.name}`, -pack.cost, { item: pack.name, amount: pack.amount });
    }
  };

  const startProduction = (recipeId) => {
    const recipe = RECIPES[recipeId];
    if (!recipe) return;

    const canProduce = gameState.eggInventory >= recipe.eggCost &&
                      gameState.goldenEggInventory >= recipe.goldenEggCost &&
                      gameState.chickens >= recipe.chickenCost &&
                      gameState.productionQueue.length < gameState.productionSlots;

    if (canProduce) {
      const productionTime = recipe.baseTime / (1 + gameState.kitchenUpgrades * 0.2);
      
      setGameState(prev => ({
        ...prev,
        eggInventory: prev.eggInventory - recipe.eggCost,
        goldenEggInventory: prev.goldenEggInventory - recipe.goldenEggCost,
        chickens: prev.chickens - recipe.chickenCost,
        productionQueue: [...prev.productionQueue, {
          id: Date.now(),
          recipeId,
          startTime: Date.now(),
          endTime: Date.now() + productionTime,
        }],
      }));
      showFloatingText(`Cooking ${recipe.name}!`, '#f59e0b');
      
      // Log production transaction
      logTransaction('expense', `Started cooking ${recipe.name}`, 0, { 
        recipe: recipe.name,
        eggsUsed: recipe.eggCost,
        goldenEggsUsed: recipe.goldenEggCost,
        chickensUsed: recipe.chickenCost,
        estimatedValue: recipe.sellPrice
      });
      
      // Show warning if using chicken
      if (recipe.chickenCost > 0) {
        showFloatingText(`🐔 Used ${recipe.chickenCost} chicken!`, '#ef4444');
      }
    }
  };

  const sellProducts = () => {
    if (gameFrozen) {
      showFloatingText('⏸️ Game is frozen!', '#6b7280');
      return;
    }
    
    let totalValue = 0;
    const productUpdates = {};
    
    const soldProducts = [];
    Object.entries(gameState.products).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const recipe = RECIPES[productId];
        totalValue += quantity * recipe.sellPrice;
        productUpdates[productId] = 0;
        soldProducts.push({ name: recipe.name, quantity, value: quantity * recipe.sellPrice });
      }
    });

    if (totalValue > 0) {
      setGameState(prev => ({
        ...prev,
        money: prev.money + totalValue,
        products: { ...prev.products, ...productUpdates },
      }));
    showFloatingText(`+$${totalValue}`, '#16a34a');
    logTransaction('sale', 'Sold Products', totalValue, { products: soldProducts });
    
    // Play product sell sound effect
    if (soundEnabled) {
      soundManager.playProductSellSound();
    }
    }
  };

  const buyCook = () => {
    const price = Math.floor(400 * Math.pow(2.5, gameState.cooks - 1));
    if (gameState.money >= price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        cooks: prev.cooks + 1,
        productionSlots: prev.cooks + 1,
      }));
      showFloatingText(`-$${price}`, '#ef4444');
      logTransaction('purchase', 'Hired Cook', -price, { item: 'Cook', level: gameState.cooks });
    }
  };

  // Auto Collector Functions
  const buyAutoCollector = () => {
    const price = 2000; // Premium initial purchase
    if (gameState.money >= price && !gameState.autoCollectorOwned) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        autoCollectorOwned: true,
        autoCollectorLevel: 1,
      }));
      showFloatingText(`-$${price}`, '#ef4444');
      showFloatingText('🤖 Auto Collector Purchased!', '#f59e0b');
      logTransaction('purchase', 'Bought Auto Collector', -price, { item: 'Auto Collector' });
    }
  };

  const topUpAutoCollector = () => {
    const baseDuration = 60000; // 60 seconds base
    const durationPerLevel = gameState.autoCollectorLevel * 30000; // +30s per level
    const totalDuration = baseDuration + durationPerLevel;
    const price = Math.floor(200 + gameState.autoCollectorLevel * 50); // Increases with level
    
    if (gameState.money >= price && gameState.autoCollectorOwned) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        autoCollectorTimeLeft: prev.autoCollectorTimeLeft + totalDuration,
      }));
      showFloatingText(`-$${price}`, '#ef4444');
      showFloatingText(`+${Math.floor(totalDuration/1000)}s Auto Time`, '#10b981');
      logTransaction('purchase', 'Auto Collector Top-Up', -price, { 
        item: 'Auto Collector Top-Up', 
        duration: Math.floor(totalDuration/1000),
        level: gameState.autoCollectorLevel 
      });
    }
  };

  const upgradeAutoCollector = () => {
    const price = Math.floor(2000 * Math.pow(2.2, gameState.autoCollectorLevel - 1));
    if (gameState.money >= price && gameState.autoCollectorOwned) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        autoCollectorLevel: prev.autoCollectorLevel + 1,
      }));
      showFloatingText(`-$${price}`, '#ef4444');
      showFloatingText('🔧 Auto Collector Upgraded!', '#8b5cf6');
      logTransaction('purchase', 'Auto Collector Upgrade', -price, { 
        item: 'Auto Collector Upgrade', 
        fromLevel: gameState.autoCollectorLevel,
        toLevel: gameState.autoCollectorLevel + 1 
      });
    }
  };

  const startBreeding = () => {
    const chickenCost = 3;
    const moneyCost = 800; // Substantial breeding fee
    const breedingTime = 2 * 60 * 1000; // 2 minutes in milliseconds
    
    // Check requirements
    if (gameState.chickens < chickenCost) {
      showFloatingText(`Need ${chickenCost} chickens to breed!`, '#ef4444');
      return;
    }
    
    if (gameState.money < moneyCost) {
      showFloatingText(`Need $${moneyCost} for breeding!`, '#ef4444');
      return;
    }
    
    if (gameState.breedingQueue.length >= gameState.breedingSlots) {
      showFloatingText('Breeding facility is full!', '#f59e0b');
      return;
    }
    
    // Start breeding process
    setGameState(prev => ({
      ...prev,
      chickens: prev.chickens - chickenCost,
      money: prev.money - moneyCost,
      breedingQueue: [...prev.breedingQueue, {
        id: Date.now(),
        startTime: Date.now(),
        endTime: Date.now() + breedingTime,
      }],
    }));
    
    showFloatingText(`🧬 Breeding Started!`, '#8b5cf6');
    showFloatingText(`-3 🐔 -$${moneyCost}`, '#ef4444');
    
    // Log breeding transaction
    logTransaction('purchase', 'Started Chicken Breeding', -moneyCost, { 
      chickensUsed: chickenCost,
      breedingTime: breedingTime / 1000,
      expectedResult: '1 Golden Chicken'
    });
  };

  const resetGame = () => {
    soundManager.stopBackgroundMusic();
    setGameState(getInitialState());
    localStorage.removeItem('chickenEmpireGame');
    setGameInitialized(false);
    showFloatingText('Game Reset!', '#ef4444');
  };

  // Sound control functions
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    soundManager.isMuted = !newSoundState;
  };

  // Freeze/Unfreeze game function
  const toggleGameFreeze = () => {
    const newFrozenState = !gameFrozen;
    setGameFrozen(newFrozenState);
    
    if (newFrozenState) {
      showFloatingText('⏸️ Game Frozen!', '#6b7280');
    } else {
      showFloatingText('▶️ Game Resumed!', colors.success);
    }
  };


  const gameLoopRef = useRef(null);
  const saveIntervalRef = useRef(null);

  // Game initialization and main loop
  const initGame = () => {
    if (gameInitialized) return;
    
    // Clear existing intervals
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);

    // Start game loop
    gameLoopRef.current = setInterval(() => {
      setGameState(prevState => {
        // Don't update game state if frozen
        if (gameFrozen) return prevState;
        
        const now = Date.now();
        const deltaTime = Math.min(now - prevState.lastUpdate, 60000);
        let newState = { ...prevState, lastUpdate: now };

        // Update game time (60x speed)
        const gameTimeIncrease = deltaTime * GAME_CONFIG.gameSpeed;
        newState.gameTime = prevState.gameTime + gameTimeIncrease;
        newState.gameDay = Math.floor((newState.gameTime - getInitialState().gameTime) / (24 * 60 * 60 * 1000)) + 1;

        // Feed consumption
        if (newState.chickens > 0 || newState.goldenChickens > 0) {
          const totalConsumption = (newState.chickens * GAME_CONFIG.feedConsumptionRate + 
                                   newState.goldenChickens * GAME_CONFIG.goldenFeedRate) * (deltaTime / 1000);
          newState.feed = Math.max(0, newState.feed - totalConsumption);
        }

        // Handle feed grace period and chicken death
        if (newState.feed <= 0 && !newState.feedGracePeriod) {
          newState.feedGracePeriod = now + GAME_CONFIG.gracePeriod;
        } else if (newState.feed > 0 && newState.feedGracePeriod) {
          newState.feedGracePeriod = null;
        }

        if (newState.feedGracePeriod && now > newState.feedGracePeriod) {
          const chickenLoss = Math.max(1, Math.floor((newState.chickens + newState.goldenChickens) * 0.1));
          if (newState.goldenChickens > 0) {
            newState.goldenChickens = Math.max(0, newState.goldenChickens - Math.min(chickenLoss, newState.goldenChickens));
          } else {
            newState.chickens = Math.max(0, newState.chickens - Math.min(chickenLoss, newState.chickens));
          }
          newState.feedGracePeriod = now + GAME_CONFIG.gracePeriod;
        }

        // Process production queue
        newState.productionQueue = newState.productionQueue.filter(item => {
          if (now >= item.endTime) {
            newState.products[item.recipeId] = (newState.products[item.recipeId] || 0) + 1;
            return false;
          }
          return true;
        });

        // Process breeding queue
        newState.breedingQueue = newState.breedingQueue.filter(breeding => {
          if (now >= breeding.endTime) {
            // Add golden chicken
            newState.goldenChickens += 1;
            
            // We can't call showFloatingText here as it's not accessible in the game loop
            // Instead, we'll add a flag to trigger the UI update
            newState.breedingCompleted = (newState.breedingCompleted || 0) + 1;
            
            return false; // Remove from queue
          }
          return true; // Keep in queue
        });

        // Auto Collector Logic
        if (newState.autoCollectorOwned && newState.autoCollectorTimeLeft > 0) {
          // Decrease remaining time
          newState.autoCollectorTimeLeft = Math.max(0, newState.autoCollectorTimeLeft - deltaTime);
          
          // Auto collect eggs if there are any ready
          if (newState.readyEggs > 0 || newState.readyGoldenEggs > 0) {
            // Collect ready eggs every 2 seconds when auto collector is running
            if (now - newState.autoCollectorLastRun >= 2000) {
              const eggsCollected = newState.readyEggs;
              const goldenEggsCollected = newState.readyGoldenEggs;
              
              newState.eggInventory += eggsCollected;
              newState.goldenEggInventory += goldenEggsCollected;
              newState.readyEggs = 0;
              newState.readyGoldenEggs = 0;
              newState.autoCollectorLastRun = now;
              
              // Visual feedback (will show when state updates)
              if (eggsCollected > 0 || goldenEggsCollected > 0) {
                // Note: showFloatingText is not accessible here, so we'll handle this differently
              }
            }
          }
        }

        // Pay cook salaries (every game hour)
        const salaryInterval = 60 * 60 * 1000 / GAME_CONFIG.gameSpeed; // 1 real minute = 1 game hour
        if (now - newState.lastSalaryTime >= salaryInterval) {
          const salaryCost = newState.cooks * 100; // Updated to $100/hr
          newState.money = Math.max(-200, newState.money - salaryCost);
          newState.lastSalaryTime = now;
        }

        return newState;
      });
    }, 100); // 10 FPS

    // Auto-save interval
    saveIntervalRef.current = setInterval(() => {
      setGameState(currentState => {
        try {
          localStorage.setItem('chickenEmpireGame', JSON.stringify(currentState));
        } catch (error) {
          console.error('Error saving game:', error);
        }
        return currentState;
      });
    }, GAME_CONFIG.saveInterval);

    // Initialize sound system (background music disabled)
    soundManager.initialize().then(() => {
      console.log('🎵 Sound system initialized (no background music)');
    }).catch(err => {
      console.warn('Could not initialize sound:', err);
    });

    setGameInitialized(true);
  };

  // Individual egg production - Fixed with minimal dependencies
  useEffect(() => {
    if (!gameInitialized || gameFrozen) return;
    
    const totalChickens = gameState.chickens + gameState.goldenChickens;
    if (totalChickens === 0) return;

    // Base production time divided by total chickens for individual egg intervals
    const eggInterval = (GAME_CONFIG.eggBaseTime / (1 + gameState.coopUpgrades * 0.2)) / totalChickens;
    
    const interval = setInterval(() => {
      setGameState(prev => {
        // Don't produce if game is frozen
        if (gameFrozen) return prev;
        
        // Only produce if there's feed available
        if (prev.feed <= 0) return prev;
        
        // Decide which type of egg to produce based on chicken ratio
        const totalChickens = prev.chickens + prev.goldenChickens;
        if (totalChickens === 0) return prev;
        
        const isGolden = Math.random() < (prev.goldenChickens / totalChickens);
        
        
        return {
          ...prev,
          readyEggs: isGolden ? prev.readyEggs : prev.readyEggs + 1,
          readyGoldenEggs: isGolden ? prev.readyGoldenEggs + 1 : prev.readyGoldenEggs,
        };
      });
    }, eggInterval);

    return () => clearInterval(interval);
  }, [gameState.chickens, gameState.goldenChickens, gameState.coopUpgrades, gameInitialized, gameFrozen]); // Added gameFrozen to dependencies

  // Handle breeding completion notifications
  useEffect(() => {
    if (gameState.breedingCompleted && gameState.breedingCompleted > 0) {
      // Show notification for breeding completion
      showFloatingText('🐓 Golden Chicken Born!', '#f59e0b');
      
      // Log breeding completion
      logTransaction('income', 'Chicken Breeding Completed', 0, { 
        result: '1 Golden Chicken',
        breedingComplete: true
      });
      
      // Clear the completion flag
      setGameState(prev => ({
        ...prev,
        breedingCompleted: 0
      }));
    }
  }, [gameState.breedingCompleted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  // Helper functions
  const formatTime = (gameTime) => {
    const date = new Date(gameTime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatFeedTime = () => {
    const totalConsumption = gameState.chickens * GAME_CONFIG.feedConsumptionRate + 
                           gameState.goldenChickens * GAME_CONFIG.goldenFeedRate;
    if (totalConsumption === 0) return '∞';
    const hoursLeft = gameState.feed / (totalConsumption * 60);
    return hoursLeft > 0 ? `~${hoursLeft.toFixed(1)} hours` : 'OUT OF FEED!';
  };

  // Calculate player's total farm valuation
  const calculateFarmValuation = () => {
    let valuation = gameState.money;
    
    // Livestock value (based on purchase price)
    valuation += gameState.chickens * 50; // Rough average chicken price
    valuation += gameState.goldenChickens * 1200; // Rough average golden chicken price
    
    // Egg inventory value
    valuation += gameState.eggInventory * 2;
    valuation += gameState.goldenEggInventory * 10;
    valuation += gameState.readyEggs * 2;
    valuation += gameState.readyGoldenEggs * 10;
    
    // Product inventory value
    Object.entries(gameState.products).forEach(([productId, quantity]) => {
      if (quantity > 0 && RECIPES[productId]) {
        valuation += quantity * RECIPES[productId].sellPrice;
      }
    });
    
    // Feed value
    valuation += gameState.feed * 2; // Rough feed value
    
    // Staff value (cooks as ongoing investment)
    valuation += gameState.cooks * 300; // Rough cook investment value
    
    // Auto collector value
    if (gameState.autoCollectorOwned) {
      valuation += 2000; // Initial cost
      valuation += gameState.autoCollectorLevel * 1000; // Upgrade value
    }
    
    return Math.floor(valuation);
  };

  // Get player's rank in leaderboard
  const getPlayerRank = () => {
    const playerValuation = calculateFarmValuation();
    let rank = 1;
    
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].valuation > playerValuation) {
        rank = i + 2; // +2 because array is 0-indexed and we want rank starting at 1
      } else {
        break;
      }
    }
    
    return { rank, valuation: playerValuation };
  };

  // Typography system
  const typography = {
    balance: { fontSize: '48px', fontWeight: 'bold' },        // Main balance display
    sectionHeader: { fontSize: '24px', fontWeight: 'bold' },  // Section headers (Kitchen, Shop, etc.)
    cardHeader: { fontSize: '18px', fontWeight: 'bold' },     // Card titles, important text
    bodyText: { fontSize: '16px', fontWeight: 'normal' },     // Main body text
    secondaryText: { fontSize: '14px', fontWeight: 'normal' }, // Secondary text
    labelText: { fontSize: '12px', fontWeight: 'normal' },    // Labels, small text
    tinyText: { fontSize: '10px', fontWeight: 'normal' }      // Very small text
  };

  // Color system (based on shop section)
  const colors = {
    // Primary theme colors
    primary: '#16a34a',        // Main green for money, success
    primaryLight: '#22c55e',   // Lighter green
    primaryDark: '#15803d',    // Darker green
    
    // Section colors
    livestock: '#2E8B57',      // Green for chickens/livestock
    breeding: '#8b5cf6',       // Purple for breeding
    golden: '#ca8a04',         // Gold for golden items
    production: '#16a34a',     // Green for production
    
    // Background colors
    cardBg: 'white',
    sectionBg: '#F8F7FC',
    livestockBg: '#f8fffe',
    livestockBorder: '#dcf2e8',
    goldenBg: '#fffbeb',
    goldenBorder: '#fef3c7',
    breedingBg: '#f8faff',
    breedingBorder: '#e0e7ff',
    
    // Text colors
    textPrimary: '#374151',    // Dark gray for main text
    textSecondary: '#6b7280',  // Medium gray for secondary text
    textLight: '#9ca3af',      // Light gray for subtle text
    
    // Status colors
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Common styles
    shadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    borderRadiusLarge: '16px'
  };

  // Fake leaderboard data
  const leaderboard = [
    { username: "EggEmpireKing", valuation: 2500000 },
    { username: "GoldenFarmGod", valuation: 2200000 },
    { username: "ChickenMogul", valuation: 1950000 },
    { username: "FeatherTycoon", valuation: 1780000 },
    { username: "EggMasterPro", valuation: 1650000 },
    { username: "FarmingLegend", valuation: 1520000 },
    { username: "ChickBillionaire", valuation: 1420000 },
    { username: "OmeletOverlord", valuation: 1330000 },
    { username: "PoultryPioneer", valuation: 1250000 },
    { username: "EggCollectorX", valuation: 1180000 },
    { username: "FarmFortune", valuation: 1120000 },
    { username: "ChickenChampion", valuation: 1065000 },
    { username: "GoldenEggHunter", valuation: 1015000 },
    { username: "BarnyardBoss", valuation: 970000 },
    { username: "CoopCommander", valuation: 928000 },
    { username: "EggstremeGamer", valuation: 890000 },
    { username: "FeatherMillionaire", valuation: 855000 },
    { username: "ChickMagnate", valuation: 822000 },
    { username: "FarmingPhenom", valuation: 792000 },
    { username: "EggVenture", valuation: 764000 },
    { username: "PoultryProfit", valuation: 738000 },
    { username: "ChickenChaser", valuation: 714000 },
    { username: "FarmForward", valuation: 692000 },
    { username: "EggcelentPlayer", valuation: 671000 },
    { username: "CluckingRich", valuation: 652000 },
    { username: "FeatherFinancier", valuation: 634000 },
    { username: "ChickCapitalist", valuation: 617000 },
    { username: "FarmFreshMoney", valuation: 601000 },
    { username: "EggonomicWiz", valuation: 586000 },
    { username: "PoultryPlayer", valuation: 572000 },
    { username: "ChickenInvestor", valuation: 559000 },
    { username: "BarnyardBiz", valuation: 547000 },
    { username: "CoopCaptain", valuation: 535000 },
    { username: "EggMerchant", valuation: 524000 },
    { username: "FeatherFarmer", valuation: 513000 },
    { username: "ChickTrader", valuation: 503000 },
    { username: "FarmingFan", valuation: 493000 },
    { username: "EggEnthusiast", valuation: 484000 },
    { username: "PoultryPro", valuation: 475000 },
    { username: "ChickenLover", valuation: 467000 },
    { username: "FarmLifestyle", valuation: 459000 },
    { username: "EggAddict", valuation: 451000 },
    { username: "FeatherFriend", valuation: 444000 },
    { username: "ChickCollector", valuation: 437000 },
    { username: "BarnOwner", valuation: 430000 },
    { username: "CoopKeeper", valuation: 424000 },
    { username: "EggHunter", valuation: 418000 },
    { username: "FarmNovice", valuation: 412000 },
    { username: "ChickenNewbie", valuation: 407000 },
    { username: "FarmStarter", valuation: 402000 }
  ];

  return (
    <div style={{ 
      backgroundColor: colors.sectionBg, 
      padding: '8px 16px', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      <div style={{ 
        width: '100%', 
        margin: '0',
        opacity: gameFrozen ? 0.7 : 1,
        filter: gameFrozen ? 'grayscale(0.3)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Frozen Game Overlay */}
        {gameFrozen && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '16px',
            zIndex: 100,
            ...typography.sectionHeader,
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            ⏸️ GAME FROZEN
            <div style={{
              ...typography.secondaryText,
              marginTop: '8px',
              opacity: 0.8
            }}>
              Click Resume to continue playing
            </div>
          </div>
        )}
        
        {/* Floating Texts */}
        {floatingTexts.map(text => (
          <div
            key={text.id}
            style={{
              position: 'fixed',
              left: text.x,
              top: text.y,
              color: text.color,
              fontWeight: 'bold',
              fontSize: '18px',
              zIndex: 50,
              pointerEvents: 'none',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              animation: 'float-up 2s ease-out forwards',
            }}
          >
            {text.text}
          </div>
        ))}

        {/* Header */}
        <div style={{ 
          background: colors.cardBg, 
          padding: '16px', 
          borderRadius: colors.borderRadiusLarge,
          marginBottom: '16px',
          boxShadow: colors.shadow
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: window.innerWidth >= 640 ? 'row' : 'column',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div>
              <h2 style={{ 
                ...typography.sectionHeader,
                color: colors.primary, 
                margin: '0 0 4px 0',
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                📅 Day {gameState.gameDay} | 🕐 {formatTime(gameState.gameTime)}
              </h2>
              <p style={{ ...typography.secondaryText, color: colors.textSecondary, margin: 0 }}>
                Game Time: 60x Speed
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!gameInitialized ? (
                <button onClick={initGame} style={{
                  background: 'linear-gradient(45deg, #16a34a, #22c55e)',
                  color: 'white', fontWeight: 'bold', padding: '8px 24px',
                  borderRadius: '20px', border: 'none', cursor: 'pointer'
                }}>
                  🚀 Start Game
                </button>
              ) : null}
              <button onClick={resetGame} style={{
                background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                color: 'white', fontWeight: 'bold', padding: '8px 24px',
                borderRadius: '20px', border: 'none', cursor: 'pointer'
              }}>
                🔄 Reset
              </button>
              <button onClick={toggleSound} style={{
                background: soundEnabled 
                  ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)' 
                  : 'linear-gradient(45deg, #6b7280, #4b5563)',
                color: 'white', fontWeight: 'bold', padding: '8px 16px',
                borderRadius: '20px', border: 'none', cursor: 'pointer'
              }}>
                {soundEnabled ? '🔊' : '🔇'} SFX
              </button>
              <button onClick={() => setShowTransactions(!showTransactions)} style={{
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                color: 'white', fontWeight: 'bold', padding: '8px 16px',
                borderRadius: '20px', border: 'none', cursor: 'pointer'
              }}>
                📊 Transactions ({gameState.transactions.length})
              </button>
              <button onClick={() => setShowLeaderboard(!showLeaderboard)} style={{
                background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                color: 'white', fontWeight: 'bold', padding: '8px 16px',
                borderRadius: '20px', border: 'none', cursor: 'pointer'
              }}>
                🏆 Leaderboard
              </button>
              <button onClick={toggleGameFreeze} style={{
                background: gameFrozen 
                  ? 'linear-gradient(45deg, #16a34a, #22c55e)' 
                  : 'linear-gradient(45deg, #6b7280, #4b5563)',
                color: 'white', fontWeight: 'bold', padding: '8px 16px',
                borderRadius: '20px', border: 'none', cursor: 'pointer'
              }}>
                {gameFrozen ? '▶️ Resume' : '⏸️ Freeze'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Ledger Modal */}
        {showTransactions && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '2px solid #f59e0b'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                color: '#d97706', 
                margin: 0, 
                fontSize: '1.25em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Transaction Ledger
              </h3>
              <button onClick={() => setShowTransactions(false)} style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                ×
              </button>
            </div>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '16px'
            }}>
              {gameState.transactions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '16px',
                  padding: '40px 20px'
                }}>
                  📝 No transactions yet. Start buying and selling to see your activity!
                </div>
              ) : (
                gameState.transactions.map((transaction, index) => {
                  const isIncome = transaction.type === 'sale' || transaction.amount > 0;
                  const date = new Date(transaction.timestamp);
                  const timeString = date.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  });
                  
                  return (
                    <div key={transaction.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      backgroundColor: isIncome ? '#f0fdf4' : '#fef2f2',
                      borderRadius: '8px',
                      border: `1px solid ${isIncome ? '#bbf7d0' : '#fecaca'}`,
                      position: 'relative'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: isIncome ? '#16a34a' : '#dc2626',
                          marginBottom: '2px'
                        }}>
                          {transaction.description}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280' 
                        }}>
                          {timeString}
                        </div>
                        {transaction.details && Object.keys(transaction.details).length > 0 && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#9ca3af',
                            marginTop: '4px'
                          }}>
                            {JSON.stringify(transaction.details, null, 0).replace(/[{}"]/g, '').replace(/,/g, ', ')}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: isIncome ? '#16a34a' : '#dc2626'
                      }}>
                        {isIncome ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        fontSize: '10px',
                        backgroundColor: isIncome ? '#16a34a' : '#dc2626',
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '4px'
                      }}>
                        #{gameState.transactions.length - index}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {gameState.transactions.length > 0 && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>
                    Total Transactions: {gameState.transactions.length}
                  </span>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      Income: +${gameState.transactions
                        .filter(t => t.amount > 0)
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString()}
                    </span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      Expenses: ${gameState.transactions
                        .filter(t => t.amount < 0)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div style={{
            background: colors.cardBg,
            borderRadius: colors.borderRadiusLarge,
            marginBottom: '16px',
            boxShadow: colors.shadow,
            border: '2px solid ' + colors.breeding
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                ...typography.sectionHeader,
                color: colors.breeding, 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏆 Global Leaderboard
              </h3>
              <button onClick={() => setShowLeaderboard(false)} style={{
                background: colors.error,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                ×
              </button>
            </div>
            
            {/* Player's Rank Display */}
            {(() => {
              const playerRank = getPlayerRank();
              return (
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: colors.breedingBg,
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        ...typography.cardHeader,
                        color: colors.breeding,
                        fontWeight: 'bold'
                      }}>
                        #{playerRank.rank}
                      </div>
                      <div style={{
                        ...typography.bodyText,
                        fontWeight: 'bold',
                        color: colors.textPrimary
                      }}>
                        You (Player)
                      </div>
                    </div>
                    <div style={{
                      ...typography.bodyText,
                      fontWeight: 'bold',
                      color: colors.success
                    }}>
                      ${playerRank.valuation.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Leaderboard Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px',
              padding: '12px 20px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              ...typography.secondaryText,
              fontWeight: 'bold',
              color: colors.textSecondary
            }}>
              <div>Rank</div>
              <div>Username</div>
              <div style={{ textAlign: 'right' }}>Farm Valuation</div>
            </div>
            
            {/* Leaderboard List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px 0'
            }}>
              {leaderboard.map((player, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const rankColor = rank === 1 ? '#ffd700' : 
                                rank === 2 ? '#c0c0c0' : 
                                rank === 3 ? '#cd7f32' : colors.textSecondary;
                
                return (
                  <div key={player.username} style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px',
                    padding: '12px 20px',
                    backgroundColor: isTopThree ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div style={{
                      ...typography.bodyText,
                      fontWeight: isTopThree ? 'bold' : 'normal',
                      color: rankColor
                    }}>
                      #{rank}
                    </div>
                    <div style={{
                      ...typography.bodyText,
                      fontWeight: isTopThree ? 'bold' : 'normal',
                      color: colors.textPrimary
                    }}>
                      {player.username}
                      {isTopThree && (
                        <span style={{ marginLeft: '8px', fontSize: '16px' }}>
                          {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                    <div style={{
                      ...typography.bodyText,
                      fontWeight: isTopThree ? 'bold' : 'normal',
                      color: colors.success,
                      textAlign: 'right'
                    }}>
                      ${player.valuation.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              borderBottomLeftRadius: colors.borderRadiusLarge,
              borderBottomRightRadius: colors.borderRadiusLarge,
              textAlign: 'center'
            }}>
              <div style={{ 
                ...typography.labelText,
                color: colors.textSecondary 
              }}>
                Rankings update based on your total farm valuation including money, livestock, inventory, and assets.
              </div>
            </div>
          </div>
        )}

        {/* 3-Column Layout: Kitchen | Stats | Shop */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth >= 1200 
            ? '30% 40% 30%'    // Kitchen 30%, Stats 40%, Shop 30%
            : window.innerWidth >= 768 
            ? '1fr 1fr'        // 2 equal columns on medium screens 
            : '1fr',           // 1 column on small screens
          gap: '16px',
          marginBottom: '16px'
        }}>
          
          {/* Production Kitchen - Left Column */}
          <div style={{ 
            background: colors.cardBg, 
            padding: '20px', 
            borderRadius: colors.borderRadiusLarge,
            boxShadow: colors.shadow,
            order: 1,  // Always show kitchen first (left)
            height: '800px',
            overflowY: 'auto'
          }}>
            <h2 style={{ ...typography.sectionHeader, color: colors.production, textAlign: 'center', marginBottom: '16px' }}>
              🍳 Production Kitchen
            </h2>
            
            <div style={{ textAlign: 'center', ...typography.secondaryText, marginBottom: '16px', color: colors.textSecondary }}>
              Using {gameState.productionQueue.length}/{gameState.productionSlots} production slots
            </div>

            {/* Production Queue */}
            {gameState.productionQueue.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Current Production:
                </h3>
                {gameState.productionQueue.map(item => {
                  const recipe = RECIPES[item.recipeId];
                  const now = Date.now();
                  const totalTime = item.endTime - item.startTime;
                  const elapsed = now - item.startTime;
                  const progress = Math.min(100, (elapsed / totalTime) * 100);
                  const remaining = Math.max(0, item.endTime - now);
                  
                  return (
                    <div key={item.id} style={{ 
                      backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '8px'
                    }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' 
                      }}>
                        <span style={{ fontWeight: '500' }}>{recipe.icon} {recipe.name}</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {Math.ceil(remaining / 1000)}s left
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', backgroundColor: '#ddd', borderRadius: '10px', height: '6px'
                      }}>
                        <div style={{ 
                          height: '100%', background: 'linear-gradient(45deg, #ffc107, #ff8f00)',
                          borderRadius: '10px', width: `${progress}%`, transition: 'width 0.1s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Products Inventory */}
            {Object.values(gameState.products).some(count => count > 0) && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Ready Products:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {Object.entries(gameState.products)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([productId, quantity]) => {
                      const recipe = RECIPES[productId];
                      return (
                        <div key={productId} style={{ 
                          backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '8px',
                          border: '1px solid #bbf7d0', textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{recipe.icon}</div>
                          <div style={{ fontSize: '12px', fontWeight: '500' }}>{quantity}x {recipe.name}</div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}

            {/* Recipe Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr',  // Single column for recipes
              gap: '12px'
            }}>
              {Object.entries(RECIPES).map(([recipeId, recipe]) => {
                const canProduce = gameState.eggInventory >= recipe.eggCost &&
                                 gameState.goldenEggInventory >= recipe.goldenEggCost &&
                                 gameState.chickens >= recipe.chickenCost &&
                                 gameState.productionQueue.length < gameState.productionSlots;

                return (
                  <button 
                    key={recipeId}
                    onClick={() => canProduce && startProduction(recipeId)}
                    disabled={!canProduce}
                    style={{ 
                      border: canProduce ? '2px solid ' + colors.livestock : '2px solid #e5e7eb',
                      borderRadius: colors.borderRadius, 
                      padding: '4px', 
                      cursor: canProduce ? 'pointer' : 'not-allowed',
                      backgroundColor: canProduce ? colors.cardBg : '#f9fafb', 
                      opacity: canProduce ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      width: '100%',
                      ...typography.bodyText,
                      fontFamily: 'inherit',
                      boxShadow: canProduce ? colors.shadow : 'none',
                    }}
                    onMouseOver={(e) => {
                      if (canProduce) {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.backgroundColor = colors.livestockBg;
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (canProduce) {
                        e.target.style.borderColor = colors.livestock;
                        e.target.style.backgroundColor = colors.cardBg;
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 12px',
                      minHeight: '40px'
                    }}>
                      {/* Left: Icon + Name */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        flex: '1 1 140px',
                        minWidth: '0'
                      }}>
                        <div style={{ 
                          fontSize: '24px',
                          flexShrink: 0
                        }}>{recipe.icon}</div>
                        <div style={{ 
                          ...typography.labelText,
                          fontWeight: 'bold', 
                          color: colors.textPrimary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {recipe.name}
    </div>
                      </div>
                      
                      {/* Center: Requirements */}
                      <div style={{ 
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                        flex: '0 1 auto',
                        justifyContent: 'center'
                      }}>
                        {recipe.eggCost > 0 && (
                          <span style={{ 
                            ...typography.tinyText,
                            color: gameState.eggInventory >= recipe.eggCost ? colors.success : colors.error,
                            fontWeight: '600',
                            padding: '1px 4px',
                            backgroundColor: gameState.eggInventory >= recipe.eggCost ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            🥚{recipe.eggCost}
                          </span>
                        )}
                        {recipe.goldenEggCost > 0 && (
                          <span style={{ 
                            ...typography.tinyText,
                            color: gameState.goldenEggInventory >= recipe.goldenEggCost ? colors.success : colors.error,
                            fontWeight: '600',
                            padding: '1px 4px',
                            backgroundColor: gameState.goldenEggInventory >= recipe.goldenEggCost ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            🥇{recipe.goldenEggCost}
                          </span>
                        )}
                        {recipe.chickenCost > 0 && (
                          <span style={{ 
                            ...typography.tinyText,
                            color: gameState.chickens >= recipe.chickenCost ? colors.success : colors.error,
                            fontWeight: '600',
                            padding: '1px 4px',
                            backgroundColor: gameState.chickens >= recipe.chickenCost ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            🐔{recipe.chickenCost}
                          </span>
                        )}
                      </div>
                      
                      {/* Right: Time + Price */}
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: '0 0 auto'
                      }}>
                        <div style={{ 
                          ...typography.tinyText,
                          color: colors.textSecondary,
                          whiteSpace: 'nowrap'
                        }}>
                          ⏱️{Math.ceil(recipe.baseTime / (1 + gameState.kitchenUpgrades * 0.2) / 1000)}s
                        </div>
                        <div style={{ 
                          ...typography.labelText,
                          fontWeight: '600', 
                          color: colors.success,
                          whiteSpace: 'nowrap'
                        }}>
                          💰${recipe.sellPrice}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats & Actions - Center Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', order: 2 }}>
            
            {/* Balance */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: colors.cardBg,
                padding: '20px 30px', 
                borderRadius: colors.borderRadiusLarge,
                boxShadow: colors.shadow,
                textAlign: 'center', 
                maxWidth: '320px', 
                height: '110px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center'
              }}>
                <div style={{ ...typography.balance, color: colors.primaryDark, marginBottom: '4px' }}>
                  ${gameState.money.toFixed(2)}
                </div>
                <div style={{ ...typography.secondaryText, fontWeight: 'bold', color: colors.livestock, letterSpacing: '2px' }}>
                  BALANCE
                </div>
              </div>
            </div>

            {/* Stats Grid - 3 Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Row 1: Ready Eggs & Egg Inventory */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
                    {gameState.readyEggs + gameState.readyGoldenEggs}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>🥚 Ready</div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
                    {gameState.eggInventory}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>📦 Eggs</div>
                </div>
              </div>

              {/* Row 2: Chickens & Golden Chickens */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
                    {gameState.chickens}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>🐔 Chickens</div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
                    {gameState.goldenChickens}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>🐓 Golden</div>
                </div>
              </div>

              {/* Row 3: Feed & Cooks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ 
                  background: gameState.feed < 20 ? '#fef2f2' : 'white',
                  padding: '12px', 
                  borderRadius: '12px', 
                  textAlign: 'center', 
                  boxShadow: gameState.feed < 20 
                    ? '0 4px 15px rgba(239, 68, 68, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.05)',
                  border: gameState.feed < 20 ? '2px solid #ef4444' : 'none',
                  animation: gameState.feed < 20 ? 'pulse-red 2s ease-in-out infinite' : 'none'
                }}>
                  <div style={{ 
                    fontSize: '1.5em', 
                    fontWeight: 'bold', 
                    color: gameState.feed < 20 ? '#ef4444' : '#16a34a', 
                    marginBottom: '4px' 
                  }}>
                    {Math.floor(gameState.feed)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: gameState.feed < 20 ? '#ef4444' : '#6b7280' 
                  }}>
                    🌾 Feed {gameState.feed < 20 ? '⚠️' : ''}
                  </div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
                    {gameState.cooks}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>👨‍🍳 Cooks</div>
                </div>
              </div>
            </div>

            {/* Action Buttons - 2 Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Row 1: Collect Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={collectEggs}
                  disabled={gameState.readyEggs + gameState.readyGoldenEggs === 0}
                  style={{
                    background: (gameState.readyEggs + gameState.readyGoldenEggs) > 0 ? 
                      'linear-gradient(45deg, #FF6B6B, #FF8E53, #FFD93D)' : 
                      'linear-gradient(45deg, #999, #666, #444)',
                    border: 'none', borderRadius: '50%', color: 'white',
                    fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                    width: '160px', height: '160px',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    boxShadow: (gameState.readyEggs + gameState.readyGoldenEggs) > 0 ?
                      '0 8px 24px rgba(255, 107, 107, 0.3)' : 'none',
                    opacity: (gameState.readyEggs + gameState.readyGoldenEggs) > 0 ? 1 : 0.6,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥚</div>
                  <div>Collect</div>
                  <div style={{ fontSize: '14px', opacity: '0.9', marginTop: '4px' }}>
                    {gameState.readyEggs + gameState.readyGoldenEggs} ready
                  </div>
                </button>
              </div>

              {/* Row 2: Sell Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button
                  onClick={sellEggs}
                  disabled={gameState.eggInventory + gameState.goldenEggInventory === 0}
                  style={{
                    background: (gameState.eggInventory + gameState.goldenEggInventory) > 0 ?
                      'linear-gradient(45deg, #2E8B57, #32CD32)' : '#ccc',
                    color: 'white', fontWeight: 'bold', padding: '16px 24px',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    opacity: (gameState.eggInventory + gameState.goldenEggInventory) > 0 ? 1 : 0.6
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>💰 Sell Eggs</div>
                  <div style={{ fontSize: '12px', opacity: '0.9' }}>
                    ${gameState.eggInventory * 2 + gameState.goldenEggInventory * 10} total
                  </div>
                </button>
                
                <button
                  onClick={sellProducts}
                  disabled={Object.values(gameState.products).every(count => count === 0)}
                  style={{
                    background: Object.values(gameState.products).some(count => count > 0) ?
                      'linear-gradient(45deg, #8b5cf6, #7c3aed)' : '#ccc',
                    color: 'white', fontWeight: 'bold', padding: '16px 24px',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    opacity: Object.values(gameState.products).some(count => count > 0) ? 1 : 0.6
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>🍽️ Sell Products</div>
                  <div style={{ fontSize: '12px', opacity: '0.9' }}>
                    ${(() => {
                      let total = 0;
                      Object.entries(gameState.products).forEach(([productId, quantity]) => {
                        if (quantity > 0) total += quantity * RECIPES[productId].sellPrice;
                      });
                      return total;
                    })()} total
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Shop - Right Column */}
          <div style={{ 
            background: colors.cardBg, 
            padding: '20px', 
            borderRadius: colors.borderRadiusLarge,
            boxShadow: colors.shadow,
            order: 3,  // Always show shop third (right)
            height: '800px',
            overflowY: 'auto'
          }}>
            <h2 style={{ ...typography.sectionHeader, color: colors.primary, textAlign: 'center', marginBottom: '20px' }}>
              🛒 Shop
            </h2>
            
            {/* Livestock Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                color: colors.livestock, 
                ...typography.bodyText, 
                fontWeight: 'bold', 
                marginBottom: '10px',
                padding: '8px 12px', 
                background: 'rgba(46, 139, 87, 0.1)',
                borderRadius: colors.borderRadius, 
                borderLeft: '4px solid ' + colors.livestock
              }}>
                🐔 Livestock
              </div>
              
              <div style={{ 
                border: '2px solid ' + colors.livestockBorder, 
                borderRadius: colors.borderRadius, 
                padding: '16px', 
                marginBottom: '12px', 
                cursor: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? 'pointer' : 'not-allowed',
                opacity: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? 1 : 0.6,
                backgroundColor: colors.livestockBg
              }} onClick={buyChicken}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>🐔</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2E8B57' }}>Regular Chicken</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Lays 1 egg every 6 seconds</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>
                  ${30 + Math.floor(gameState.chickens * 3)}
                </div>
              </div>
              
              <div style={{ 
                border: '2px solid #fef3c7', borderRadius: '8px', padding: '16px', 
                marginBottom: '12px', cursor: gameState.money >= (1000 + gameState.goldenChickens * 200) ? 'pointer' : 'not-allowed',
                opacity: gameState.money >= (1000 + gameState.goldenChickens * 200) ? 1 : 0.6,
                backgroundColor: '#fffbeb'
              }} onClick={buyGoldenChicken}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>🐓</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#ca8a04' }}>Golden Chicken</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Lays valuable golden eggs</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ca8a04' }}>
                  ${1000 + gameState.goldenChickens * 200}
                </div>
              </div>
            </div>

            {/* Breeding Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                color: '#8b5cf6', fontSize: '1em', fontWeight: 'bold', marginBottom: '10px',
                padding: '8px 12px', background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '8px', borderLeft: '4px solid #8b5cf6'
              }}>
                🧬 Chicken Breeding
              </div>
              
              {/* Breeding Queue Display */}
              {gameState.breedingQueue.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {gameState.breedingQueue.map((breeding, index) => {
                    const remainingTime = Math.max(0, breeding.endTime - Date.now());
                    const totalTime = breeding.endTime - breeding.startTime;
                    const progress = ((totalTime - remainingTime) / totalTime) * 100;
                    
                    return (
                      <div key={breeding.id} style={{
                        border: '2px solid #e0e7ff', borderRadius: '8px', padding: '12px',
                        marginBottom: '8px', backgroundColor: '#f8faff'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>🧬 Breeding in Progress</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {Math.ceil(remainingTime / 1000)}s remaining
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: '#8b5cf6',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Breeding Button */}
              <div style={{ 
                border: '2px solid #e0e7ff', borderRadius: '8px', padding: '16px', 
                marginBottom: '12px', 
                cursor: (gameState.chickens >= 3 && gameState.money >= 800 && gameState.breedingQueue.length < gameState.breedingSlots) ? 'pointer' : 'not-allowed',
                opacity: (gameState.chickens >= 3 && gameState.money >= 800 && gameState.breedingQueue.length < gameState.breedingSlots) ? 1 : 0.6,
                backgroundColor: '#f8faff'
              }} onClick={startBreeding}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>🧬</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Breed Golden Chicken</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>3 chickens → 1 golden chicken (2 min)</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  3🐔 + $800
                </div>
                {gameState.breedingQueue.length >= gameState.breedingSlots && (
                  <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                    Breeding facility full
                  </div>
                )}
              </div>
              
              {/* Breeding Stats */}
              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                Breeding Slots: {gameState.breedingQueue.length}/{gameState.breedingSlots}
              </div>
            </div>

            {/* Feed Supply Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                color: '#2E8B57', fontSize: '1em', fontWeight: 'bold', marginBottom: '10px',
                padding: '8px 12px', background: 'rgba(46, 139, 87, 0.1)',
                borderRadius: '8px', borderLeft: '4px solid #2E8B57'
              }}>
                🌾 Feed Supply
              </div>
              
              {[
                { type: 'small', name: 'Small Feed Pack', amount: 100, cost: 50 },
                { type: 'large', name: 'Large Feed Pack', amount: 500, cost: 250, bestValue: true },
                { type: 'mega', name: 'Mega Feed Pack', amount: 1000, cost: 500 }
              ].map(pack => (
                <div key={pack.type} style={{
                  border: '2px solid #dcf2e8', 
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  cursor: gameState.money >= pack.cost ? 'pointer' : 'not-allowed',
                  opacity: gameState.money >= pack.cost ? 1 : 0.6,
                  backgroundColor: '#f8fffe',
                  position: 'relative'
                }}
                onClick={() => gameState.money >= pack.cost && buyFeed(pack.type)}>
                  {pack.bestValue && (
                    <div style={{
                      position: 'absolute', top: '-8px', right: '8px',
                      backgroundColor: '#ff6b35', color: 'white',
                      padding: '4px 8px', borderRadius: '12px',
                      fontSize: '10px', fontWeight: 'bold'
                    }}>
                      BEST VALUE
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px', marginRight: '12px' }}>🌾</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#2E8B57' }}>{pack.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{pack.amount} units of feed</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>
                    ${pack.cost} <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      (${(pack.cost / pack.amount).toFixed(2)}/unit)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Staff Section */}
            <div>
              <div style={{ 
                color: '#2E8B57', fontSize: '1em', fontWeight: 'bold', marginBottom: '10px',
                padding: '8px 12px', background: 'rgba(46, 139, 87, 0.1)',
                borderRadius: '8px', borderLeft: '4px solid #2E8B57'
              }}>
                👨‍🍳 Staff
              </div>
              
              <div style={{ 
                border: '2px solid #dcf2e8', borderRadius: '8px', padding: '16px', 
                cursor: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? 'pointer' : 'not-allowed',
                opacity: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? 1 : 0.6,
                backgroundColor: '#f8fffe'
              }} onClick={buyCook}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>👨‍🍳</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2E8B57' }}>Hire Cook</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>+1 production slot, $100/hour salary</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>
                  ${Math.floor(400 * Math.pow(2.5, gameState.cooks - 1))}
                </div>
              </div>
            </div>

            {/* Auto Collector Section */}
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div style={{ 
                color: '#2E8B57', fontSize: '1em', fontWeight: 'bold', marginBottom: '10px',
                padding: '8px 12px', background: 'rgba(46, 139, 87, 0.1)',
                borderRadius: '8px', borderLeft: '4px solid #2E8B57'
              }}>
                🤖 Auto Collector
              </div>
              
              {!gameState.autoCollectorOwned ? (
                /* Purchase Auto Collector */
                <div style={{ 
                  border: '3px solid #fbbf24', borderRadius: '8px', padding: '16px', 
                  cursor: gameState.money >= 2000 ? 'pointer' : 'not-allowed',
                  opacity: gameState.money >= 2000 ? 1 : 0.6,
                  backgroundColor: '#fffef0',
                  position: 'relative'
                }} onClick={buyAutoCollector}>
                  <div style={{
                    position: 'absolute', top: '-8px', left: '16px',
                    backgroundColor: '#ff6b35', color: 'white',
                    padding: '4px 12px', borderRadius: '12px',
                    fontSize: '11px', fontWeight: 'bold'
                  }}>
                    PREMIUM MACHINE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px', marginRight: '12px' }}>🤖</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ca8a04', fontSize: '16px' }}>Auto Egg Collector</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Automatically collects eggs every 2 seconds</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Requires top-ups to operate</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ca8a04' }}>
                    $2,000
                  </div>
                </div>
              ) : (
                /* Auto Collector Controls */
                <div>
                  {/* Status Display */}
                  <div style={{ 
                    border: '2px solid #dcfce7', borderRadius: '8px', padding: '16px', 
                    marginBottom: '12px',
                    backgroundColor: gameState.autoCollectorTimeLeft > 0 ? '#dcfce7' : '#fef2f2'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px', marginRight: '12px' }}>🤖</span>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#16a34a' }}>
                            Auto Collector Level {gameState.autoCollectorLevel}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {gameState.autoCollectorTimeLeft > 0 
                              ? `Active: ${Math.ceil(gameState.autoCollectorTimeLeft / 1000)}s remaining`
                              : 'Inactive - Needs top-up'
                            }
                          </div>
                        </div>
                      </div>
                      <div style={{
                        width: '100px', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px',
                        position: 'relative', overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(100, (gameState.autoCollectorTimeLeft / ((60000 + gameState.autoCollectorLevel * 30000))) * 100)}%`,
                          height: '100%', backgroundColor: gameState.autoCollectorTimeLeft > 10000 ? '#10b981' : '#ef4444',
                          borderRadius: '3px', transition: 'all 0.3s ease'
                        }}/>
                      </div>
                    </div>
                  </div>

                  {/* Top Up Button */}
                  <div style={{ 
                    border: '2px solid #dcf2e8', borderRadius: '8px', padding: '16px', 
                    marginBottom: '12px',
                    cursor: gameState.money >= Math.floor(200 + gameState.autoCollectorLevel * 50) ? 'pointer' : 'not-allowed',
                    opacity: gameState.money >= Math.floor(200 + gameState.autoCollectorLevel * 50) ? 1 : 0.6,
                    backgroundColor: '#f8fffe'
                  }} onClick={topUpAutoCollector}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px', marginRight: '12px' }}>⚡</span>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>Top Up Collector</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          +{Math.floor((60000 + gameState.autoCollectorLevel * 30000) / 1000)}s operation time
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>
                      ${Math.floor(200 + gameState.autoCollectorLevel * 50)}
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <div style={{ 
                    border: '2px solid #ddd6fe', borderRadius: '8px', padding: '16px', 
                    cursor: gameState.money >= Math.floor(2000 * Math.pow(2.2, gameState.autoCollectorLevel - 1)) ? 'pointer' : 'not-allowed',
                    opacity: gameState.money >= Math.floor(2000 * Math.pow(2.2, gameState.autoCollectorLevel - 1)) ? 1 : 0.6,
                    backgroundColor: '#faf5ff'
                  }} onClick={upgradeAutoCollector}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px', marginRight: '12px' }}>🔧</span>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Upgrade Collector</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          +30s duration per top-up (Level {gameState.autoCollectorLevel + 1})
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6' }}>
                      ${Math.floor(2000 * Math.pow(2.2, gameState.autoCollectorLevel - 1)).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ 
              marginTop: '20px', padding: '16px', 
              backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #0369a1'
            }}>
              <h3 style={{ color: '#15803d', marginBottom: '8px' }}>
                💡 How to Play
              </h3>
              <p style={{ fontSize: '12px', color: '#374151' }}>
                1. Click "Start Game"<br />
                2. Buy chickens & feed<br />
                3. Wait for eggs (incremental: 0→1→2→3...)<br />
                4. Collect ALL ready eggs with one click<br />
                5. Sell eggs for money<br />
                6. Cook eggs into valuable products!<br />
                7. Hire cooks for more production slots!<br />
                8. Buy Auto Collector for hands-free gameplay!<br />
                9. Expand your empire!
              </p>
            </div>
          </div>
        </div>

        {/* Chicken Farm - Full Width Bottom Section */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          marginTop: '16px'
        }}>
          <h2 style={{ color: '#16a34a', textAlign: 'center', marginBottom: '16px', fontSize: '1.25em' }}>
            🐔 Chicken Farm
          </h2>
          
          {/* Feed Status */}
          {gameInitialized && (
            <div style={{ 
              textAlign: 'center', fontSize: '14px', marginBottom: '16px', color: '#6b7280',
              padding: '12px', backgroundColor: gameState.feed > 10 ? '#f0fdf4' : '#fef2f2',
              borderRadius: '8px', border: gameState.feed > 10 ? '1px solid #bbf7d0' : '1px solid #fca5a5'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                Feed will last approximately {formatFeedTime()}
              </div>
              {gameState.feed <= 10 && (
                <div style={{ color: '#ef4444', fontWeight: '600' }}>
                  ⚠️ Low feed! Buy more immediately!
                </div>
              )}
            </div>
          )}
          
          {/* Farm Grid */}
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '16px',
            textAlign: 'center'
          }}>
            {gameState.chickens + gameState.goldenChickens === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                color: '#6b7280', 
                fontSize: '16px', 
                padding: '40px 0' 
              }}>
                🏃‍♂️ Your farm is empty. Buy some chickens to get started!
              </div>
            ) : (
              <>
                {Array.from({length: gameState.chickens}, (_, i) => (
                  <div key={`chicken-${i}`}>
                    <div style={{ 
                      fontSize: '30px', marginBottom: '4px',
                      filter: gameState.feed > 0 ? 'none' : 'grayscale(100%)',
                      opacity: gameState.feed > 0 ? 1 : 0.5
                    }}>🐔</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Chicken {i + 1}</div>
                    <div style={{ 
                      fontSize: '10px', fontWeight: '500',
                      color: gameState.feed > 0 ? '#16a34a' : '#ef4444'
                    }}>
                      {gameState.feed > 0 ? 'Happy' : 'Starving'}
                    </div>
                  </div>
                ))}
                {Array.from({length: gameState.goldenChickens}, (_, i) => (
                  <div key={`golden-${i}`}>
                    <div style={{ 
                      fontSize: '30px', marginBottom: '4px',
                      filter: gameState.feed > 0 ? 'none' : 'grayscale(100%)',
                      opacity: gameState.feed > 0 ? 1 : 0.5
                    }}>🐓</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Golden {i + 1}</div>
                    <div style={{ 
                      fontSize: '10px', fontWeight: '500',
                      color: gameState.feed > 0 ? '#ca8a04' : '#ef4444'
                    }}>
                      {gameState.feed > 0 ? 'Premium' : 'Starving'}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Feed Grace Period Warning */}
          {gameState.feedGracePeriod && (
            <div style={{ 
              marginTop: '16px', padding: '12px',
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#b91c1c' }}>
                ⚠️ CRITICAL: Chickens are starving! Feed them quickly or they will die!
              </div>
            </div>
          )}
        </div>

        {/* Floating Text Overlay */}
        {floatingTexts.map(text => (
          <div
            key={text.id}
            style={{
              position: 'fixed',
              left: `${text.x}px`,
              top: `${text.y}px`,
              color: text.color,
              fontWeight: 'bold',
              fontSize: '20px',
              pointerEvents: 'none',
              zIndex: 1000,
              animation: 'float-up 2s ease-out forwards'
            }}
          >
            {text.text}
          </div>
        ))}

        <style jsx>{`
          @keyframes float-up {
            0% { opacity: 1; transform: translateY(0px); }
            100% { opacity: 0; transform: translateY(-50px); }
          }
          
          @keyframes pulse-red {
            0% { 
              background-color: #fef2f2;
              box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
              transform: scale(1);
            }
            50% { 
              background-color: #fee2e2;
              box-shadow: 0 6px 25px rgba(239, 68, 68, 0.5);
              transform: scale(1.02);
            }
            100% { 
              background-color: #fef2f2;
              box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;