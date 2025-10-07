import React, { useState, useEffect, useRef } from 'react';
import '@fontsource/alan-sans/400.css';
import '@fontsource/alan-sans/700.css';
import { firebaseGameManager } from './services/firebase';

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
    this.musicVolume = 0.05; // Default volume (5%)
    this.fadeInterval = null;
    this.isFading = false;
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
      console.log('🎵 Initializing background music...');
      this.backgroundMusic = new Audio(`${process.env.PUBLIC_URL}/happyfarm.mp3`); // Load MP3 with correct path
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.musicVolume;
      this.backgroundMusic.preload = 'auto';
      
      this.backgroundMusic.addEventListener('loadstart', () => {
        console.log('🎵 Music loading started');
      });
      
      this.backgroundMusic.addEventListener('loadeddata', () => {
        console.log('🎵 Music data loaded');
      });
      
      this.backgroundMusic.addEventListener('canplaythrough', () => {
        console.log('🎵 Background music loaded successfully and ready to play');
      });
      
      this.backgroundMusic.addEventListener('error', (e) => {
        console.error('🎵 Background music failed to load:', e);
        console.error('🎵 Audio error details:', {
          error: e.target.error,
          networkState: e.target.networkState,
          readyState: e.target.readyState,
          src: e.target.src
        });
      });
      
      this.backgroundMusic.addEventListener('play', () => {
        console.log('🎵 Music started playing');
      });
      
      this.backgroundMusic.addEventListener('pause', () => {
        console.log('🎵 Music paused');
      });
      
      console.log('🎵 Audio element created, src:', this.backgroundMusic.src);
      console.log('🎵 PUBLIC_URL:', process.env.PUBLIC_URL);
      console.log('🎵 Full audio path:', `${process.env.PUBLIC_URL}/happyfarm.mp3`);
    } catch (error) {
      console.error('Could not initialize background music:', error);
    }
  }

  startBackgroundMusic() {
    console.log('🎵 Attempting to start background music...', {
      hasAudio: !!this.backgroundMusic,
      enabled: this.backgroundMusicEnabled,
      muted: this.isMuted,
      readyState: this.backgroundMusic?.readyState,
      networkState: this.backgroundMusic?.networkState
    });
    
    if (!this.backgroundMusic || !this.backgroundMusicEnabled || this.isMuted) {
      console.log('🎵 Music start blocked:', {
        noAudio: !this.backgroundMusic,
        disabled: !this.backgroundMusicEnabled,
        muted: this.isMuted
      });
      return;
    }
    
    try {
      // Clear any existing fade
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.isFading = false;
      }
      
      this.backgroundMusic.currentTime = 0;
      console.log('🎵 Calling play()...');
      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('🎵 Background music started, beginning 2-second fade-in...');
          this.fadeIn(2000); // 2-second fade-in
        }).catch(error => {
          console.error('🎵 Could not start background music - Promise rejected:', error);
          console.error('🎵 Error name:', error.name);
          console.error('🎵 Error message:', error.message);
        });
      }
    } catch (error) {
      console.error('🎵 Error starting background music - Exception:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        // Clear any existing fade
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.isFading = false;
        }
        
        console.log('🎵 Beginning 2-second fade-out...');
        this.fadeOut(2000); // 2-second fade-out
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

  setVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.backgroundMusic && !this.isFading) {
      // Only update volume immediately if not currently fading
      this.backgroundMusic.volume = this.musicVolume;
    }
    console.log('🎵 Volume set to:', Math.round(this.musicVolume * 100) + '%');
  }

  getVolume() {
    return this.musicVolume;
  }

  fadeIn(duration = 2000) {
    if (!this.backgroundMusic || this.isFading) return;
    
    this.isFading = true;
    const targetVolume = this.musicVolume;
    const steps = 50; // Number of volume steps
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;
    
    // Start from 0 volume
    this.backgroundMusic.volume = 0;
    
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.min(volumeStep * currentStep, targetVolume);
      this.backgroundMusic.volume = newVolume;
      
      if (currentStep >= steps || newVolume >= targetVolume) {
        clearInterval(this.fadeInterval);
        this.backgroundMusic.volume = targetVolume;
        this.isFading = false;
        console.log('🎵 Fade-in complete at', Math.round(targetVolume * 100) + '%');
      }
    }, stepTime);
  }

  fadeOut(duration = 2000) {
    if (!this.backgroundMusic || this.isFading) return;
    
    this.isFading = true;
    const startVolume = this.backgroundMusic.volume;
    const steps = 50; // Number of volume steps
    const stepTime = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;
    
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(startVolume - (volumeStep * currentStep), 0);
      this.backgroundMusic.volume = newVolume;
      
      if (currentStep >= steps || newVolume <= 0) {
        clearInterval(this.fadeInterval);
        this.backgroundMusic.volume = 0;
        this.backgroundMusic.pause();
        this.isFading = false;
        console.log('🎵 Fade-out complete, music paused');
      }
    }, stepTime);
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
  
  // 🎮 NEW: Lobby State - Game enters lobby before main game
  const [inLobby, setInLobby] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

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
      },
      // Milestone tracking
      reachedMilestones: []
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
        autoFeeder: parsedState.autoFeeder || defaultState.autoFeeder,
        reachedMilestones: parsedState.reachedMilestones || []
      };
    }
    
    return defaultState;
  });

  // UI State
  const [showTransactions, setShowTransactions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [currentSaveName, setCurrentSaveName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'reset'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [savedGamesData, setSavedGamesData] = useState({});
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(5); // Volume as percentage (0-10)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [gameFrozen, setGameFrozen] = useState(false);
  
  // Responsive Design State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  
  // Interactive Effects State
  const [celebrations, setCelebrations] = useState([]);
  const [warningEffects, setWarningEffects] = useState({
    lowFeed: false,
    lowChickens: false,
    noEggs: false,
    lowMoney: false
  });
  
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
    // Initialize Firebase game manager
    firebaseGameManager.onUserChange = (user) => {
      setCurrentUser(user);
      if (user) {
        showFloatingText(`👋 Welcome back, ${user.displayName || user.email}!`, colors.green);
      }
    };

    firebaseGameManager.onConnectionChange = (online) => {
      setIsOnline(online);
      if (online) {
        showFloatingText('🌐 Back online - syncing data...', colors.green);
      } else {
        showFloatingText('📱 Playing offline', colors.orange);
      }
    };

    initGame();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

        // Check for milestone achievements
        milestones.forEach(milestone => {
          if (newState.money >= milestone && !newState.reachedMilestones.includes(milestone)) {
            newState.reachedMilestones.push(milestone);
            setTimeout(() => createCelebration(milestone), 100);
          }
        });
        
        // Check for warning conditions
        setTimeout(() => checkWarningEffects(newState), 50);
        
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

  const handleVolumeChange = (e) => {
    const volume = parseInt(e.target.value);
    setMusicVolume(volume);
    soundManager.setVolume(volume / 100); // Convert percentage to 0-1 range (max 0.1)
    showFloatingText(`🎵 Volume ${volume}%`);
  };

  // 🔐 Enhanced Authentication Handlers
  const clearAuthMessages = () => {
    setAuthError('');
    setAuthSuccess('');
    setResetEmailSent(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    clearAuthMessages();
    
    // Validate inputs
    if (!authEmail || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    
    if (authMode !== 'reset' && (!authPassword || authPassword.length < 6)) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }
    
    if (authMode === 'register' && (!authUsername || authUsername.trim().length < 2)) {
      setAuthError('Username must be at least 2 characters long');
      return;
    }

    setAuthLoading(true);
    
    try {
      let result;
      
      if (authMode === 'register') {
        result = await firebaseGameManager.registerUser(authEmail, authPassword, authUsername.trim());
        if (result.success) {
          setAuthSuccess('Account created successfully! Welcome to Chicken Empire!');
          setTimeout(() => {
            setShowAuthModal(false);
            clearAuthMessages();
          }, 2000);
        } else {
          setAuthError(result.error);
        }
      } else if (authMode === 'login') {
        result = await firebaseGameManager.loginUser(authEmail, authPassword);
        if (result.success) {
          setAuthSuccess('Welcome back! Loading your empire...');
          setTimeout(() => {
            setShowAuthModal(false);
            clearAuthMessages();
          }, 1500);
        } else {
          setAuthError(result.error);
        }
      } else if (authMode === 'reset') {
        result = await firebaseGameManager.resetPassword(authEmail);
        if (result.success) {
          setResetEmailSent(true);
          setAuthSuccess(result.message);
        } else {
          setAuthError(result.error);
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    clearAuthMessages();
    setAuthPassword('');
    if (mode !== 'register') {
      setAuthUsername('');
    }
  };

  // 🎮 Lobby Handlers
  const enterGame = () => {
    setInLobby(false);
    if (!gameStarted) {
      setGameStarted(true);
      localStorage.setItem('chickenEmpire_gameStarted', 'true');
    }
  };

  const returnToLobby = () => {
    setInLobby(true);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    clearAuthMessages();
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    clearAuthMessages();
    setAuthEmail('');
    setAuthPassword('');
    setAuthUsername('');
  };

  // Milestone celebration system
  const milestones = [1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
  
  const createCelebration = (milestone) => {
    const celebration = {
      id: Date.now() + Math.random(),
      milestone,
      timestamp: Date.now(),
      particles: Array.from({length: 20}, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
        emoji: ['🎉', '💰', '🏆', '⭐', '🎊', '🌟'][Math.floor(Math.random() * 6)]
      }))
    };
    
    setCelebrations(prev => [...prev, celebration]);
    
    // Remove celebration after 4 seconds
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== celebration.id));
    }, 4000);
    
    console.log(`🎉 Milestone reached: $${milestone.toLocaleString()}!`);
    soundManager.playSuccessSound();
  };

  const checkWarningEffects = (state) => {
    const newWarnings = {
      lowFeed: state.feed < (state.chickens + state.goldenChickens) * 1.5,
      lowChickens: state.chickens + state.goldenChickens < 3,
      noEggs: state.eggs < 1,
      lowMoney: state.money < 50
    };
    
    setWarningEffects(newWarnings);
  };

  // Save/Load System
  const loadLeaderboardData = async () => {
    setLeaderboardLoading(true);
    try {
      const data = await generateRealLeaderboard();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const loadSavedGamesData = async () => {
    try {
      const data = await firebaseGameManager.getAllSavedGames();
      setSavedGamesData(data);
    } catch (error) {
      console.error('Failed to load saved games:', error);
      setSavedGamesData({});
    }
  };

  const getAllSavedGames = () => {
    return savedGamesData;
  };

  const getStorageInfo = () => {
    let chickenEmpireSize = 0;
    let totalSaves = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (key && key.startsWith('chickenEmpire_')) {
        chickenEmpireSize += key.length + value.length;
        if (key.startsWith('chickenEmpire_save_')) {
          totalSaves++;
        }
      }
    }
    
    // Convert to KB
    const sizeInKB = Math.round(chickenEmpireSize / 1024 * 100) / 100;
    const estimatedLimit = 5120; // 5MB in KB (conservative estimate)
    const usagePercent = Math.round((sizeInKB / estimatedLimit) * 100);
    
    return {
      sizeInKB,
      totalSaves,
      usagePercent,
      estimatedLimit,
      remainingKB: estimatedLimit - sizeInKB
    };
  };

  const saveGameWithName = async (name) => {
    if (!name || name.trim() === '') {
      showFloatingText('❌ Please enter a valid name!', colors.red);
      return;
    }

    const cleanName = name.trim().substring(0, 20); // Limit name length
    setAuthLoading(true);
    
    const saveData = {
      ...gameState,
      playerName: cleanName,
      savedAt: new Date().toISOString(),
      playTime: Date.now() - gameState.gameStartTime || 0
    };

    try {
      const result = await firebaseGameManager.saveGameData(saveData, cleanName);
      
      if (result.success) {
        setCurrentSaveName(cleanName);
        setShowSaveModal(false);
        
        if (result.location === 'cloud') {
          showFloatingText(`☁️ Game saved as "${cleanName}"!`, colors.green);
        } else if (result.location === 'local_fallback') {
          showFloatingText(`💾 Saved locally as "${cleanName}" - will sync when online`, colors.orange);
        } else {
          showFloatingText(`💾 Game saved as "${cleanName}"!`, colors.green);
        }
        
        soundManager.playSuccessSound();
      } else {
        showFloatingText(`❌ Save failed: ${result.error}`, colors.red);
      }
    } catch (error) {
      showFloatingText('❌ Save failed! Try again.', colors.red);
      console.error('Save failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadGameByName = async (name) => {
    setAuthLoading(true);
    
    try {
      const saveData = await firebaseGameManager.loadGameData(name);
      
      if (saveData) {
        setGameState(saveData);
        setCurrentSaveName(name);
        setShowLoadModal(false);
        
        if (firebaseGameManager.isAuthenticated()) {
          showFloatingText(`☁️ Loaded "${name}"'s game from cloud!`, colors.green);
        } else {
          showFloatingText(`📂 Loaded "${name}"'s game!`, colors.green);
        }
        
        soundManager.playSuccessSound();
      } else {
        showFloatingText('❌ Save file not found!', colors.red);
      }
    } catch (error) {
      showFloatingText('❌ Failed to load game!', colors.red);
      console.error('Load failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const deleteSavedGame = async (name) => {
    setAuthLoading(true);
    
    try {
      const result = await firebaseGameManager.deleteSavedGame(name);
      
      if (result.success) {
        if (result.location === 'cloud') {
          showFloatingText(`☁️ Deleted "${name}"'s save from cloud!`, colors.orange);
        } else {
          showFloatingText(`🗑️ Deleted "${name}"'s save!`, colors.orange);
        }
      } else {
        showFloatingText(`❌ Delete failed: ${result.error}`, colors.red);
      }
    } catch (error) {
      showFloatingText('❌ Delete failed!', colors.red);
      console.error('Delete failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const generateRealLeaderboard = async () => {
    try {
      // Get global leaderboard from Firebase
      const globalLeaderboard = await firebaseGameManager.getGlobalLeaderboard();
      
      if (globalLeaderboard.length > 0) {
        return globalLeaderboard.slice(0, 10); // Top 10
      }
      
      // Fallback to local saves if no cloud data
      const savedGames = getAllSavedGames();
      const leaderboardData = Object.entries(savedGames)
        .map(([name, data]) => ({
          name: name,
          username: name,
          money: data.money || 0,
          chickens: (data.chickens || 0) + (data.goldenChickens || 0),
          products: Object.values(data.products || {}).reduce((sum, count) => sum + count, 0),
          lastPlayed: data.savedAt || new Date().toISOString(),
          playTime: Math.floor((data.playTime || 0) / 1000 / 60), // Convert to minutes
          isCurrentUser: false
        }))
        .sort((a, b) => b.money - a.money) // Sort by money descending
        .slice(0, 10); // Top 10

      return leaderboardData;
    } catch (error) {
      console.error('Failed to generate leaderboard:', error);
      return [];
    }
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

  // Load leaderboard when modal is opened
  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboardData();
    }
  }, [showLeaderboard]);

  // Load saved games when load modal is opened
  useEffect(() => {
    if (showLoadModal) {
      loadSavedGamesData();
    }
  }, [showLoadModal]);

  // Show lobby if in lobby mode or game hasn't started
  if (inLobby || !gameStarted) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        fontFamily: 'Alan Sans, Arial, sans-serif',
        position: 'relative',
        width: '100vw',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite',
          opacity: 0.3
        }} />

        {/* Main Lobby Container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '24px' : (isTablet ? '36px' : '48px'),
          maxWidth: '600px',
          width: isMobile ? '95%' : '90%',
          maxHeight: isMobile ? '95vh' : 'auto',
          overflowY: isMobile ? 'auto' : 'visible',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}>
          {/* Game Logo */}
          <div style={{
            marginBottom: '32px',
            position: 'relative'
          }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : (isTablet ? '40px' : '48px'),
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcf7f)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              🐔 CHICKEN EMPIRE 🐔
            </h1>
            <p style={{
              fontSize: isMobile ? '14px' : (isTablet ? '16px' : '18px'),
              color: '#666',
              margin: '0',
              fontStyle: 'italic'
            }}>
              Build your feathered fortune from scratch!
            </p>
          </div>

          {/* User Status */}
          {currentUser ? (
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '16px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}>
              <span style={{ fontSize: '20px' }}>👤</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Welcome back, {currentUser.displayName || currentUser.email}!
              </span>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '16px',
              marginBottom: '32px',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}>
              <p style={{ margin: '0', fontSize: '16px' }}>
                Sign in to save your progress and compete on the leaderboard!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Show cloud save buttons only for logged-in users */}
            {currentUser ? (
              <>
                {/* Start New Game Button */}
                <button
                  onClick={() => {
                    if (gameStarted && !window.confirm('Starting a new game will reset your current progress. Continue?')) {
                      return;
                    }
                    handleResetGame();
                    enterGame();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B, #FF5722)',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '16px 24px' : '20px 32px',
                    fontSize: isMobile ? '16px' : '20px',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    minHeight: isMobile ? '56px' : 'auto',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(-2px) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.4)';
                    }
                  }}
                >
                  🚀 START NEW GAME
                </button>

                {/* Load Game Button */}
                <button
                  onClick={() => setShowLoadModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '16px 24px' : '20px 32px',
                    fontSize: isMobile ? '16px' : '20px',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(147, 51, 234, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    minHeight: isMobile ? '56px' : 'auto',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(-2px) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 32px rgba(147, 51, 234, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.4)';
                    }
                  }}
                >
                  📂 LOAD GAME
                </button>
              </>
            ) : (
              /* Play as Guest button for non-authenticated users */
              <button
                onClick={enterGame}
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B, #FF5722)',
                  color: 'white',
                  border: 'none',
                  padding: isMobile ? '16px 24px' : '20px 32px',
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  minHeight: isMobile ? '56px' : 'auto',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.4)';
                  }
                }}
              >
                🎮 PLAY AS GUEST
              </button>
            )}

            {/* Authentication Buttons */}
            {!currentUser && (
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => openAuthModal('login')}
                  style={{
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '14px 20px' : '16px 24px',
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    minWidth: isMobile ? '100%' : '140px',
                    minHeight: isMobile ? '48px' : 'auto',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                    }
                  }}
                >
                  🔑 LOGIN
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  style={{
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '14px 20px' : '16px 24px',
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    minWidth: isMobile ? '100%' : '140px',
                    minHeight: isMobile ? '48px' : 'auto',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
                    }
                  }}
                >
                  📝 REGISTER
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  const result = await firebaseGameManager.logoutUser();
                  if (result.success) {
                    setCurrentUser(null);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 152, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
                }}
              >
                🚪 LOGOUT
              </button>
            )}
          </div>

          {/* Game Features Preview */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: '#333',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🌟 Game Features
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              fontSize: '14px',
              color: '#666'
            }}>
              <div>🐔 Raise Chickens</div>
              <div>🥚 Collect Eggs</div>
              <div>👨‍🍳 Cook Recipes</div>
              <div>🏪 Run Restaurants</div>
              <div>💰 Build Fortune</div>
              <div>🏆 Global Leaderboard</div>
            </div>
          </div>
        </div>

        {/* Enhanced Authentication Modal */}
        {showAuthModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '48px',
              maxWidth: '450px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}>
              {/* Close Button */}
              <button
                onClick={closeAuthModal}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f0f0f0';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.transform = 'rotate(0)';
                }}
              >
                ×
              </button>

              {/* Modal Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {authMode === 'login' ? '🔑 Welcome Back!' : 
                   authMode === 'register' ? '📝 Join the Empire!' : 
                   '🔒 Reset Password'}
                </h2>
                <p style={{
                  margin: '0',
                  color: '#666',
                  fontSize: '16px'
                }}>
                  {authMode === 'login' ? 'Sign in to continue your chicken empire' : 
                   authMode === 'register' ? 'Create your account to get started' : 
                   'Enter your email to reset your password'}
                </p>
              </div>

              {/* Success/Error Messages */}
              {authSuccess && (
                <div style={{
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}>
                  ✅ {authSuccess}
                </div>
              )}

              {authError && (
                <div style={{
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }}>
                  ❌ {authError}
                </div>
              )}

              {resetEmailSent && (
                <div style={{
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}>
                  📧 Check your email for password reset instructions!
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Email Input */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#333',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                {/* Username Input (Register only) */}
                {authMode === 'register' && (
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                )}

                {/* Password Input (Login/Register only) */}
                {authMode !== 'reset' && (
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#333',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    background: authLoading ? '#ccc' : 
                      authMode === 'login' ? 'linear-gradient(135deg, #4CAF50, #45a049)' :
                      authMode === 'register' ? 'linear-gradient(135deg, #2196F3, #1976D2)' :
                      'linear-gradient(135deg, #FF9800, #F57C00)',
                    color: 'white',
                    border: 'none',
                    padding: '18px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    cursor: authLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {authLoading ? (
                    <>⏳ Processing...</>
                  ) : (
                    <>
                      {authMode === 'login' ? '🔑 LOGIN' : 
                       authMode === 'register' ? '📝 CREATE ACCOUNT' : 
                       '📧 SEND RESET EMAIL'}
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switcher */}
              <div style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666'
              }}>
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchAuthMode('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2196F3',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                      }}
                    >
                      Sign up here
                    </button>
                    <br /><br />
                    Forgot your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchAuthMode('reset')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF9800',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                      }}
                    >
                      Reset it here
                    </button>
                  </>
                ) : authMode === 'register' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchAuthMode('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4CAF50',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                      }}
                    >
                      Login here
                    </button>
                  </>
                ) : (
                  <>
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchAuthMode('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4CAF50',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                      }}
                    >
                      Login here
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lobby Animation Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes modalSlideIn {
            0% { opacity: 0; transform: translateY(-50px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // Main game return statement

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
            
            {/* Return to Lobby Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: window.innerWidth >= 640 ? 'flex-start' : 'center',
              marginBottom: '12px'
            }}>
              <button 
                onClick={returnToLobby}
                onMouseDown={(e) => e.target.style.animation = 'buttonPress 0.1s ease'}
                onMouseUp={(e) => e.target.style.animation = ''}
                onMouseLeave={(e) => {
                  e.target.style.animation = '';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 4px 12px rgba(103, 58, 183, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                style={{
                  background: 'linear-gradient(135deg, #673AB7, #512DA8)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🏠 LOBBY
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button 
                onClick={() => setShowResetModal(true)} 
                onMouseDown={(e) => e.target.style.animation = 'buttonPress 0.1s ease'}
                onMouseUp={(e) => e.target.style.animation = ''}
                onMouseLeave={(e) => {
                  e.target.style.animation = '';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  color: colors.orange, 
                  border: `1px solid rgba(255, 107, 53, 0.2)`,
                  ...typography.button, 
                  fontSize: '10px',
                  padding: '8px 12px',
                  borderRadius: colors.borderRadius, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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

              <button onClick={() => setShowSaveModal(true)} style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                ...typography.button,
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                💾 Save
              </button>

              <button onClick={() => setShowLoadModal(true)} style={{
                background: 'rgba(147, 51, 234, 0.1)',
                color: '#9333ea',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                ...typography.button,
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                📂 Load
              </button>

              {/* Server Authentication Button */}
              <button onClick={() => setShowAuthModal(true)} style={{
                background: currentUser ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: currentUser ? colors.green : '#6366f1',
                border: currentUser ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                ...typography.button,
                fontSize: '10px',
                padding: '8px 12px',
                borderRadius: colors.borderRadius,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                {currentUser ? `👤 ${currentUser.displayName || 'User'}` : '🌐 Login'}
              </button>
              
              <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} style={{
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

              {/* Volume Slider - Only show when button clicked */}
              {showVolumeSlider && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: colors.borderRadius,
                  border: `1px solid rgba(16, 185, 129, 0.2)`,
                }}>
                  <span style={{
                    ...typography.button,
                    color: colors.green,
                    fontSize: '10px',
                    minWidth: '20px'
                  }}>
                    🔊
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={musicVolume}
                    onChange={handleVolumeChange}
                    style={{
                      width: '60px',
                      height: '4px',
                      background: `linear-gradient(to right, ${colors.green} 0%, ${colors.green} ${(musicVolume / 10) * 100}%, rgba(16, 185, 129, 0.2) ${(musicVolume / 10) * 100}%, rgba(16, 185, 129, 0.2) 100%)`,
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      border: 'none',
                    }}
                  />
                  <span style={{
                    ...typography.button,
                    color: colors.green,
                    fontSize: '8px',
                    minWidth: '25px'
                  }}>
                    {musicVolume}%
                  </span>
                  <button 
                    onClick={toggleMusic}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.green,
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '0 4px',
                    }}
                  >
                    {musicEnabled ? '🔊' : '🔇'}
                  </button>
                </div>
              )}

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
                {leaderboardData.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: colors.textSecondary,
                    ...typography.bodyText
                  }}>
                    🎮 No saved games yet!<br />
                    Save your progress to appear on the leaderboard.
                  </div>
                ) : (
                  leaderboardData.map((player, index) => (
                    <div key={player.name} style={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px', 
                      marginBottom: '8px',
                      backgroundColor: index < 3 ? '#fef3c7' : '#f9fafb',
                      borderRadius: '8px',
                      border: index < 3 ? '2px solid #f59e0b' : '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ ...typography.cardHeader, minWidth: '30px' }}>
                          {index + 1}{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                        </span>
                        <div>
                          <div style={{ ...typography.bodyText, fontWeight: index < 3 ? 'bold' : 'normal' }}>
                            {player.name}
                          </div>
                          <div style={{ 
                            fontSize: '10px', 
                            color: colors.textSecondary,
                            fontFamily: 'Alan Sans, Arial, sans-serif'
                          }}>
                            🐔{player.chickens} • 🍳{player.products} • ⏱{player.playTime}min
                          </div>
                        </div>
                      </div>
                      <span style={{
                        ...typography.bodyText,
                        fontWeight: index < 3 ? 'bold' : 'normal',
                        color: colors.success
                      }}>
                        ${player.money.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Game Modal */}
        {showSaveModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: colors.borderRadiusLarge,
              width: '90%', maxWidth: '450px',
              overflow: 'hidden',
              border: '3px solid #3b82f6',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white'
              }}>
                <h2 style={{ ...typography.sectionHeader, margin: 0, color: 'white' }}>
                  💾 Save Your Game
                </h2>
                <p style={{ ...typography.bodyText, margin: '8px 0 0 0', opacity: 0.9 }}>
                  Enter your name to save your progress
                </p>
              </div>
              
              <div style={{ padding: '24px' }}>
                <input
                  type="text"
                  placeholder="Enter your player name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveGameWithName(playerName)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: colors.borderRadius,
                    fontSize: '14px',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    marginBottom: '20px',
                    outline: 'none'
                  }}
                  maxLength={20}
                  autoFocus
                />
                
                {currentSaveName && (
                  <div style={{
                    padding: '8px',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: colors.borderRadius,
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#92400e'
                  }}>
                    💡 Currently playing as: <strong>{currentSaveName}</strong>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => {
                      setShowSaveModal(false);
                      setPlayerName('');
                    }}
                    style={{
                      background: 'rgba(107, 114, 128, 0.1)',
                      color: colors.textSecondary,
                      border: '1px solid rgba(107, 114, 128, 0.2)',
                      borderRadius: colors.borderRadius,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      ...typography.button
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => saveGameWithName(playerName)}
                    disabled={!playerName.trim()}
                    style={{
                      background: playerName.trim() 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : colors.disabled,
                      color: 'white',
                      border: 'none',
                      borderRadius: colors.borderRadius,
                      padding: '10px 20px',
                      cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                      ...typography.button,
                      fontWeight: '600'
                    }}
                  >
                    💾 Save Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Load Game Modal */}
        {showLoadModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: colors.borderRadiusLarge,
              width: '90%', maxWidth: '600px', maxHeight: '80%',
              overflow: 'hidden',
              border: '3px solid #9333ea',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ ...typography.sectionHeader, margin: 0, color: 'white' }}>
                    📂 Load Saved Game
                  </h2>
                  <p style={{ ...typography.bodyText, margin: '4px 0 0 0', opacity: 0.9 }}>
                    Select a saved game to continue playing
                  </p>
                </div>
                <button 
                  onClick={() => setShowLoadModal(false)} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)', 
                    border: 'none', 
                    fontSize: '20px', 
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: 'white'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ padding: '20px', maxHeight: '400px', overflow: 'auto' }}>
                {Object.keys(getAllSavedGames()).length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: colors.textSecondary,
                    ...typography.bodyText
                  }}>
                    🎮 No saved games found!<br />
                    Save your current progress first.
                  </div>
                ) : (
                  Object.entries(getAllSavedGames()).map(([name, saveData]) => (
                    <div key={name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      marginBottom: '8px',
                      backgroundColor: name === currentSaveName ? '#ede9fe' : '#f9fafb',
                      borderRadius: '8px',
                      border: name === currentSaveName ? '2px solid #9333ea' : '1px solid #e5e7eb'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          ...typography.cardHeader, 
                          marginBottom: '4px',
                          color: name === currentSaveName ? '#9333ea' : colors.textPrimary
                        }}>
                          {name} {name === currentSaveName && '(Current)'}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: colors.textSecondary,
                          fontFamily: 'Alan Sans, Arial, sans-serif'
                        }}>
                          💰${saveData.money?.toLocaleString()} • 🐔{(saveData.chickens || 0) + (saveData.goldenChickens || 0)} • 
                          📅{saveData.savedAt ? new Date(saveData.savedAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                        <button
                          onClick={() => loadGameByName(name)}
                          style={{
                            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: colors.borderRadius,
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            fontFamily: 'Alan Sans, Arial, sans-serif'
                          }}
                        >
                          📂 Load
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${name}"'s save file?`)) {
                              deleteSavedGame(name);
                              // Force re-render by toggling modal
                              setShowLoadModal(false);
                              setTimeout(() => setShowLoadModal(true), 100);
                            }
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: colors.borderRadius,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontFamily: 'Alan Sans, Arial, sans-serif'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Storage Usage Info */}
                {(() => {
                  const storageInfo = getStorageInfo();
                  return (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: storageInfo.usagePercent > 80 ? '#fef3c7' : '#f3f4f6',
                      borderRadius: colors.borderRadius,
                      border: storageInfo.usagePercent > 80 ? '1px solid #f59e0b' : '1px solid #d1d5db'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          color: storageInfo.usagePercent > 80 ? '#92400e' : colors.textSecondary,
                          fontFamily: 'Alan Sans, Arial, sans-serif'
                        }}>
                          📊 Storage Usage
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: storageInfo.usagePercent > 80 ? '#92400e' : colors.textSecondary,
                          fontFamily: 'Alan Sans, Arial, sans-serif'
                        }}>
                          {storageInfo.usagePercent}% used
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: storageInfo.usagePercent > 80 ? '#92400e' : colors.textSecondary,
                        fontFamily: 'Alan Sans, Arial, sans-serif'
                      }}>
                        💾 {storageInfo.totalSaves} saves • {storageInfo.sizeInKB}KB / {Math.round(storageInfo.estimatedLimit/1024)}MB used
                        {storageInfo.usagePercent > 80 && (
                          <div style={{ marginTop: '4px', color: '#dc2626' }}>
                            ⚠️ Storage nearly full! Consider deleting old saves.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: colors.borderRadius,
              padding: '0',
              minWidth: '400px',
              maxWidth: '90vw',
              boxShadow: colors.shadowLarge,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <h2 style={{ 
                    ...typography.cardHeader, 
                    margin: '0',
                    color: colors.textPrimary
                  }}>
                    {currentUser ? '👤 Account' : authMode === 'login' ? '🌐 Login' : '📝 Create Account'}
                  </h2>
                  {!currentUser && (
                    <p style={{
                      ...typography.bodyText,
                      margin: '4px 0 0 0',
                      color: colors.textSecondary
                    }}>
                      {authMode === 'login' 
                        ? 'Sign in to save your progress in the cloud' 
                        : 'Create an account to sync across devices'
                      }
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthEmail('');
                    setAuthPassword('');
                    setAuthUsername('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textSecondary,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ padding: '24px' }}>
                {currentUser ? (
                  // User is logged in - show account info
                  <div>
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: colors.borderRadius,
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        marginBottom: '8px'
                      }}>👤</div>
                      <div style={{
                        ...typography.cardHeader,
                        color: colors.textPrimary,
                        marginBottom: '4px'
                      }}>
                        {currentUser.displayName || 'Chicken Farmer'}
                      </div>
                      <div style={{
                        ...typography.bodyText,
                        color: colors.textSecondary
                      }}>
                        {currentUser.email}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: colors.borderRadius
                      }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>☁️</div>
                        <div style={{ ...typography.bodyText, fontSize: '10px', color: colors.textSecondary }}>
                          Cloud Saves
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: colors.borderRadius
                      }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>🌍</div>
                        <div style={{ ...typography.bodyText, fontSize: '10px', color: colors.textSecondary }}>
                          Global Leaderboard
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={async () => {
                        setAuthLoading(true);
                        try {
                          const result = await firebaseGameManager.logoutUser();
                          if (result.success) {
                            setCurrentUser(null);
                            setShowAuthModal(false);
                            showFloatingText('👋 Logged out successfully', colors.orange);
                          } else {
                            showFloatingText('❌ Logout failed', colors.red);
                          }
                        } catch (error) {
                          console.error('Logout error:', error);
                          showFloatingText('❌ Logout failed', colors.red);
                        } finally {
                          setAuthLoading(false);
                        }
                      }}
                      disabled={authLoading}
                      style={{
                        width: '100%',
                        background: authLoading ? colors.disabled : 'rgba(239, 68, 68, 0.1)',
                        color: authLoading ? colors.textSecondary : '#dc2626',
                        border: `1px solid ${authLoading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.3)'}`,
                        borderRadius: colors.borderRadius,
                        padding: '12px',
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        ...typography.button
                      }}
                    >
                      {authLoading ? '⏳ Signing out...' : '🚪 Sign Out'}
                    </button>
                  </div>
                ) : (
                  // Login/Register form
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    
                    // Validation
                    if (authMode === 'register' && (!authUsername || !authEmail || !authPassword)) {
                      showFloatingText('❌ Please fill all fields', colors.red);
                      return;
                    }
                    if (authMode === 'login' && (!authEmail || !authPassword)) {
                      showFloatingText('❌ Please fill all fields', colors.red);
                      return;
                    }
                    
                    setAuthLoading(true);
                    
                    try {
                      let result;
                      
                      if (authMode === 'register') {
                        result = await firebaseGameManager.registerUser(authEmail, authPassword, authUsername);
                      } else {
                        result = await firebaseGameManager.loginUser(authEmail, authPassword);
                      }
                      
                      if (result.success) {
                        setShowAuthModal(false);
                        setAuthEmail('');
                        setAuthPassword('');
                        setAuthUsername('');
                        
                        showFloatingText(
                          authMode === 'login' ? '✅ Welcome back!' : '🎉 Account created successfully!', 
                          colors.green
                        );
                        
                        // Auto-save current game state when user logs in
                        if (currentSaveName) {
                          await saveGameWithName(currentSaveName);
                        }
                      } else {
                        showFloatingText(`❌ ${result.error}`, colors.red);
                      }
                    } catch (error) {
                      console.error('Authentication error:', error);
                      showFloatingText('❌ Authentication failed. Please try again.', colors.red);
                    } finally {
                      setAuthLoading(false);
                    }
                  }}>
                    {authMode === 'register' && (
                      <input
                        type="text"
                        placeholder="Username (display name)"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          marginBottom: '12px',
                          borderRadius: colors.borderRadius,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: colors.textPrimary,
                          fontFamily: 'Alan Sans, Arial, sans-serif',
                          fontSize: '14px'
                        }}
                        maxLength={20}
                      />
                    )}
                    
                    <input
                      type="email"
                      placeholder="Email address"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '12px',
                        borderRadius: colors.borderRadius,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: colors.textPrimary,
                        fontFamily: 'Alan Sans, Arial, sans-serif',
                        fontSize: '14px'
                      }}
                    />
                    
                    <input
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: colors.borderRadius,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: colors.textPrimary,
                        fontFamily: 'Alan Sans, Arial, sans-serif',
                        fontSize: '14px'
                      }}
                      minLength={6}
                    />
                    
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAuthModal(false);
                          setAuthEmail('');
                          setAuthPassword('');
                          setAuthUsername('');
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: colors.textSecondary,
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: colors.borderRadius,
                          padding: '12px',
                          cursor: 'pointer',
                          ...typography.button
                        }}
                      >
                        Cancel
                      </button>
                      
                      <button 
                        type="submit"
                        disabled={authLoading}
                        style={{
                          flex: 2,
                          background: authLoading 
                            ? colors.disabled 
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: authLoading ? colors.textSecondary : 'white',
                          border: 'none',
                          borderRadius: colors.borderRadius,
                          padding: '12px',
                          cursor: authLoading ? 'not-allowed' : 'pointer',
                          ...typography.button,
                          fontWeight: '600'
                        }}
                      >
                        {authLoading 
                          ? '⏳ Processing...' 
                          : authMode === 'login' ? '🌐 Sign In' : '📝 Create Account'
                        }
                      </button>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6366f1',
                          cursor: 'pointer',
                          ...typography.bodyText,
                          fontSize: '12px',
                          textDecoration: 'underline'
                        }}
                      >
                        {authMode === 'login' 
                          ? "Don't have an account? Create one" 
                          : 'Already have an account? Sign in'
                        }
                      </button>
                    </div>
                    
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: colors.borderRadius,
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      <div style={{ 
                        ...typography.bodyText, 
                        fontSize: '11px', 
                        color: colors.textSecondary,
                        lineHeight: '1.4'
                      }}>
                        💡 <strong>Benefits of creating an account:</strong><br />
                        • ☁️ Save progress in the cloud<br />
                        • 📱 Play on any device<br />
                        • 🏆 Compete on global leaderboard<br />
                        • 🔒 Never lose your chicken empire!
                      </div>
                    </div>
                  </form>
                )}
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
            boxShadow: warningEffects.lowMoney 
              ? '0 8px 30px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.2)' 
              : colors.shadowLarge,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '550px',
            overflow: 'hidden',
            animation: warningEffects.lowMoney ? 'subtleGlow 3s ease-in-out infinite' : 'none',
            transition: 'all 0.5s ease'
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
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.green 
                  }}>{gameState.chickens}</span>
                  {warningEffects.lowChickens && (
                    <span style={{
                      fontSize: '10px',
                      animation: 'gentleBounce 1.5s infinite',
                      color: 'rgba(255, 165, 0, 0.8)'
                    }}>
                      ⚠️
                    </span>
                  )}
                </div>
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
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    fontFamily: 'Alan Sans, Arial, sans-serif',
                    color: colors.green 
                  }}>{Math.floor(gameState.feed)}</span>
                  {warningEffects.lowFeed && (
                    <span style={{
                      fontSize: '10px',
                      animation: 'gentleBounce 1.5s infinite',
                      color: 'rgba(239, 68, 68, 0.8)'
                    }}>
                      ⚠️
                    </span>
                  )}
                </div>
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
            boxShadow: warningEffects.lowChickens 
              ? '0 8px 30px rgba(255, 165, 0, 0.12), 0 0 0 1px rgba(255, 165, 0, 0.25)' 
              : colors.shadowLarge,
            animation: warningEffects.lowChickens ? 'subtleAmber 3s ease-in-out infinite' : 'none',
            transition: 'all 0.5s ease',
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
            boxShadow: warningEffects.lowMoney 
              ? '0 8px 30px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.2)' 
              : colors.shadowLarge,
            maxHeight: '550px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: warningEffects.lowMoney ? 'subtleGlow 3s ease-in-out infinite' : 'none',
            transition: 'all 0.5s ease'
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
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              ${gameState.money.toLocaleString()}
              {warningEffects.lowMoney && (
                <span style={{
                  fontSize: '16px',
                  animation: 'gentleBounce 1.5s infinite',
                  color: 'rgba(239, 68, 68, 0.7)'
                }}>
                  ⚠️
                </span>
              )}
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
            boxShadow: warningEffects.lowFeed 
              ? '0 8px 30px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.2)' 
              : colors.shadowLarge,
            animation: warningEffects.lowFeed ? 'subtleGlow 3s ease-in-out infinite' : 'none',
            transition: 'all 0.5s ease'
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

        {/* Celebration Overlay */}
        {celebrations.map(celebration => (
          <div key={celebration.id} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1001,
            overflow: 'hidden'
          }}>
            {/* Celebration Banner */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4)',
              color: 'white',
              padding: '20px 40px',
              borderRadius: '15px',
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              animation: 'celebrationBounce 0.6s ease-out',
              border: '3px solid white'
            }}>
              🎉 MILESTONE REACHED! 🎉
              <br />
              <span style={{ fontSize: '32px' }}>
                ${celebration.milestone.toLocaleString()}
              </span>
            </div>

            {/* Animated Particles */}
            {celebration.particles.map(particle => (
              <div key={particle.id} style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: '24px',
                animation: `particleFloat 3s ease-out forwards`,
                animationDelay: `${particle.id * 0.1}s`
              }}>
                {particle.emoji}
              </div>
            ))}
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

          @keyframes celebrationBounce {
            0% { 
              transform: translateX(-50%) scale(0) rotate(-180deg); 
              opacity: 0; 
            }
            50% { 
              transform: translateX(-50%) scale(1.1) rotate(-10deg); 
              opacity: 1; 
            }
            100% { 
              transform: translateX(-50%) scale(1) rotate(0deg); 
              opacity: 1; 
            }
          }
          
          @keyframes particleFloat {
            0% { 
              transform: translateY(0) scale(0) rotate(0deg); 
              opacity: 0; 
            }
            10% { 
              opacity: 1; 
            }
            100% { 
              transform: translateY(-200px) scale(1) rotate(360deg); 
              opacity: 0; 
            }
          }
          
          @keyframes pulse {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); 
            }
            70% { 
              transform: scale(1.05); 
              box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); 
            }
            100% { 
              transform: scale(1); 
              box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); 
            }
          }
          
          @keyframes subtleGlow {
            0% { 
              box-shadow: 0 8px 30px rgba(239, 68, 68, 0.12), 0 0 0 1px rgba(239, 68, 68, 0.15);
            }
            50% { 
              box-shadow: 0 8px 30px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(239, 68, 68, 0.25);
            }
            100% { 
              box-shadow: 0 8px 30px rgba(239, 68, 68, 0.12), 0 0 0 1px rgba(239, 68, 68, 0.15);
            }
          }

          @keyframes subtleAmber {
            0% { 
              box-shadow: 0 8px 30px rgba(255, 165, 0, 0.1), 0 0 0 1px rgba(255, 165, 0, 0.2);
            }
            50% { 
              box-shadow: 0 8px 30px rgba(255, 165, 0, 0.15), 0 0 0 1px rgba(255, 165, 0, 0.3);
            }
            100% { 
              box-shadow: 0 8px 30px rgba(255, 165, 0, 0.1), 0 0 0 1px rgba(255, 165, 0, 0.2);
            }
          }

          @keyframes gentleBounce {
            0%, 100% { 
              transform: translateY(0px) scale(1);
              opacity: 0.7;
            }
            50% { 
              transform: translateY(-2px) scale(1.05);
              opacity: 1;
            }
          }
          
          @keyframes buttonHover {
            0% { 
              transform: translateY(0) scale(1); 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            100% { 
              transform: translateY(-2px) scale(1.02); 
              box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            }
          }
          
          @keyframes buttonPress {
            0% { 
              transform: scale(1); 
            }
            50% { 
              transform: scale(0.95); 
            }
            100% { 
              transform: scale(1); 
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;
