import React, { useState, useEffect, useRef } from 'react';
import '@fontsource/alan-sans/400.css';
import '@fontsource/alan-sans/700.css';

// Sound Manager Class
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.backgroundMusicGain = null;
    this.sfxGain = null;
    this.backgroundOscillator = null;
    this.backgroundMusic = null; // Added for HTML5 Audio
    this.isInitialized = false;
    this.isMuted = false;
    this.backgroundMusicEnabled = true; // Re-enabled
    this.musicVolume = 0.3; // Default volume
  }

  async initialize() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.backgroundMusicGain = this.audioContext.createGain();
      this.backgroundMusicGain.gain.value = 0.1;
      this.backgroundMusicGain.connect(this.audioContext.destination);
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.3;
      this.sfxGain.connect(this.audioContext.destination);
      this.isInitialized = true;
      this.initializeBackgroundMusic(); // Call new init method
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  initializeBackgroundMusic() {
    try {
      this.backgroundMusic = new Audio('/happyfarm.mp3'); // Load MP3
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.musicVolume;
      this.backgroundMusic.preload = 'auto';
      this.backgroundMusic.addEventListener('canplaythrough', () => {
        console.log('🎵 Background music loaded successfully');
      });
      this.backgroundMusic.addEventListener('error', (e) => {
        console.warn('🎵 Background music failed to load:', e);
      });
    } catch (error) {
      console.warn('Could not initialize background music:', error);
    }
  }

  startBackgroundMusic() {
    if (!this.backgroundMusic || !this.backgroundMusicEnabled || this.isMuted) return;
    try {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.volume = this.musicVolume;
      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('🎵 Background music started');
        }).catch(error => {
          console.warn('Could not start background music:', error);
        });
      }
    } catch (error) {
      console.warn('Error starting background music:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        console.log('🎵 Background music stopped');
      } catch (error) {
        console.warn('Error stopping background music:', error);
      }
    }
  }

  toggleBackgroundMusic() {
    this.backgroundMusicEnabled = !this.backgroundMusicEnabled;
    if (this.backgroundMusicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return this.backgroundMusicEnabled;
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }

  playClickSound() {
    if (!this.audioContext || this.isMuted) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(this.sfxGain);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not play click sound:', error);
    }
  }

  playSuccessSound() {
    if (!this.audioContext || this.isMuted) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(this.sfxGain);
      oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play success sound:', error);
    }
  }

  playWarningSound() {
    if (!this.audioContext || this.isMuted) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(this.sfxGain);
      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play warning sound:', error);
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
}

// Game Recipes
const RECIPES = {
  // Quick Recipes (Basic Egg Dishes) - 3-15s
  boiledEggs: { 
    icon: '🥚', name: 'Boiled Eggs', 
    eggCost: 1, goldenEggCost: 0, chickenCost: 0, 
    baseTime: 3000, sellPrice: 25 
  },
  scrambledEggs: { 
    icon: '🍳', name: 'Scrambled Eggs', 
    eggCost: 1, goldenEggCost: 0, chickenCost: 0, 
    baseTime: 5000, sellPrice: 35 
  },
  omelet: { 
    icon: '🧈', name: 'Omelet', 
    eggCost: 2, goldenEggCost: 0, chickenCost: 0, 
    baseTime: 15000, sellPrice: 75 
  },
  
  // Medium Recipes (Intermediate) - 25-90s
  eggSalad: { 
    icon: '🥗', name: 'Egg Salad', 
    eggCost: 3, goldenEggCost: 0, chickenCost: 0, 
    baseTime: 25000, sellPrice: 120 
  },
  sandwich: { 
    icon: '🥪', name: 'Sandwich', 
    eggCost: 2, goldenEggCost: 0, chickenCost: 1, 
    baseTime: 30000, sellPrice: 140 
  },
  custard: { 
    icon: '🍮', name: 'Custard', 
    eggCost: 4, goldenEggCost: 1, chickenCost: 0, 
    baseTime: 90000, sellPrice: 320 
  },
  
  // Longer Recipes (Chicken Dishes) - 45-120s
  friedChicken: { 
    icon: '🍗', name: 'Fried Chicken', 
    eggCost: 2, goldenEggCost: 0, chickenCost: 2, 
    baseTime: 45000, sellPrice: 210 
  },
  chickenWrap: { 
    icon: '🌯', name: 'Chicken Wrap', 
    eggCost: 3, goldenEggCost: 0, chickenCost: 2, 
    baseTime: 60000, sellPrice: 280 
  },
  chickenCurry: { 
    icon: '🍛', name: 'Chicken Curry', 
    eggCost: 2, goldenEggCost: 1, chickenCost: 2, 
    baseTime: 90000, sellPrice: 380 
  },
  roastChicken: { 
    icon: '🍖', name: 'Roast Chicken', 
    eggCost: 1, goldenEggCost: 0, chickenCost: 3, 
    baseTime: 120000, sellPrice: 450 
  },
  
  // Premium Recipes (Gourmet & Luxury) - 3-10 minutes
  gourmetBurger: { 
    icon: '🍔', name: 'Gourmet Burger', 
    eggCost: 4, goldenEggCost: 1, chickenCost: 3, 
    baseTime: 180000, sellPrice: 750 
  },
  eggsBenedict: { 
    icon: '🍽️', name: 'Eggs Benedict', 
    eggCost: 6, goldenEggCost: 2, chickenCost: 0, 
    baseTime: 240000, sellPrice: 950 
  },
  truffleOmelet: { 
    icon: '🥚', name: 'Truffle Omelet', 
    eggCost: 5, goldenEggCost: 3, chickenCost: 0, 
    baseTime: 300000, sellPrice: 1200 
  },
  goldenSouffle: { 
    icon: '🥞', name: 'Golden Soufflé', 
    eggCost: 3, goldenEggCost: 5, chickenCost: 0, 
    baseTime: 360000, sellPrice: 1400 
  },
  chickenWellington: { 
    icon: '🥩', name: 'Chicken Wellington', 
    eggCost: 6, goldenEggCost: 2, chickenCost: 4, 
    baseTime: 420000, sellPrice: 1650 
  },
  bbqChickenPlatter: { 
    icon: '🔥', name: 'BBQ Chicken Platter', 
    eggCost: 8, goldenEggCost: 2, chickenCost: 5, 
    baseTime: 480000, sellPrice: 1900 
  },
  imperialBanquet: { 
    icon: '👑', name: 'Imperial Banquet', 
    eggCost: 12, goldenEggCost: 8, chickenCost: 6, 
    baseTime: 600000, sellPrice: 2800 
  }
};

function App() {
  // Refs for game loops and freeze state
  const gameLoopRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const gameFrozenRef = useRef(false);

  // Enhanced Typography System (Compact & Hierarchical)
  const typography = {
    balance: { fontSize: '20px', fontWeight: '800', fontFamily: 'Alan Sans, Arial, sans-serif', letterSpacing: '-0.5px' },
    sectionHeader: { fontSize: '14px', fontWeight: '700', fontFamily: 'Alan Sans, Arial, sans-serif', letterSpacing: '0.5px' },
    cardHeader: { fontSize: '12px', fontWeight: '600', fontFamily: 'Alan Sans, Arial, sans-serif' },
    bodyText: { fontSize: '10px', fontWeight: '500', fontFamily: 'Alan Sans, Arial, sans-serif' },
    secondaryText: { fontSize: '9px', fontWeight: '400', fontFamily: 'Alan Sans, Arial, sans-serif' },
    labelText: { fontSize: '8px', fontWeight: '500', fontFamily: 'Alan Sans, Arial, sans-serif' },
    tinyText: { fontSize: '7px', fontWeight: '400', fontFamily: 'Alan Sans, Arial, sans-serif' },
    button: { fontSize: '9px', fontWeight: '600', fontFamily: 'Alan Sans, Arial, sans-serif' }
  };

  // Clean Orange & Green Theme
  const colors = {
    // Primary Colors - Orange & Green Only
    orange: '#ff6b35',
    orangeLight: '#ff8c69',
    orangeDark: '#e55a2b',
    green: '#10b981',
    greenLight: '#34d399', 
    greenDark: '#059669',
    
    // Neutral Colors
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textLight: '#ffffff',
    
    // Backgrounds - All White
    cardBg: '#ffffff',
    panelBg: '#ffffff',
    sectionBg: '#ffffff',
    
    // Disabled State
    disabled: '#d1d5db',
    disabledText: '#9ca3af',
    
    // Clean Shadows
    shadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    shadowLarge: '0 4px 12px rgba(0, 0, 0, 0.08)',
    
    // Border Radius
    borderRadius: '12px',
    borderRadiusLarge: '16px'
  };

  // Game Started State
  const [gameStarted, setGameStarted] = useState(() => {
    const saved = localStorage.getItem('chickenEmpireState');
    return saved ? true : false;
  });

  // Game State
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('chickenEmpireState');
    const defaultState = {
      money: 20,
      chickens: 3,
      goldenChickens: 0,
      feed: 30,
      eggInventory: 0,
      goldenEggInventory: 0,
      readyEggs: 0,
      readyGoldenEggs: 0,
      lastEggTime: Date.now(),
      lastUpdate: Date.now(),
      products: {},
      productionQueue: [],
      productionSlots: 1,
      cooks: 1,
      kitchenUpgrades: 0,
      breedingQueue: [],
      autoCollector: { isActive: false, remainingTime: 0, level: 1 },
      transactions: [],
      gameDay: 1,
      // Restaurant System
      restaurants: {
        count: 1,
        maxCount: 4,
        counters: { count: 1, maxCount: 3 }
      },
      customerQueue: [],
      activeOrders: [],
      nextCustomerTime: null,
      customerInterval: 120000, // 2 minutes
      completedOrders: 0,
      restaurantUnlocked: false,
      // Auto-Feeder System
      autoFeeder: {
        owned: false,
        isActive: false,
        feedThreshold: 50, // Buy feed when below this amount
        lastPurchaseTime: 0
      }
    };
    
    if (saved) {
      const parsedState = JSON.parse(saved);
      // Merge with default state to ensure all properties exist
      return {
        ...defaultState,
        ...parsedState,
        // Ensure new properties have defaults if not in saved state
        restaurants: parsedState.restaurants || defaultState.restaurants,
        customerQueue: parsedState.customerQueue || [],
        activeOrders: parsedState.activeOrders || [],
        completedOrders: parsedState.completedOrders || 0,
        restaurantUnlocked: parsedState.restaurantUnlocked || false,
        autoFeeder: parsedState.autoFeeder || defaultState.autoFeeder
      };
    }
    
    return defaultState;
  });

  // UI State
  const [showTransactions, setShowTransactions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [gameFrozen, setGameFrozen] = useState(false);
  
  // Animated Chickens State
  const [animatedChickens, setAnimatedChickens] = useState([]);
  
  // Customer Animation State
  const [animatedCustomers, setAnimatedCustomers] = useState([]);

  // Sound Manager
  const [soundManager] = useState(() => new SoundManager());

  // Start New Game Function
  const startNewGame = () => {
    const newGameState = {
      money: 20,
      chickens: 3,
      goldenChickens: 0,
      feed: 30,
      eggInventory: 0,
      goldenEggInventory: 0,
      readyEggs: 0,
      readyGoldenEggs: 0,
      lastEggTime: Date.now(),
      lastUpdate: Date.now(),
      products: {},
      productionQueue: [],
      productionSlots: 1,
      cooks: 1,
      kitchenUpgrades: 0,
      breedingQueue: [],
      autoCollector: { isActive: false, remainingTime: 0, level: 1 },
      transactions: [],
      gameDay: 1,
      // Restaurant System
      restaurants: {
        count: 1,
        maxCount: 4,
        counters: { count: 1, maxCount: 3 }
      },
      customerQueue: [],
      activeOrders: [],
      nextCustomerTime: null,
      customerInterval: 120000, // 2 minutes
      completedOrders: 0,
      restaurantUnlocked: false,
      // Auto-Feeder System
      autoFeeder: {
        owned: false,
        isActive: false,
        feedThreshold: 50,
        lastPurchaseTime: 0
      }
    };
    
    setGameState(newGameState);
    setGameStarted(true);
    localStorage.setItem('chickenEmpireState', JSON.stringify(newGameState));
    
    // Start background music with user interaction (required by browsers)
    setTimeout(async () => {
      await soundManager.initialize();
      if (musicEnabled) {
        soundManager.startBackgroundMusic();
      }
    }, 100);
    
    showFloatingText('🎮 Welcome to Chicken Empire!', colors.green);
  };

  // Initialize game and sound
  useEffect(() => {
    initGame();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  const initGame = async () => {
    await soundManager.initialize();
    
    // Add user interaction handler to start music
    const startMusicOnInteraction = () => {
      if (musicEnabled) {
        soundManager.startBackgroundMusic();
      }
      // Remove the listener after first interaction
      document.removeEventListener('click', startMusicOnInteraction);
      document.removeEventListener('keydown', startMusicOnInteraction);
    };
    
    // Add listeners for user interaction
    document.addEventListener('click', startMusicOnInteraction);
    document.addEventListener('keydown', startMusicOnInteraction);

    // Main game loop
    gameLoopRef.current = setInterval(() => {
      setGameState(prevState => {
        if (gameFrozenRef.current) {
          return prevState;
        }
        
        const now = Date.now();
        const deltaTime = Math.min(now - prevState.lastUpdate, 60000);
        let newState = { ...prevState, lastUpdate: now };

        // Feed consumption
        if (newState.chickens > 0 || newState.goldenChickens > 0) {
          const feedConsumption = ((newState.chickens + newState.goldenChickens) * deltaTime) / 10000;
          newState.feed = Math.max(0, newState.feed - feedConsumption);
        }

        // Complete productions
        newState.productionQueue = newState.productionQueue.filter(item => {
          if (now >= item.endTime) {
            if (!newState.products[item.recipeId]) newState.products[item.recipeId] = 0;
            newState.products[item.recipeId]++;
            return false;
          }
          return true;
        });

        // Complete breeding
        newState.breedingQueue = newState.breedingQueue.filter(item => {
          if (now >= item.endTime) {
            newState.goldenChickens++;
            return false;
          }
          return true;
        });

        // Auto collector - triggers based on egg count thresholds
        if (newState.autoCollector.isActive) {
          newState.autoCollector.remainingTime = Math.max(0, newState.autoCollector.remainingTime - 100);
          if (newState.autoCollector.remainingTime <= 0) {
            newState.autoCollector.isActive = false;
          } else {
            // Define collection thresholds by level
            const getThreshold = (level) => {
              switch(level) {
                case 1: return 15; // Collects when 15 eggs are ready
                case 2: return 12; // Collects when 12 eggs are ready
                case 3: return 9;  // Collects when 9 eggs are ready
                case 4: return 6;  // Collects when 6 eggs are ready
                case 5: return 4;  // Collects when 4 eggs are ready
                default: return Math.max(2, 15 - (level - 1) * 2); // Max level scaling
              }
            };
            
            const eggThreshold = getThreshold(newState.autoCollector.level || 1);
            const totalReadyEggs = newState.readyEggs + newState.readyGoldenEggs;
            
            // Auto-collect when threshold is reached
            if (totalReadyEggs >= eggThreshold) {
              const collectedEggs = newState.readyEggs;
              const collectedGolden = newState.readyGoldenEggs;
              
              newState.eggInventory += newState.readyEggs;
              newState.goldenEggInventory += newState.readyGoldenEggs;
              newState.readyEggs = 0;
              newState.readyGoldenEggs = 0;
              
              // Show notification (throttled to prevent spam)
              const lastNotificationTime = newState.autoCollector.lastNotification || 0;
              if (now - lastNotificationTime > 3000) { // Max one notification per 3 seconds
                showFloatingText(`🤖 Auto-collected ${totalReadyEggs} eggs!`, colors.green);
                newState.autoCollector.lastNotification = now;
              }
            }
          }
        }
        
        // Auto-Feeder - smart feed purchasing system
        if (newState.autoFeeder?.owned && newState.autoFeeder?.isActive) {
          const feedThreshold = newState.autoFeeder?.feedThreshold || 50;
          const timeSinceLastPurchase = now - (newState.autoFeeder?.lastPurchaseTime || 0);
          
          // Check every 10 seconds and when feed is below threshold
          if (newState.feed < feedThreshold && timeSinceLastPurchase > 10000) {
            const optimalPack = getOptimalFeedPack(newState.money, newState.chickens + newState.goldenChickens, newState.feed);
            
            if (optimalPack && newState.money >= optimalPack.cost) {
              // Purchase the optimal feed pack
              newState.money -= optimalPack.cost;
              newState.feed += optimalPack.amount;
              if (newState.autoFeeder) newState.autoFeeder.lastPurchaseTime = now;
              
              // Show notification
              const lastFeedNotification = newState.autoFeeder?.lastFeedNotification || 0;
              if (now - lastFeedNotification > 5000) { // Max one notification per 5 seconds
                showFloatingText(`🤖 Auto-bought ${optimalPack.amount} feed ($${optimalPack.cost})`, colors.orange);
                addTransaction('auto-feed', `Auto-Feeder: ${optimalPack.type} pack`, -optimalPack.cost);
                if (newState.autoFeeder) newState.autoFeeder.lastFeedNotification = now;
              }
            }
          }
        }

        return newState;
      });
    }, 100);

    // Auto-save
    saveIntervalRef.current = setInterval(() => {
      setGameState(currentState => {
        localStorage.setItem('chickenEmpireState', JSON.stringify(currentState));
        return currentState;
      });
    }, 5000);
  };

  // Egg production
  useEffect(() => {
    const eggInterval = setInterval(() => {
      if (gameFrozenRef.current) return;
      
      setGameState(prevState => {
        if (prevState.feed <= 0) return prevState;
        
        let newState = { ...prevState };
        
        // Generate 1 egg at a time from regular chickens
        if (prevState.chickens > 0) {
          newState.readyEggs += 1;
        }
        
        // Generate 1 golden egg at a time from golden chickens
        if (prevState.goldenChickens > 0) {
          newState.readyGoldenEggs += 1;
        }
        
        return newState;
      });
    }, 6000 / (gameState.chickens + gameState.goldenChickens || 1)); // Faster interval based on chicken count

    return () => clearInterval(eggInterval);
  }, [gameState.chickens, gameState.goldenChickens]);

  // Initialize animated chickens when chicken count changes
  useEffect(() => {
    const totalChickens = Math.min(gameState.chickens + gameState.goldenChickens, 10);
    const newChickens = [];
    
    // Add regular chickens
    for (let i = 0; i < Math.min(gameState.chickens, 8); i++) {
      const dx = (Math.random() - 0.5) * 2;
      newChickens.push({
        id: i,
        type: 'regular',
        x: Math.random() * 70 + 15, // Random position between 15% and 85%
        y: Math.random() * 60 + 30, // Random position between 30% and 90%
        dx: dx, // Random horizontal velocity
        dy: (Math.random() - 0.5) * 2, // Random vertical velocity
        facingLeft: dx > 0 // Face left when moving right (flip the image)
      });
    }
    
    // Add golden chickens
    for (let i = 0; i < Math.min(gameState.goldenChickens, 4); i++) {
      const dx = (Math.random() - 0.5) * 2;
      newChickens.push({
        id: 1000 + i, // Different ID range for golden chickens
        type: 'golden',
        x: Math.random() * 70 + 15,
        y: Math.random() * 60 + 30,
        dx: dx,
        dy: (Math.random() - 0.5) * 2,
        facingLeft: dx > 0 // Face left when moving right (flip the image)
      });
    }
    
    setAnimatedChickens(newChickens);
  }, [gameState.chickens, gameState.goldenChickens]);

  // Animate chickens movement
  useEffect(() => {
    if (gameFrozen) return;
    
    const animationInterval = setInterval(() => {
      setAnimatedChickens(prevChickens => 
        prevChickens.map(chicken => {
          let { x, y, dx, dy, facingLeft } = chicken;
          
          // Update position
          x += dx * 0.5;
          y += dy * 0.5;
          
          // Bounce off boundaries and reverse direction
          if (x <= 10 || x >= 85) {
            dx = -dx;
            facingLeft = dx > 0; // Face left when moving right (flip the image)
          }
          if (y <= 25 || y >= 85) {
            dy = -dy;
          }
          
          // Ensure chickens stay within bounds
          x = Math.max(10, Math.min(85, x));
          y = Math.max(25, Math.min(85, y));
          
          // Occasionally change direction randomly
          if (Math.random() < 0.02) {
            dx = (Math.random() - 0.5) * 2;
            dy = (Math.random() - 0.5) * 2;
            facingLeft = dx > 0; // Face left when moving right (flip the image)
          }
          
          return {
            ...chicken,
            x, y, dx, dy, facingLeft
          };
        })
      );
    }, 100); // Update every 100ms for smooth animation
    
    return () => clearInterval(animationInterval);
  }, [gameFrozen, animatedChickens.length]);

  // Restaurant unlock and customer management
  useEffect(() => {
    if (gameState.money >= 5000 && !gameState.restaurantUnlocked) {
      setGameState(prevState => ({
        ...prevState,
        restaurantUnlocked: true,
        activeOrders: prevState.activeOrders || [],
        customerQueue: prevState.customerQueue || [],
        restaurants: prevState.restaurants || {
          count: 1,
          maxCount: 4,
          counters: { count: 1, maxCount: 3 }
        }
      }));
      showFloatingText('🚀 Restaurant Unlocked! Customers will start arriving!', colors.orange);
      showFloatingText('👥 First customer arriving soon...', colors.green);
    }
  }, [gameState.money, gameState.restaurantUnlocked]);

  // Customer generation system - customers join every 10 seconds
  useEffect(() => {
    if (!gameState.restaurantUnlocked || gameFrozen || !gameState.restaurants) return;
    
    const customerGenerationInterval = setInterval(() => {
      setGameState(prevState => {
        // Ensure required properties exist
        if (!prevState.restaurants || !prevState.activeOrders) return prevState;
        
        const maxCapacity = prevState.restaurants.count * prevState.restaurants.counters.count;
        const currentOrders = prevState.activeOrders.length;
        
        // Only add customer if there's capacity
        if (currentOrders < maxCapacity) {
          const newCustomer = generateCustomer();
          const assignedCustomer = assignCustomerToCounter(newCustomer, prevState);
          
          if (assignedCustomer) {
            const newState = {
              ...prevState,
              activeOrders: [...prevState.activeOrders, assignedCustomer]
            };
            
            showFloatingText(`👤 ${assignedCustomer.name} wants ${assignedCustomer.orderName}!`, colors.orange);
            soundManager.playClickSound();
            
            return newState;
          }
        }
        
        return prevState;
      });
    }, 10000); // New customer every 10 seconds
    
    return () => clearInterval(customerGenerationInterval);
  }, [gameState.restaurantUnlocked, gameFrozen]);

  // Order expiration system
  useEffect(() => {
    if (!gameState.restaurantUnlocked || !gameState.activeOrders || gameState.activeOrders.length === 0 || gameFrozen) return;
    
    const expirationCheckInterval = setInterval(() => {
      const now = Date.now();
      
      setGameState(prevState => {
        if (!prevState.activeOrders || !Array.isArray(prevState.activeOrders)) return prevState;
        
        const expiredOrders = prevState.activeOrders.filter(
          order => now - order.arrivalTime > order.timeLimit
        );
        
        if (expiredOrders.length > 0) {
          // Remove expired orders
          const newState = {
            ...prevState,
            activeOrders: prevState.activeOrders.filter(
              order => now - order.arrivalTime <= order.timeLimit
            )
          };
          
          // Show angry customer effects
          expiredOrders.forEach(order => {
            showFloatingText(`💥 ${order.name} left angry!`, '#ef4444');
            addTransaction('missed', `Lost customer: ${order.name}`, -Math.floor(order.value * 0.1));
          });
          
          soundManager.playErrorSound?.();
          
          return newState;
        }
        
        return prevState;
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(expirationCheckInterval);
  }, [gameState.restaurantUnlocked, gameState.activeOrders?.length, gameFrozen]);

  // Customer animation system  
  useEffect(() => {
    if (gameState.activeOrders && Array.isArray(gameState.activeOrders)) {
      const newAnimatedCustomers = gameState.activeOrders.map(order => ({
        id: order.id,
        name: order.name,
        x: 20 + (order.assignedCounter - 1) * 60, // Position based on counter
        y: 50,
        status: order.status
      }));
      
      setAnimatedCustomers(newAnimatedCustomers);
    } else {
      setAnimatedCustomers([]);
    }
  }, [gameState.activeOrders]);

  const showFloatingText = (text, color = '#16a34a') => {
    const id = Date.now() + Math.random();
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2;
    
    setFloatingTexts(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  };

  const addTransaction = (type, description, amount) => {
    const transaction = {
      id: Date.now(),
      type,
      description,
      amount,
      timestamp: new Date().toLocaleTimeString()
    };
    setGameState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions].slice(0, 50)
    }));
  };

  // Game Actions
  const collectEggs = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const totalEggs = prevState.readyEggs + prevState.readyGoldenEggs;
      if (totalEggs === 0) return prevState;
      
      const newState = {
        ...prevState,
        eggInventory: prevState.eggInventory + prevState.readyEggs,
        goldenEggInventory: prevState.goldenEggInventory + prevState.readyGoldenEggs,
        readyEggs: 0,
        readyGoldenEggs: 0
      };
      
      if (prevState.readyEggs > 0) addTransaction('collect', `Collected ${prevState.readyEggs} eggs`, 0);
      if (prevState.readyGoldenEggs > 0) addTransaction('collect', `Collected ${prevState.readyGoldenEggs} golden eggs`, 0);
      showFloatingText(`+${totalEggs} Eggs!`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const sellEggs = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const totalEggs = prevState.eggInventory + prevState.goldenEggInventory;
      if (totalEggs === 0) return prevState;
      
      const earnings = prevState.eggInventory * 2 + prevState.goldenEggInventory * 10;
      const newState = {
        ...prevState,
        money: prevState.money + earnings,
        eggInventory: 0,
        goldenEggInventory: 0
      };
      
      addTransaction('sell', `Sold ${prevState.eggInventory} eggs + ${prevState.goldenEggInventory} golden eggs`, earnings);
      showFloatingText(`+$${earnings}`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const sellProducts = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const hasProducts = Object.values(prevState.products).some(count => count > 0);
      if (!hasProducts) return prevState;
      
      let totalEarnings = 0;
      let productsSold = [];
      
      Object.entries(prevState.products).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          const price = RECIPES[productId].sellPrice * quantity;
          totalEarnings += price;
          productsSold.push(`${quantity}x ${RECIPES[productId].name}`);
        }
      });
      
      const newState = {
        ...prevState,
        money: prevState.money + totalEarnings,
        products: {}
      };
      
      addTransaction('sell', `Sold products: ${productsSold.join(', ')}`, totalEarnings);
      showFloatingText(`+$${totalEarnings}`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const buyChicken = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const cost = 30 + Math.floor(prevState.chickens * 3);
      if (prevState.money < cost) {
        soundManager.playWarningSound();
        return prevState;
      }
      
      const newState = {
        ...prevState,
        money: prevState.money - cost,
        chickens: prevState.chickens + 1
      };
      
      addTransaction('buy', 'Bought regular chicken', -cost);
      showFloatingText(`+1 🐔 Chicken!`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const buyGoldenChicken = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const cost = 1000 + prevState.goldenChickens * 200;
      if (prevState.money < cost) {
        soundManager.playWarningSound();
        return prevState;
      }
      
      const newState = {
        ...prevState,
        money: prevState.money - cost,
        goldenChickens: prevState.goldenChickens + 1
      };
      
      addTransaction('buy', 'Bought golden chicken', -cost);
      showFloatingText(`+1 🐓 Golden Chicken!`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const buyFeed = (size) => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    const costs = { small: 50, large: 250 };
    const amounts = { small: 100, large: 600 };
    
    setGameState(prevState => {
      const cost = costs[size];
      if (prevState.money < cost) {
        soundManager.playWarningSound();
        return prevState;
      }
      
      const newState = {
        ...prevState,
        money: prevState.money - cost,
        feed: prevState.feed + amounts[size]
      };
      
      addTransaction('buy', `Bought ${size} feed pack (+${amounts[size]})`, -cost);
      showFloatingText(`+${amounts[size]} 🌾 Feed!`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const buyCook = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const cost = Math.floor(400 * Math.pow(2.5, prevState.cooks - 1));
      if (prevState.money < cost) {
        soundManager.playWarningSound();
        return prevState;
      }
      
      const newState = {
        ...prevState,
        money: prevState.money - cost,
        cooks: prevState.cooks + 1,
        productionSlots: prevState.cooks + 1
      };
      
      addTransaction('buy', 'Hired new cook', -cost);
      showFloatingText(`+1 👨‍🍳 Cook!`);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  const startProduction = (recipeId) => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    const recipe = RECIPES[recipeId];
    setGameState(prevState => {
      const canProduce = prevState.eggInventory >= recipe.eggCost &&
                        prevState.goldenEggInventory >= recipe.goldenEggCost &&
                        prevState.chickens >= recipe.chickenCost &&
                        prevState.productionQueue.length < prevState.productionSlots;

      if (!canProduce) {
        soundManager.playWarningSound();
        return prevState;
      }

      const productionTime = Math.floor(recipe.baseTime / (1 + prevState.kitchenUpgrades * 0.2));
      const newState = {
        ...prevState,
        eggInventory: prevState.eggInventory - recipe.eggCost,
        goldenEggInventory: prevState.goldenEggInventory - recipe.goldenEggCost,
        chickens: prevState.chickens - recipe.chickenCost,
        productionQueue: [...prevState.productionQueue, {
          id: Date.now(),
          recipeId,
          startTime: Date.now(),
          endTime: Date.now() + productionTime
        }]
      };

      addTransaction('production', `Started cooking ${recipe.name}`, 0);
      showFloatingText(`Cooking ${recipe.name}!`);
      soundManager.playSuccessSound();

      return newState;
    });
  };

  const startBreeding = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      if (prevState.chickens < 3 || prevState.money < 500) {
        soundManager.playWarningSound();
        return prevState;
      }

      const breedingTime = 2 * 60 * 1000; // 2 minutes
      const newState = {
        ...prevState,
        chickens: prevState.chickens - 3,
        money: prevState.money - 500,
        breedingQueue: [...prevState.breedingQueue, {
          id: Date.now(),
          startTime: Date.now(),
          endTime: Date.now() + breedingTime
        }]
      };

      addTransaction('breeding', 'Started breeding chickens (3 → 1 golden)', -500);
      showFloatingText(`Breeding in progress!`);
      soundManager.playSuccessSound();

      return newState;
    });
  };

  // Helper function to get egg threshold by level
  const getEggThreshold = (level) => {
    switch(level) {
      case 1: return 15; // Collects when 15 eggs are ready
      case 2: return 12; // Collects when 12 eggs are ready
      case 3: return 9;  // Collects when 9 eggs are ready
      case 4: return 6;  // Collects when 6 eggs are ready
      case 5: return 4;  // Collects when 4 eggs are ready
      default: return Math.max(2, 15 - (level - 1) * 2); // Max level scaling
    }
  };

  // Auto-Feeder Smart Logic
  const getOptimalFeedPack = (currentMoney, chickenCount, currentFeed) => {
    // Calculate hourly consumption rate
    const feedPerHour = chickenCount * 0.2; // Approx consumption
    const hoursOfFeedLeft = currentFeed / Math.max(feedPerHour, 0.1);
    
    // Define feed pack options (amount, cost, efficiency)
    const feedPacks = [
      { type: 'small', amount: 100, cost: 50, efficiency: 2.0 }, // $0.50 per feed
      { type: 'large', amount: 500, cost: 250, efficiency: 2.0 }, // $0.50 per feed  
      { type: 'bulk', amount: 2000, cost: 800, efficiency: 2.5 } // $0.40 per feed (better value)
    ];
    
    // Filter affordable packs
    const affordablePacks = feedPacks.filter(pack => currentMoney >= pack.cost);
    if (affordablePacks.length === 0) return null;
    
    // Choose pack based on farm size and urgency
    if (hoursOfFeedLeft < 1) {
      // Emergency: buy what we can afford
      return affordablePacks[0]; // Cheapest available
    } else if (chickenCount < 10) {
      // Small farm: small pack is fine
      return affordablePacks.find(p => p.type === 'small') || affordablePacks[0];
    } else if (chickenCount < 50) {
      // Medium farm: large pack preferred
      return affordablePacks.find(p => p.type === 'large') || affordablePacks[affordablePacks.length - 1];
    } else {
      // Large farm: bulk pack for efficiency
      return affordablePacks.find(p => p.type === 'bulk') || affordablePacks[affordablePacks.length - 1];
    }
  };

  const buyAutoFeeder = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      if (prevState.money < 5000) {
        soundManager.playWarningSound();
        return prevState;
      }

      const newState = {
        ...prevState,
        money: prevState.money - 5000,
        autoFeeder: {
          owned: true,
          isActive: true,
          feedThreshold: Math.max(50, prevState.chickens * 5), // Dynamic threshold
          lastPurchaseTime: 0
        }
      };

      addTransaction('buy', 'Bought Auto-Feeder System', -5000);
      showFloatingText(`🤖 Auto-Feeder Active!`);
      showFloatingText(`🎯 Maintains ${newState.autoFeeder?.feedThreshold || 50}+ feed`, colors.green);
      soundManager.playSuccessSound();

      return newState;
    });
  };

  const toggleAutoFeeder = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      if (!prevState.autoFeeder?.owned) return prevState;
      
      const newState = {
        ...prevState,
        autoFeeder: {
          ...prevState.autoFeeder,
          isActive: !prevState.autoFeeder?.isActive
        }
      };
      
      const status = newState.autoFeeder?.isActive ? 'ON' : 'OFF';
      showFloatingText(`🤖 Auto-Feeder ${status}`, colors.orange);
      
      return newState;
    });
  };

  const buyAutoCollector = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      if (prevState.money < 2000) {
        soundManager.playWarningSound();
        return prevState;
      }

      const newState = {
        ...prevState,
        money: prevState.money - 2000,
        autoCollector: {
          isActive: true,
          remainingTime: 5 * 60 * 1000, // 5 minutes
          level: 1,
          lastNotification: 0
        }
      };

      addTransaction('buy', 'Bought Auto Egg Collector', -2000);
      showFloatingText(`🤖 Auto Collector Active!`);
      showFloatingText(`🎯 Collects at ${getEggThreshold(1)} eggs`, colors.green);
      soundManager.playSuccessSound();

      return newState;
    });
  };

  const topUpAutoCollector = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      if (prevState.money < 500 || !prevState.autoCollector.isActive) {
        soundManager.playWarningSound();
        return prevState;
      }

      const newState = {
        ...prevState,
        money: prevState.money - 500,
        autoCollector: {
          ...prevState.autoCollector,
          remainingTime: prevState.autoCollector.remainingTime + (5 * 60 * 1000)
        }
      };

      addTransaction('upgrade', 'Added 5 minutes to Auto Collector', -500);
      showFloatingText(`+5min Auto Collector!`);
      soundManager.playSuccessSound();

      return newState;
    });
  };

  const upgradeAutoCollector = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const cost = 1000 * prevState.autoCollector.level;
      if (prevState.money < cost || !prevState.autoCollector.isActive) {
        soundManager.playWarningSound();
        return prevState;
      }

      const newState = {
        ...prevState,
        money: prevState.money - cost,
        autoCollector: {
          ...prevState.autoCollector,
          level: prevState.autoCollector.level + 1
        }
      };

      addTransaction('upgrade', `Upgraded Auto Collector to Level ${newState.autoCollector.level}`, -cost);
      showFloatingText(`Auto Collector Level ${newState.autoCollector.level}!`);
      showFloatingText(`🎯 Now collects at ${getEggThreshold(newState.autoCollector.level)} eggs`, colors.green);
      soundManager.playSuccessSound();

      return newState;
    });
  };

  const toggleMusic = () => {
    const newState = soundManager.toggleBackgroundMusic();
    setMusicEnabled(newState);
    showFloatingText(newState ? '🎵 Music On' : '🎵 Music Off');
  };

  const toggleGameFreeze = () => {
    const newFrozenState = !gameFrozen;
    setGameFrozen(newFrozenState);
    gameFrozenRef.current = newFrozenState;
    
    if (newFrozenState) {
      showFloatingText('⏸️ Game Frozen!', '#6b7280');
    } else {
      showFloatingText('▶️ Game Resumed!', colors.success);
    }
  };

  const handleResetGame = () => {
    localStorage.removeItem('chickenEmpireState');
    setGameStarted(false);
    setShowResetModal(false);
    const defaultState = {
      money: 20,
      chickens: 3,
      goldenChickens: 0,
      feed: 30,
      eggInventory: 0,
      goldenEggInventory: 0,
      readyEggs: 0,
      readyGoldenEggs: 0,
      lastEggTime: Date.now(),
      lastUpdate: Date.now(),
      products: {},
      productionQueue: [],
      productionSlots: 1,
      cooks: 1,
      kitchenUpgrades: 0,
      breedingQueue: [],
      autoCollector: { isActive: false, remainingTime: 0, level: 1 },
      transactions: [],
      gameDay: 1,
      // Restaurant System
      restaurants: {
        count: 1,
        maxCount: 4,
        counters: { count: 1, maxCount: 3 }
      },
      customerQueue: [],
      activeOrders: [],
      nextCustomerTime: null,
      customerInterval: 120000,
      completedOrders: 0,
      restaurantUnlocked: false
    };
    
    setGameState(defaultState);
    showFloatingText('🔄 Game Reset!', colors.orange);
  };

  // Testing cheat function
  const pumpResources = () => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      const newState = {
        ...prevState,
        money: 500000,
        eggInventory: 50000,
        goldenEggInventory: 50000,
        chickens: 50000,
        goldenChickens: 0,
        feed: 50000,
        cooks: 100,
        restaurants: {
          count: 4,
          maxCount: 4,
          counters: { count: 3, maxCount: 3 }
        },
        restaurantUnlocked: true,
        autoFeeder: {
          owned: true,
          isActive: true,
          feedThreshold: 100,
          lastPurchaseTime: 0
        }
      };
      
      addTransaction('cheat', 'PUMP: Testing resources added!', 0);
      showFloatingText('💪 PUMPED UP!', colors.orange);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  // Customer Management System
  const customerNames = [
    'Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry',
    'Isabella', 'Jake', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul',
    'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander'
  ];

  const generateCustomer = () => {
    const availableRecipes = Object.keys(RECIPES);
    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    const randomName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const recipe = RECIPES[randomRecipe];
    
    // Set customer wait time based on recipe cooking time + 50% buffer
    // This gives players reasonable time to cook and serve
    const cookingTime = recipe.baseTime;
    const bufferTime = cookingTime * 0.5; // 50% buffer
    const totalWaitTime = cookingTime + bufferTime;
    
    return {
      id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: randomName,
      recipe: randomRecipe,
      orderName: recipe.name,
      icon: recipe.icon,
      value: recipe.sellPrice,
      timeLimit: totalWaitTime,
      cookingTime: cookingTime,
      arrivalTime: Date.now(),
      status: 'ordering', // ordering -> cooking_required -> ready_to_serve -> completed/expired
      position: { x: 50, y: 100 }, // Animation position
      assignedCounter: null,
      needsCooking: true // Indicates this order requires cooking before serving
    };
  };

  const assignCustomerToCounter = (customer, gameState) => {
    // Safety checks
    if (!gameState.restaurants || !gameState.activeOrders) return null;
    
    // Find available counter
    const maxCounters = gameState.restaurants.count * gameState.restaurants.counters.count;
    const occupiedCounters = gameState.activeOrders.length;
    
    if (occupiedCounters < maxCounters) {
      return {
        ...customer,
        status: 'ordering',
        assignedCounter: occupiedCounters + 1
      };
    }
    return null; // No available counters
  };

  const completeOrder = (orderId) => {
    if (gameFrozen) { showFloatingText('⏸️ Game is frozen!', '#6b7280'); return; }
    soundManager.playClickSound();
    
    setGameState(prevState => {
      if (!prevState.activeOrders || !Array.isArray(prevState.activeOrders)) return prevState;
      
      const order = prevState.activeOrders.find(o => o.id === orderId);
      if (!order) return prevState;
      
      const recipe = RECIPES[order.recipe];
      if (!recipe) return prevState;
      
      // NEW SYSTEM: Check if we have the cooked product ready
      const availableProduct = prevState.products[order.recipe] || 0;
      if (availableProduct <= 0) {
        showFloatingText(`🍳 ${recipe.name} not ready! Cook it in the Kitchen first.`, '#ef4444');
        soundManager.playWarningSound();
        return prevState;
      }
      
      const newState = {
        ...prevState,
        money: prevState.money + recipe.sellPrice,
        // Use the cooked product instead of raw ingredients
        products: {
          ...prevState.products,
          [order.recipe]: prevState.products[order.recipe] - 1
        },
        activeOrders: prevState.activeOrders.filter(o => o.id !== orderId),
        completedOrders: (prevState.completedOrders || 0) + 1
      };
      
      addTransaction('sale', `Served ${order.name}: ${recipe.name}`, recipe.sellPrice);
      showFloatingText(`+$${recipe.sellPrice} ${order.name} satisfied!`, colors.green);
      soundManager.playSuccessSound();
      
      return newState;
    });
  };

  // Fake Leaderboard Data
  const leaderboardData = [
    { username: "EggMaster9000", valuation: 2847000 },
    { username: "ChickenKing", valuation: 2456000 },
    { username: "GoldenFarmer", valuation: 2234000 },
    { username: "PoultryBoss", valuation: 2012000 },
    { username: "EggTycoon", valuation: 1889000 },
    { username: "FeatherMogul", valuation: 1767000 },
    // ... 44 more entries
    { username: "FarmStarter", valuation: 402000 }
  ];

  // Show start screen if game hasn't started
  if (!gameStarted) {
  return (
      <div style={{ 
        background: colors.sectionBg,
        padding: '16px', 
        minHeight: '100vh',
        fontFamily: 'Alan Sans, Arial, sans-serif',
        position: 'relative',
        width: '100vw',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: colors.cardBg,
          borderRadius: colors.borderRadiusLarge,
          padding: '40px',
          boxShadow: colors.shadowLarge,
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ 
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            🐔
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            fontFamily: 'Alan Sans, Arial, sans-serif',
            color: colors.textPrimary,
            margin: '0 0 10px 0'
          }}>
            CHICKEN EMPIRE TYCOON
          </h1>
          <p style={{
            fontSize: '16px',
            fontFamily: 'Alan Sans, Arial, sans-serif',
            color: colors.textSecondary,
            margin: '0 0 30px 0',
            lineHeight: '1.5'
          }}>
            Build your chicken empire from scratch! Start with 3 chickens, $20, and 30 units of feed. Expand your farm, unlock recipes, and become the ultimate chicken tycoon!
          </p>
          <button 
            onClick={startNewGame}
            style={{
              background: `linear-gradient(135deg, ${colors.green} 0%, ${colors.greenDark} 100%)`,
              color: colors.textLight,
              border: 'none',
              borderRadius: colors.borderRadius,
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              fontFamily: 'Alan Sans, Arial, sans-serif',
              cursor: 'pointer',
              boxShadow: colors.shadowLarge,
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            🚀 Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: colors.sectionBg,
      padding: '8px', 
      minHeight: '100vh',
      fontFamily: 'Alan Sans, Arial, sans-serif',
      position: 'relative',
      width: '100vw',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Custom CSS for hidden scrollbars */}
      <style>
        {`
          .hidden-scrollbar {
            scrollbar-width: thin; /* Firefox - show thin scrollbar */
            -ms-overflow-style: scrollbar; /* IE and Edge */
          }
          .hidden-scrollbar::-webkit-scrollbar {
            width: 6px; /* Chrome, Safari, Opera - show thin scrollbar */
          }
          .hidden-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .hidden-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          .hidden-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
        `}
      </style>
      <div style={{ 
        width: '100%', 
        height: '100%',
        margin: '0',
        opacity: gameFrozen ? 0.7 : 1,
        filter: gameFrozen ? 'grayscale(0.3)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
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

        {/* Clean Modern Header */}
        <div style={{ 
          background: colors.cardBg,
          padding: '12px 16px', 
          borderRadius: colors.borderRadiusLarge,
          marginBottom: '8px',
          boxShadow: colors.shadowLarge,
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: window.innerWidth >= 640 ? 'row' : 'column',
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '16px'
          }}>
            <h1 style={{ 
              ...typography.sectionHeader,
              fontSize: '18px',
              color: colors.textPrimary,
              margin: 0,
              textAlign: window.innerWidth >= 640 ? 'left' : 'center',
              fontWeight: '700'
            }}>
              🐔 CHICKEN EMPIRE TYCOON
            </h1>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button onClick={() => setShowResetModal(true)} style={{
                background: 'rgba(255, 107, 53, 0.1)',
                color: colors.orange, 
                border: `1px solid rgba(255, 107, 53, 0.2)`,
                ...typography.button, 
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                🔄 Reset
              </button>
              
              <button onClick={() => setShowTransactions(!showTransactions)} style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: colors.green,
                border: `1px solid rgba(16, 185, 129, 0.2)`,
                ...typography.button, 
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                📊 Ledger
              </button>
              
              <button onClick={() => setShowLeaderboard(!showLeaderboard)} style={{
                background: 'rgba(255, 107, 53, 0.1)',
                color: colors.orange,
                border: `1px solid rgba(255, 107, 53, 0.2)`,
                ...typography.button, 
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                🏆 Board
              </button>
              
              <button onClick={toggleMusic} style={{
                background: musicEnabled 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(209, 213, 219, 0.1)',
                color: musicEnabled ? colors.green : colors.disabledText,
                border: musicEnabled 
                  ? `1px solid rgba(16, 185, 129, 0.2)` 
                  : `1px solid rgba(209, 213, 219, 0.2)`,
                ...typography.button, 
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                🎵 Music
              </button>
              
              <button onClick={toggleGameFreeze} style={{
                background: gameFrozen 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(255, 107, 53, 0.1)',
                color: gameFrozen ? colors.green : colors.orange,
                border: gameFrozen 
                  ? `1px solid rgba(16, 185, 129, 0.2)` 
                  : `1px solid rgba(255, 107, 53, 0.2)`,
                ...typography.button, 
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                {gameFrozen ? '▶️ Start' : '⏸️ Freeze'}
              </button>
              
              <button onClick={pumpResources} style={{
                background: 'rgba(168, 85, 247, 0.1)',
                color: '#a855f7',
                border: `1px solid rgba(168, 85, 247, 0.2)`,
                ...typography.button, 
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                💪 Pump
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Modal */}
        {showTransactions && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: colors.borderRadiusLarge,
              width: '90%', maxWidth: '600px', maxHeight: '80%',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ ...typography.sectionHeader, margin: 0 }}>📊 Transaction Ledger</h2>
                <button onClick={() => setShowTransactions(false)} style={{
                  background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
                }}>×</button>
              </div>
              <div style={{ padding: '20px', maxHeight: '400px', overflow: 'auto' }}>
                {gameState.transactions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: colors.textSecondary }}>No transactions yet</p>
                ) : (
                  gameState.transactions.map(transaction => (
                    <div key={transaction.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px', marginBottom: '8px',
                      backgroundColor: '#f9fafb', borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ ...typography.bodyText, fontWeight: 'bold' }}>
                          {transaction.description}
                        </div>
                        <div style={{ ...typography.secondaryText, color: colors.textSecondary }}>
                          {transaction.timestamp}
                        </div>
                      </div>
                      <div style={{
                        ...typography.cardHeader,
                        color: transaction.amount >= 0 ? colors.success : colors.error
                      }}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: colors.borderRadiusLarge,
              width: '90%', maxWidth: '600px', maxHeight: '80%',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ ...typography.sectionHeader, margin: 0 }}>🏆 Farm Leaderboard</h2>
                <button onClick={() => setShowLeaderboard(false)} style={{
                  background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
                }}>×</button>
              </div>
              <div style={{ padding: '20px', maxHeight: '400px', overflow: 'auto' }}>
                {leaderboardData.slice(0, 10).map((player, index) => (
                  <div key={index} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px', marginBottom: '8px',
                    backgroundColor: index < 3 ? '#fef3c7' : '#f9fafb',
                    borderRadius: '8px',
                    border: index < 3 ? '2px solid #f59e0b' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ ...typography.cardHeader, minWidth: '30px' }}>
                        {index + 1}{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                      </span>
                      <span style={{ ...typography.bodyText, fontWeight: index < 3 ? 'bold' : 'normal' }}>
                        {player.username}
                      </span>
                    </div>
                    <span style={{
                      ...typography.bodyText,
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: colors.success
                    }}>
                      ${player.valuation.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', 
            zIndex: 100,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: colors.borderRadiusLarge,
              width: '90%', 
              maxWidth: '450px',
              overflow: 'hidden',
              border: `3px solid ${colors.orange}`,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              
              {/* Modal Header */}
              <div style={{
                padding: '24px 24px 16px',
                borderBottom: `2px solid ${colors.orange}20`,
                background: `linear-gradient(135deg, ${colors.orange}10 0%, ${colors.orange}05 100%)`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚠️</div>
                <h2 style={{ 
                  ...typography.sectionHeader, 
                  margin: 0,
                  color: colors.orange,
                  fontSize: '20px'
                }}>
                  Reset Game?
                </h2>
              </div>
              
              {/* Modal Body */}
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{
                  ...typography.bodyText,
                  fontSize: '16px',
                  color: colors.textPrimary,
                  lineHeight: '1.5',
                  margin: '0 0 8px 0'
                }}>
                  This will <strong style={{ color: colors.orange }}>permanently delete</strong> all your progress!
                </p>
                <p style={{
                  ...typography.secondaryText,
                  fontSize: '14px',
                  color: colors.textSecondary,
                  margin: '0 0 24px 0'
                }}>
                  You'll lose all chickens, money, upgrades, and achievements.
                </p>
                
                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={() => setShowResetModal(false)} 
                    style={{
                      background: `linear-gradient(135deg, ${colors.green} 0%, ${colors.greenDark} 100%)`,
                      color: colors.textLight,
                      border: 'none',
                      borderRadius: colors.borderRadius,
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '100px',
                      boxShadow: colors.shadow
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    ✅ Keep Playing
                  </button>
                  
                  <button 
                    onClick={handleResetGame}
                    style={{
                      background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.orangeDark} 100%)`,
                      color: colors.textLight,
                      border: 'none',
                      borderRadius: colors.borderRadius,
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '100px',
                      boxShadow: colors.shadow
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    🔄 Reset Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Content Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '8px',
          gap: '12px'
        }}>
          {/* Enhanced 5-Panel Top Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
            gap: '8px',
            minHeight: '350px',
            maxHeight: '550px'
          }}>

          {/* Stats Panel */}
          <div style={{
            background: colors.cardBg,
            borderRadius: colors.borderRadius,
            padding: '12px',
            boxShadow: colors.shadowLarge,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '550px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '8px', 
              textAlign: 'center',
              color: colors.textPrimary,
              textTransform: 'uppercase',
              flexShrink: 0
            }}>
              Stats
            </div>
            
            <div 
              className="hidden-scrollbar"
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                overflowY: 'auto'
              }}>
              {/* Ready Eggs Card */}
              <div style={{
                background: colors.cardBg,
                border: `2px solid ${colors.green}`,
                borderRadius: colors.borderRadius,
                padding: '8px 12px',
                boxShadow: colors.shadow,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🥚</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textPrimary 
                  }}>Ready</span>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.green 
                }}>{gameState.readyEggs + gameState.readyGoldenEggs}</span>
              </div>
              
              {/* Egg Inventory Card */}
              <div style={{
                background: colors.cardBg,
                border: `2px solid ${colors.green}`,
                borderRadius: colors.borderRadius,
                padding: '8px 12px',
                boxShadow: colors.shadow,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>📦</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textPrimary 
                  }}>Eggs</span>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.green 
                }}>{gameState.eggInventory}</span>
              </div>
              
              {/* Regular Chickens Card */}
              <div style={{
                background: colors.cardBg,
                border: `2px solid ${colors.green}`,
                borderRadius: colors.borderRadius,
                padding: '8px 12px',
                boxShadow: colors.shadow,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🐔</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textPrimary 
                  }}>Chickens</span>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.green 
                }}>{gameState.chickens}</span>
              </div>
              
              {/* Golden Chickens Card */}
              <div style={{
                background: colors.cardBg,
                border: `2px solid ${colors.green}`,
                borderRadius: colors.borderRadius,
                padding: '8px 12px',
                boxShadow: colors.shadow,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🐓</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textPrimary 
                  }}>Golden</span>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.green 
                }}>{gameState.goldenChickens}</span>
              </div>
              
              {/* Feed Card */}
              <div style={{
                background: colors.cardBg,
                border: `2px solid ${colors.green}`,
                borderRadius: colors.borderRadius,
                padding: '8px 12px',
                boxShadow: colors.shadow,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🌾</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textPrimary 
                  }}>Feed</span>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.green 
                }}>{Math.floor(gameState.feed)}</span>
              </div>
              
              {/* Cooks Card */}
              <div style={{
                background: colors.cardBg,
                border: `2px solid ${colors.green}`,
                borderRadius: colors.borderRadius,
                padding: '8px 12px',
                boxShadow: colors.shadow,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>👨‍🍳</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textPrimary 
                  }}>Cooks</span>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.green 
                }}>{gameState.cooks}</span>
              </div>
            </div>
          </div>

          {/* Shop Panel */}
          <div style={{
            background: colors.cardBg,
            borderRadius: colors.borderRadius,
            padding: '12px',
            boxShadow: colors.shadowLarge,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '550px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '8px', 
              textAlign: 'center',
              color: colors.textPrimary,
              textTransform: 'uppercase',
              flexShrink: 0
            }}>
              Shop
            </div>
            <div 
              className="hidden-scrollbar"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '4px'
              }}>
              {/* Regular Chicken */}
              <div onClick={buyChicken} style={{
                background: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) 
                  ? colors.cardBg
                  : '#f3f4f6',
                border: gameState.money >= (30 + Math.floor(gameState.chickens * 3))
                  ? `2px solid ${colors.green}`
                  : 'none',
                borderRadius: colors.borderRadius,
                padding: '12px',
                cursor: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? 'pointer' : 'not-allowed',
                boxShadow: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? colors.shadow : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🐔</span>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? colors.textPrimary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Regular Chicken
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? colors.textSecondary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Lays 1 egg every 6 seconds
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: gameState.money >= (30 + Math.floor(gameState.chickens * 3)) ? colors.green : colors.disabledText,
                  fontFamily: 'Alan Sans, Arial, sans-serif'
                }}>
                  ${30 + Math.floor(gameState.chickens * 3)}
                </div>
              </div>

              {/* Golden Chicken */}
              <div onClick={buyGoldenChicken} style={{
                background: gameState.money >= (1000 + gameState.goldenChickens * 200) 
                  ? colors.cardBg
                  : '#f3f4f6',
                border: gameState.money >= (1000 + gameState.goldenChickens * 200)
                  ? `2px solid ${colors.green}`
                  : 'none',
                borderRadius: colors.borderRadius,
                padding: '12px',
                cursor: gameState.money >= (1000 + gameState.goldenChickens * 200) ? 'pointer' : 'not-allowed',
                boxShadow: gameState.money >= (1000 + gameState.goldenChickens * 200) ? colors.shadow : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🐓</span>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: gameState.money >= (1000 + gameState.goldenChickens * 200) ? colors.textPrimary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Golden Chicken
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: gameState.money >= (1000 + gameState.goldenChickens * 200) ? colors.textSecondary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Lays valuable golden eggs
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: gameState.money >= (1000 + gameState.goldenChickens * 200) ? colors.green : colors.disabledText,
                  fontFamily: 'Alan Sans, Arial, sans-serif'
                }}>
                  ${1000 + gameState.goldenChickens * 200}
                </div>
              </div>

              {/* Small Feed Pack */}
              <div onClick={() => buyFeed('small')} style={{
                background: gameState.money >= 50 ? colors.cardBg : '#f3f4f6',
                border: gameState.money >= 50 ? `2px solid ${colors.green}` : 'none',
                borderRadius: colors.borderRadius,
                padding: '12px',
                cursor: gameState.money >= 50 ? 'pointer' : 'not-allowed',
                boxShadow: gameState.money >= 50 ? colors.shadow : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🌾</span>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: gameState.money >= 50 ? colors.textPrimary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Small Feed Pack
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: gameState.money >= 50 ? colors.textSecondary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      100 units of feed ($0.50/unit)
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: gameState.money >= 50 ? colors.green : colors.disabledText,
                  fontFamily: 'Alan Sans, Arial, sans-serif'
                }}>
                  $50
                </div>
              </div>

              {/* Large Feed Pack */}
              <div onClick={() => buyFeed('large')} style={{
                background: gameState.money >= 250 ? colors.cardBg : '#f3f4f6',
                border: gameState.money >= 250 ? `2px solid ${colors.green}` : 'none',
                borderRadius: colors.borderRadius,
                padding: '12px',
                cursor: gameState.money >= 250 ? 'pointer' : 'not-allowed',
                boxShadow: gameState.money >= 250 ? colors.shadow : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🌾</span>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: gameState.money >= 250 ? colors.textPrimary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Large Feed Pack
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: gameState.money >= 250 ? colors.textSecondary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      500 units of feed ($0.50/unit)
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: gameState.money >= 250 ? colors.green : colors.disabledText,
                  fontFamily: 'Alan Sans, Arial, sans-serif'
                }}>
                  $250
                </div>
              </div>

              {/* Cook */}
              <div onClick={buyCook} style={{
                background: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) 
                  ? colors.cardBg : '#f3f4f6',
                border: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1))
                  ? `2px solid ${colors.green}` : 'none',
                borderRadius: colors.borderRadius,
                padding: '12px',
                cursor: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? 'pointer' : 'not-allowed',
                boxShadow: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? colors.shadow : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👨‍🍳</span>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? colors.textPrimary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Hire Cook
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? colors.textSecondary : colors.disabledText,
                      fontFamily: 'Alan Sans, Arial, sans-serif'
                    }}>
                      Adds production slot
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: gameState.money >= Math.floor(400 * Math.pow(2.5, gameState.cooks - 1)) ? colors.green : colors.disabledText,
                  fontFamily: 'Alan Sans, Arial, sans-serif'
                }}>
                  ${Math.floor(400 * Math.pow(2.5, gameState.cooks - 1))}
                </div>
              </div>

              {/* Breeding (conditional) */}
              {gameState.chickens >= 3 && gameState.money >= 500 && (
                <div onClick={startBreeding} style={{
                  background: colors.cardBg,
                  border: `2px solid ${colors.green}`,
                  borderRadius: colors.borderRadius,
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: colors.shadow,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>💕</span>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: colors.textPrimary,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Breed Golden Chicken
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: colors.textSecondary,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        3 chickens → 1 golden chicken (2 min)
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: colors.green,
                    fontFamily: 'Alan Sans, Arial, sans-serif'
                  }}>
                    $500
                  </div>
                </div>
              )}

              {/* Auto Collector */}
              {!gameState.autoCollector.isActive && (
                <div onClick={buyAutoCollector} style={{
                  background: gameState.money >= 2000 ? colors.cardBg : '#f3f4f6',
                  border: gameState.money >= 2000 ? `2px solid ${colors.green}` : 'none',
                  borderRadius: colors.borderRadius,
                  padding: '12px',
                  cursor: gameState.money >= 2000 ? 'pointer' : 'not-allowed',
                  boxShadow: gameState.money >= 2000 ? colors.shadow : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🤖</span>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: gameState.money >= 2000 ? colors.textPrimary : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Auto Egg Collector
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: gameState.money >= 2000 ? colors.textSecondary : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Level 1: Collects when 15 eggs are ready
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: gameState.money >= 2000 ? colors.green : colors.disabledText,
                    fontFamily: 'Alan Sans, Arial, sans-serif'
                  }}>
                    $2000
                  </div>
                </div>
              )}

              {/* Auto Collector Top-up */}
              {gameState.autoCollector.isActive && (
                <div onClick={topUpAutoCollector} style={{
                  background: gameState.money >= 500 ? colors.cardBg : '#f3f4f6',
                  border: gameState.money >= 500 ? `2px solid ${colors.green}` : 'none',
                  borderRadius: colors.borderRadius,
                  padding: '12px',
                  cursor: gameState.money >= 500 ? 'pointer' : 'not-allowed',
                  boxShadow: gameState.money >= 500 ? colors.shadow : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⏰</span>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: gameState.money >= 500 ? colors.textPrimary : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Extend Collection Time
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: gameState.money >= 500 ? colors.textSecondary : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Add 5 more minutes
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: gameState.money >= 500 ? colors.green : colors.disabledText,
                    fontFamily: 'Alan Sans, Arial, sans-serif'
                  }}>
                    $500
                  </div>
                </div>
              )}

              {/* Auto-Feeder */}
              {!gameState.autoFeeder?.owned && (
                <div onClick={buyAutoFeeder} style={{
                  background: gameState.money >= 5000 ? colors.cardBg : '#f3f4f6',
                  border: gameState.money >= 5000 ? `2px solid ${colors.orange}` : 'none',
                  borderRadius: colors.borderRadius,
                  padding: '12px',
                  cursor: gameState.money >= 5000 ? 'pointer' : 'not-allowed',
                  boxShadow: gameState.money >= 5000 ? colors.shadow : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🍽️</span>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: gameState.money >= 5000 ? colors.textPrimary : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Auto-Feeder System
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: gameState.money >= 5000 ? colors.textSecondary : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Smart feed purchasing - works forever!
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: gameState.money >= 5000 ? colors.orange : colors.disabledText,
                    fontFamily: 'Alan Sans, Arial, sans-serif'
                  }}>
                    $5000
                  </div>
                </div>
              )}

              {/* Auto-Feeder Controls */}
              {gameState.autoFeeder?.owned && (
                <div onClick={toggleAutoFeeder} style={{
                  background: colors.cardBg,
                  border: `2px solid ${gameState.autoFeeder?.isActive ? colors.green : colors.orange}`,
                  borderRadius: colors.borderRadius,
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: colors.shadow,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🍽️</span>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: colors.textPrimary,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Auto-Feeder: {gameState.autoFeeder?.isActive ? 'ON' : 'OFF'}
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: colors.textSecondary,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        Buys feed when below {gameState.autoFeeder?.feedThreshold || 50} units
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '700',
                    color: gameState.autoFeeder?.isActive ? colors.green : colors.orange,
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    padding: '4px 8px',
                    background: gameState.autoFeeder?.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 107, 53, 0.1)',
                    borderRadius: '4px'
                  }}>
                    {gameState.autoFeeder?.isActive ? '▶️ STOP' : '🔄 START'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Indicators */}
            <div style={{ 
              marginTop: '8px',
              flexShrink: 0
            }}>
              {gameState.autoCollector.isActive && (
                <div style={{ 
                  ...typography.labelText, 
                  marginBottom: '3px', 
                  textAlign: 'center', 
                  color: colors.textSecondary,
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  🤖 Level {gameState.autoCollector.level} - Collects at {getEggThreshold(gameState.autoCollector.level)} eggs - {Math.floor(gameState.autoCollector.remainingTime / 60000)}:{String(Math.floor((gameState.autoCollector.remainingTime % 60000) / 1000)).padStart(2, '0')}
                </div>
              )}
              
              {gameState.autoFeeder?.owned && gameState.autoFeeder?.isActive && (
                <div style={{ 
                  ...typography.labelText, 
                  marginBottom: '3px', 
                  textAlign: 'center', 
                  color: colors.textSecondary,
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  🍽️ Auto-Feeder: Maintains {gameState.autoFeeder?.feedThreshold || 50}+ feed
                </div>
              )}
              
              {gameState.breedingQueue.length > 0 && (
                <div style={{ 
                  ...typography.labelText, 
                  textAlign: 'center', 
                  color: colors.textSecondary,
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  💕 Breeding: {Math.ceil((gameState.breedingQueue[0].endTime - Date.now()) / 1000)}s
                </div>
              )}
            </div>
          </div>

          {/* Modern Balance Panel */}
          <div style={{
            background: colors.cardBg,
            borderRadius: colors.borderRadius,
            padding: '16px',
            textAlign: 'center',
            boxShadow: colors.shadowLarge,
            maxHeight: '550px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '8px',
              color: colors.textPrimary,
              textTransform: 'uppercase'
            }}>
              Balance
            </div>
            <div style={{ 
              ...typography.balance, 
              color: colors.textPrimary, 
              marginBottom: '16px',
              fontWeight: '800'
            }}>
              ${gameState.money.toLocaleString()}
            </div>
            
            {/* Collect Button - Orange like in the image */}
            <button onClick={collectEggs} disabled={gameState.readyEggs + gameState.readyGoldenEggs === 0} style={{
              background: (gameState.readyEggs + gameState.readyGoldenEggs) > 0 
                ? `linear-gradient(135deg, ${colors.orange} 0%, ${colors.orangeDark} 100%)` 
                : `linear-gradient(135deg, ${colors.disabled} 0%, ${colors.disabledText} 100%)`,
              color: colors.textLight,
              border: 'none',
              borderRadius: colors.borderRadius,
              padding: '12px 16px',
              width: '100%',
              marginBottom: '8px',
              cursor: (gameState.readyEggs + gameState.readyGoldenEggs) > 0 ? 'pointer' : 'not-allowed',
              boxShadow: colors.shadow,
              transition: 'all 0.2s ease',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Alan Sans, Arial, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>
                {(gameState.readyEggs + gameState.readyGoldenEggs).toLocaleString()} 🥚 Ready
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>
                Collect
              </div>
            </button>
            
            {/* Sell Eggs Button - Green like in the image */}
            <button onClick={sellEggs} disabled={gameState.eggInventory + gameState.goldenEggInventory === 0} style={{
              background: (gameState.eggInventory + gameState.goldenEggInventory) > 0 
                ? `linear-gradient(135deg, ${colors.green} 0%, ${colors.greenDark} 100%)` 
                : `linear-gradient(135deg, ${colors.disabled} 0%, ${colors.disabledText} 100%)`,
              color: colors.textLight,
              border: 'none',
              borderRadius: colors.borderRadius,
              padding: '12px 16px',
              width: '100%',
              marginBottom: '8px',
              cursor: (gameState.eggInventory + gameState.goldenEggInventory) > 0 ? 'pointer' : 'not-allowed',
              boxShadow: colors.shadow,
              transition: 'all 0.2s ease',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Alan Sans, Arial, sans-serif',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '700' }}>Sell Eggs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>
                ${((gameState.eggInventory * 2) + (gameState.goldenEggInventory * 10)).toLocaleString()}.00 total
              </span>
            </button>
            
            {/* Sell Products Button - Green like in the image */}
            <button onClick={sellProducts} disabled={Object.values(gameState.products).every(count => count === 0)} style={{
              background: Object.values(gameState.products).some(count => count > 0) 
                ? `linear-gradient(135deg, ${colors.green} 0%, ${colors.greenDark} 100%)` 
                : `linear-gradient(135deg, ${colors.disabled} 0%, ${colors.disabledText} 100%)`,
              color: colors.textLight,
              border: 'none',
              borderRadius: colors.borderRadius,
              padding: '12px 16px',
              width: '100%',
              cursor: Object.values(gameState.products).some(count => count > 0) ? 'pointer' : 'not-allowed',
              boxShadow: colors.shadow,
              transition: 'all 0.2s ease',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Alan Sans, Arial, sans-serif',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '700' }}>Sell Products</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>
                ${Object.entries(gameState.products).reduce((total, [id, qty]) => {
                  return total + (qty * RECIPES[id].sellPrice);
                }, 0).toLocaleString()}.00 total
              </span>
            </button>
          </div>

          {/* Kitchen Panel */}
          <div style={{
            background: colors.cardBg,
            borderRadius: colors.borderRadius,
            padding: '12px',
            boxShadow: colors.shadowLarge,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '550px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '6px', 
              textAlign: 'center',
              color: colors.textPrimary,
              textTransform: 'uppercase',
              flexShrink: 0
            }}>
              Kitchen
            </div>
            <div style={{ 
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Alan Sans, Arial, sans-serif',
              marginBottom: '6px', 
              textAlign: 'center',
              background: 'rgba(255, 107, 53, 0.1)',
              padding: '4px 6px',
              borderRadius: '3px',
              color: colors.orange,
              flexShrink: 0
            }}>
              Slots: {gameState.productionQueue.length}/{gameState.productionSlots}
            </div>
            
            {/* Scrollable Kitchen Content */}
            <div 
              className="hidden-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '4px',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Production Queue */}
              {gameState.productionQueue.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  {gameState.productionQueue.map(item => {
                    const recipe = RECIPES[item.recipeId];
                    const remaining = Math.max(0, item.endTime - Date.now());
                    return (
                      <div key={item.id} style={{ 
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'Alan Sans, Arial, sans-serif',
                        marginBottom: '3px', 
                        padding: '4px 6px', 
                        background: 'rgba(255, 107, 53, 0.1)', 
                        borderRadius: '3px',
                        color: colors.orange
                      }}>
                        {recipe.icon} {Math.ceil(remaining / 1000)}s
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Products */}
              {Object.values(gameState.products).some(qty => qty > 0) && (
                <div style={{ marginBottom: '8px' }}>
                  {Object.entries(gameState.products).filter(([_, qty]) => qty > 0).map(([id, qty]) => (
                    <div key={id} style={{ 
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      marginBottom: '2px',
                      color: colors.green
                    }}>
                      {RECIPES[id].icon} {qty}x
                    </div>
                  ))}
                </div>
              )}
              
              {/* Recipe Selection */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  marginBottom: '4px',
                  color: colors.textPrimary
                }}>
                  Recipes:
                </div>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                {Object.entries(RECIPES).map(([recipeId, recipe]) => {
                  const canProduce = gameState.eggInventory >= recipe.eggCost &&
                                   gameState.goldenEggInventory >= recipe.goldenEggCost &&
                                   gameState.chickens >= recipe.chickenCost &&
                                   gameState.productionQueue.length < gameState.productionSlots;

                  return (
                    <div
                      key={recipeId}
                      onClick={() => canProduce && startProduction(recipeId)}
                      style={{ 
                        width: '100%',
                        background: canProduce ? colors.cardBg : '#f3f4f6',
                        border: canProduce ? `2px solid ${colors.green}` : 'none',
                        borderRadius: colors.borderRadius,
                        padding: '10px',
                        marginBottom: '4px',
                        cursor: canProduce ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: canProduce ? colors.shadow : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{recipe.icon}</span>
                        <div>
                          <div style={{ 
                            fontSize: '12px', 
                            fontWeight: '600',
                            color: canProduce ? colors.textPrimary : colors.disabledText,
                            fontFamily: 'Alan Sans, Arial, sans-serif'
                          }}>
                            {recipe.name}
                          </div>
                          <div style={{ 
                            fontSize: '10px', 
                            color: canProduce ? colors.textSecondary : colors.disabledText,
                            fontFamily: 'Alan Sans, Arial, sans-serif'
                          }}>
                            {recipe.eggCost > 0 && `🥚${recipe.eggCost}`}
                            {recipe.goldenEggCost > 0 && ` 🐓${recipe.goldenEggCost}`}
                            {recipe.chickenCost > 0 && ` 🐔${recipe.chickenCost}`}
                            {` ⏱${Math.floor(recipe.baseTime / 1000)}s`}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '700',
                        color: canProduce ? colors.green : colors.disabledText,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        ${recipe.sellPrice}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </div>

          {/* Orders Panel */}
          <div style={{
            background: gameState.money >= 5000 ? colors.cardBg : '#f3f4f6',
            borderRadius: colors.borderRadius,
            padding: '12px',
            boxShadow: gameState.money >= 5000 ? colors.shadowLarge : 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '550px',
            overflow: 'hidden',
            opacity: gameState.money >= 5000 ? 1 : 0.6,
            border: gameState.money >= 5000 ? 'none' : `2px dashed ${colors.disabled}`,
            position: 'relative'
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '8px', 
              textAlign: 'center',
              color: gameState.money >= 5000 ? colors.textPrimary : colors.disabledText,
              textTransform: 'uppercase',
              flexShrink: 0
            }}>
              Orders
            </div>
            
            {!gameState.restaurantUnlocked ? (
              // Locked Orders Content
              <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '20px 0'
              }}>
                <div style={{ 
                  fontSize: '48px',
                  marginBottom: '16px',
                  filter: 'grayscale(100%)'
                }}>
                  🔒
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.disabledText,
                  marginBottom: '8px'
                }}>
                  ORDERS CLOSED
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.textSecondary,
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  Customer orders are available with McChaki's Restaurant
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  borderRadius: colors.borderRadius,
                  padding: '8px 12px',
                  display: 'inline-block'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textSecondary
                  }}>
                    🍽️ Unlock at: <span style={{ color: colors.orange, fontWeight: '700' }}>${(5000).toLocaleString()}</span>
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textSecondary,
                    marginTop: '2px'
                  }}>
                    Current: ${gameState.money.toLocaleString()} | Need: ${(5000 - gameState.money).toLocaleString()} more
                  </div>
                </div>
              </div>
            ) : (
              // Unlocked Orders Content
              <div 
                className="hidden-scrollbar"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  paddingRight: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                {gameState.activeOrders.length > 0 ? (
                  // Display real active orders
                  gameState.activeOrders.map((order) => {
                    const timeLeft = Math.max(0, order.timeLimit - (Date.now() - order.arrivalTime));
                    const minutes = Math.floor(timeLeft / 60000);
                    const seconds = Math.floor((timeLeft % 60000) / 1000);
                    const isUrgent = timeLeft < 60000; // Less than 1 minute
                    
                    // Check if recipe is cooked and ready
                    const availableProduct = gameState.products[order.recipe] || 0;
                    const isReady = availableProduct > 0;
                    const isCurrentlyCooking = gameState.productionQueue.some(item => item.recipeId === order.recipe);
                    
                    let statusColor = colors.green;
                    let statusText = 'Ready to Serve ✅';
                    let bgColor = colors.cardBg;
                    
                    if (!isReady) {
                      if (isCurrentlyCooking) {
                        statusColor = colors.orange;
                        statusText = 'Cooking... 🍳';
                        bgColor = 'rgba(255, 107, 53, 0.1)';
                      } else {
                        statusColor = '#ef4444';
                        statusText = 'Need to Cook 🔥';
                        bgColor = 'rgba(239, 68, 68, 0.1)';
                      }
                    }
                    
                    if (isUrgent) {
                      bgColor = 'rgba(239, 68, 68, 0.2)';
                    }
                    
                    return (
                      <div key={order.id} style={{
                        padding: '8px',
                        marginBottom: '6px',
                        background: bgColor,
                        borderRadius: colors.borderRadius,
                        boxShadow: isUrgent ? '0 2px 8px rgba(239, 68, 68, 0.3)' : colors.shadow,
                        border: `2px solid ${statusColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        animation: isUrgent ? 'pulse-red 2s ease-in-out infinite' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>{order.icon}</span>
                          <div>
                            <div style={{ 
                              fontSize: '11px', 
                              fontWeight: '600',
                              color: colors.textPrimary,
                              fontFamily: 'Alan Sans, Arial, sans-serif'
                            }}>
                              {order.name}
                            </div>
                            <div style={{
                              fontSize: '9px',
                              color: colors.textSecondary,
                              fontFamily: 'Alan Sans, Arial, sans-serif',
                              marginBottom: '2px'
                            }}>
                              {order.orderName}
                            </div>
                            <div style={{
                              fontSize: '8px',
                              color: statusColor,
                              fontFamily: 'Alan Sans, Arial, sans-serif',
                              fontWeight: '600'
                            }}>
                              {statusText}
                            </div>
                            <div style={{
                              fontSize: '7px',
                              color: isUrgent ? '#ef4444' : colors.textSecondary,
                              fontFamily: 'Alan Sans, Arial, sans-serif',
                              marginTop: '2px'
                            }}>
                              {isUrgent ? '🔥 URGENT' : `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontSize: '12px', 
                            fontWeight: '700',
                            color: isUrgent ? '#ef4444' : colors.green,
                            fontFamily: 'Alan Sans, Arial, sans-serif',
                            marginBottom: '4px'
                          }}>
                            ${order.value}
                          </div>
                          <button
                            onClick={() => completeOrder(order.id)}
                            disabled={!isReady}
                            style={{
                              background: isReady 
                                ? `linear-gradient(135deg, ${colors.green} 0%, ${colors.greenDark} 100%)` 
                                : `linear-gradient(135deg, ${colors.disabled} 0%, ${colors.disabledText} 100%)`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '8px',
                              fontFamily: 'Alan Sans, Arial, sans-serif',
                              fontWeight: '600',
                              cursor: isReady ? 'pointer' : 'not-allowed',
                              boxShadow: isReady ? colors.shadow : 'none',
                              transition: 'all 0.2s ease',
                              textTransform: 'uppercase',
                              opacity: isReady ? 1 : 0.6
                            }}
                            onMouseOver={(e) => {
                              if (isReady) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = colors.shadowLarge;
                              }
                            }}
                            onMouseOut={(e) => {
                              if (isReady) {
                                e.target.style.transform = 'translateY(0px)';
                                e.target.style.boxShadow = colors.shadow;
                              }
                            }}
                          >
                            {isReady ? '✅ Serve' : (isCurrentlyCooking ? '🍳 Cooking' : '🔥 Cook First')}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // No orders message
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}>
                    <div style={{ 
                      fontSize: '48px',
                      marginBottom: '12px',
                      opacity: 0.5
                    }}>
                      🕰️
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.textSecondary,
                      marginBottom: '6px'
                    }}>
                      No Active Orders
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.textSecondary,
                      lineHeight: '1.4',
                      opacity: 0.8
                    }}>
                      Customers will arrive soon!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

          {/* Enhanced 2-Panel Bottom Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            minHeight: '280px'
          }}>
          
          {/* Farm Visual Panel */}
          <div style={{
            background: colors.cardBg,
            borderRadius: colors.borderRadius,
            padding: '12px',
            boxShadow: colors.shadowLarge
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '8px', 
              textAlign: 'center',
              color: colors.textPrimary,
              textTransform: 'uppercase'
            }}>
              Farm Visual
            </div>
            
            {/* Enhanced Farm Area */}
            <div style={{ 
              position: 'relative',
              height: '280px',
              background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 40%, #90EE90 80%, #8FBC8F 100%)',
              borderRadius: colors.borderRadius,
              overflow: 'hidden',
              border: `3px solid #8B4513`,
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              
              {/* Sky Elements */}
              <div style={{ position: 'absolute', left: '10%', top: '8%', fontSize: '16px' }}>☀️</div>
              <div style={{ position: 'absolute', right: '15%', top: '5%', fontSize: '14px' }}>☁️</div>
              <div style={{ position: 'absolute', right: '5%', top: '15%', fontSize: '12px' }}>☁️</div>
              
              {/* Farm Buildings */}
              <div style={{ 
                position: 'absolute', 
                left: '5%', 
                top: '15%', 
                fontSize: '28px',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }}>🏠</div>
              <div style={{ 
                position: 'absolute', 
                right: '8%', 
                top: '20%', 
                fontSize: '20px',
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
              }}>🌾</div>
              <div style={{ 
                position: 'absolute', 
                left: '75%', 
                bottom: '20%', 
                fontSize: '18px',
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
              }}>🌳</div>
              <div style={{ 
                position: 'absolute', 
                left: '20%', 
                bottom: '10%', 
                fontSize: '14px' 
              }}>🌻</div>
              <div style={{ 
                position: 'absolute', 
                right: '25%', 
                bottom: '35%', 
                fontSize: '12px' 
              }}>🌸</div>
              
              {/* Animated Chicken Sprites */}
              {animatedChickens.map((chicken) => (
                <img
                  key={`chicken-${chicken.id}`}
                  src="https://www.animatedimages.org/data/media/532/animated-chicken-image-0023.gif"
                  alt={`Animated ${chicken.type === 'golden' ? 'Golden ' : ''}Chicken`}
                  style={{
                    position: 'absolute',
                    left: `${chicken.x}%`,
                    top: `${chicken.y}%`,
                    width: chicken.type === 'golden' ? '45px' : '40px',
                    height: chicken.type === 'golden' ? '45px' : '40px',
                    transform: `${chicken.facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} ${chicken.type === 'golden' ? 'hue-rotate(45deg) saturate(1.5) brightness(1.2)' : ''}`,
                    filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) ${chicken.type === 'golden' ? 'drop-shadow(0 0 8px gold)' : ''}`,
                    transition: 'left 0.1s ease-out, top 0.1s ease-out',
                    zIndex: chicken.type === 'golden' ? 15 : 10,
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              ))}

              
            </div>
            
            <div style={{ 
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Alan Sans, Arial, sans-serif',
              textAlign: 'center', 
              marginTop: '8px', 
              color: colors.textSecondary,
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              🐔 <span style={{ color: colors.green, fontWeight: '700' }}>{gameState.chickens}</span> Regular • 🐓 <span style={{ color: colors.orange, fontWeight: '700' }}>{gameState.goldenChickens}</span> Golden • Day <span style={{ color: colors.textPrimary, fontWeight: '700' }}>{gameState.gameDay}</span>
            </div>
            
          </div>

          {/* McChaki's Restaurant Panel */}
          <div style={{
            background: gameState.money >= 5000 ? colors.cardBg : '#f3f4f6',
            borderRadius: colors.borderRadius,
            padding: '12px',
            boxShadow: gameState.money >= 5000 ? colors.shadowLarge : 'none',
            opacity: gameState.money >= 5000 ? 1 : 0.6,
            border: gameState.money >= 5000 ? 'none' : `2px dashed ${colors.disabled}`,
            position: 'relative'
          }}>
            <div style={{ 
              ...typography.sectionHeader, 
              marginBottom: '8px', 
              textAlign: 'center',
              color: gameState.money >= 5000 ? colors.textPrimary : colors.disabledText,
              textTransform: 'uppercase'
            }}>
              McChaki's Restaurant
            </div>

            {!gameState.restaurantUnlocked ? (
              // Locked Restaurant Content
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ 
                  fontSize: '48px',
                  marginBottom: '16px',
                  filter: 'grayscale(100%)'
                }}>
                  🔒
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.disabledText,
                  marginBottom: '8px'
                }}>
                  RESTAURANT CLOSED
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'Alan Sans, Arial, sans-serif',
                  color: colors.textSecondary,
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  Expand your chicken empire to unlock McChaki's Restaurant
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: colors.borderRadius,
                  padding: '8px 12px',
                  display: 'inline-block'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textSecondary
                  }}>
                    💰 Unlock at: <span style={{ color: colors.green, fontWeight: '700' }}>${(5000).toLocaleString()}</span>
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.textSecondary,
                    marginTop: '2px'
                  }}>
                    Current: ${gameState.money.toLocaleString()} | Need: ${(5000 - gameState.money).toLocaleString()} more
                  </div>
                </div>
              </div>
            ) : (
              // Unlocked Restaurant System
              <>
                {/* Restaurant Status Header */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.orangeDark} 100%)`,
                  borderRadius: colors.borderRadius,
                  padding: '8px',
                  textAlign: 'center',
                  color: 'white',
                  marginBottom: '12px',
                  boxShadow: colors.shadow
                }}>
                  <div style={{ 
                    fontSize: '10px',
                    fontWeight: '600',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    🏪 {gameState.restaurants.count}/{gameState.restaurants.maxCount} Restaurants • 🧑‍🍳 {gameState.restaurants.count * gameState.restaurants.counters.count} Counters • 👥 {gameState.activeOrders.length} Orders
                  </div>
                </div>

                {/* Restaurants Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '4px',
                  marginBottom: '12px'
                }}>
                  {Array.from({ length: 4 }, (_, restaurantIndex) => {
                    const isUnlocked = restaurantIndex < gameState.restaurants.count;
                    return (
                      <div key={restaurantIndex} style={{
                        background: isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(209, 213, 219, 0.1)',
                        borderRadius: colors.borderRadius,
                        padding: '8px',
                        border: isUnlocked ? `2px solid ${colors.green}` : `1px dashed ${colors.disabled}`,
                        opacity: isUnlocked ? 1 : 0.6
                      }}>
                        <div style={{
                          fontSize: '16px',
                          textAlign: 'center',
                          marginBottom: '4px'
                        }}>
                          {isUnlocked ? '🏪' : '🔒'}
                        </div>
                        
                        {/* Counters for this restaurant */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '2px'
                        }}>
                          {Array.from({ length: 3 }, (_, counterIndex) => {
                            const globalCounterIndex = restaurantIndex * 3 + counterIndex;
                            const isCounterUnlocked = isUnlocked && counterIndex < gameState.restaurants.counters.count;
                            const hasOrder = gameState.activeOrders.some(order => 
                              order.assignedCounter === globalCounterIndex + 1
                            );
                            
                            return (
                              <div key={counterIndex} style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '2px',
                                background: !isCounterUnlocked ? colors.disabled : 
                                          hasOrder ? colors.orange : colors.green,
                                border: `1px solid ${!isCounterUnlocked ? colors.disabled : 
                                                    hasOrder ? colors.orangeDark : colors.greenDark}`,
                                fontSize: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {hasOrder ? '🧑‍🍳' : (isCounterUnlocked ? '✓' : '🔒')}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div style={{
                          fontSize: '8px',
                          fontFamily: 'Alan Sans, Arial, sans-serif',
                          textAlign: 'center',
                          color: colors.textSecondary,
                          marginTop: '2px'
                        }}>
                          {isUnlocked ? `R${restaurantIndex + 1}` : 'LOCKED'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Orders Display */}
                {gameState.activeOrders.length > 0 ? (
                  <div style={{
                    background: 'rgba(255, 107, 53, 0.1)',
                    borderRadius: colors.borderRadius,
                    padding: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.orange,
                      marginBottom: '6px',
                      textAlign: 'center'
                    }}>
                      🍽️ ACTIVE ORDERS
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}>
                      {gameState.activeOrders.map(order => {
                        const timeLeft = Math.max(0, order.timeLimit - (Date.now() - order.arrivalTime));
                        const minutes = Math.floor(timeLeft / 60000);
                        const seconds = Math.floor((timeLeft % 60000) / 1000);
                        const isUrgent = timeLeft < 60000; // Less than 1 minute
                        
                        // Check cooking status for mini display
                        const availableProduct = gameState.products[order.recipe] || 0;
                        const isReady = availableProduct > 0;
                        const isCurrentlyCooking = gameState.productionQueue.some(item => item.recipeId === order.recipe);
                        
                        let statusColor = isUrgent ? '#ef4444' : colors.green;
                        if (!isReady) {
                          statusColor = isCurrentlyCooking ? colors.orange : '#ef4444';
                        }
                        
                        return (
                          <div key={order.id} style={{
                            background: colors.cardBg,
                            borderRadius: '4px',
                            padding: '4px 6px',
                            border: `1px solid ${statusColor}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '12px' }}>{order.icon}</span>
                              <div>
                                <div style={{
                                  fontSize: '8px',
                                  fontWeight: '600',
                                  fontFamily: 'Alan Sans, Arial, sans-serif',
                                  color: colors.textPrimary
                                }}>
                                  {order.name}
                                </div>
                                <div style={{
                                  fontSize: '7px',
                                  fontFamily: 'Alan Sans, Arial, sans-serif',
                                  color: colors.textSecondary
                                }}>
                                  {order.orderName}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '7px',
                                fontWeight: '500',
                                fontFamily: 'Alan Sans, Arial, sans-serif',
                                color: isReady ? colors.green : (isCurrentlyCooking ? colors.orange : '#ef4444'),
                                marginBottom: '2px'
                              }}>
                                {isReady ? '✅ Ready' : (isCurrentlyCooking ? '🍳 Cooking' : '❌ Cook')}
                              </div>
                              <div style={{
                                fontSize: '7px',
                                fontWeight: '600',
                                fontFamily: 'Alan Sans, Arial, sans-serif',
                                color: isUrgent ? '#ef4444' : colors.textSecondary
                              }}>
                                {minutes}:{seconds.toString().padStart(2, '0')}
                              </div>
                              <button
                                onClick={() => completeOrder(order.id)}
                                disabled={!isReady}
                                style={{
                                  background: isReady ? colors.green : colors.disabled,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '2px',
                                  padding: '2px 4px',
                                  fontSize: '7px',
                                  fontFamily: 'Alan Sans, Arial, sans-serif',
                                  cursor: isReady ? 'pointer' : 'not-allowed',
                                  marginTop: '2px',
                                  opacity: isReady ? 1 : 0.6
                                }}
                              >
                                {isReady ? 'SERVE' : (isCurrentlyCooking ? 'WAIT' : 'COOK')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(209, 213, 219, 0.1)',
                    borderRadius: colors.borderRadius,
                    padding: '12px',
                    textAlign: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      marginBottom: '4px'
                    }}>
                      🕰️
                    </div>
                    <div style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.textSecondary
                    }}>
                      Waiting for customers...
                    </div>
                  </div>
                )}
                
                {/* Statistics */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4px'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: colors.borderRadius,
                    padding: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.green
                    }}>
                      {gameState.completedOrders}
                    </div>
                    <div style={{ 
                      fontSize: '8px',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.textSecondary 
                    }}>
                      Served
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 107, 53, 0.1)',
                    borderRadius: colors.borderRadius,
                    padding: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.orange
                    }}>
                      {gameState.restaurants.count * gameState.restaurants.counters.count}
                    </div>
                    <div style={{ 
                      fontSize: '8px',
                      fontFamily: 'Alan Sans, Arial, sans-serif',
                      color: colors.textSecondary 
                    }}>
                      Capacity
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
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
              ...typography.cardHeader, fontSize: '20px',
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

          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            50% { 
              transform: translateY(-10px) rotate(5deg); 
            }
          }

          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0px) scale(1); 
            }
            50% { 
              transform: translateY(-8px) scale(1.1); 
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;
