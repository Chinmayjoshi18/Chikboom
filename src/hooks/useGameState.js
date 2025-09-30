import { useState, useEffect, useCallback, useRef } from 'react';

// Game configuration constants
const GAME_CONFIG = {
  eggBaseTime: 6000,
  feedConsumptionRate: 2 / 60,
  goldenFeedRate: 3 / 60,
  gracePeriod: 3 * 60 * 1000,
  gameSpeed: 60,
  saveInterval: 10000,
};

// Initial game state
const initialGameState = {
  money: 10,
  eggInventory: 0,
  goldenEggInventory: 0,
  readyEggs: 0,        // Individual eggs ready for collection
  readyGoldenEggs: 0,  // Individual golden eggs ready for collection
  chickens: 3,
  goldenChickens: 0,
  feed: 50,
  cooks: 1,
  
  // Upgrades
  coopUpgrades: 0,
  feedUpgrades: 0,
  kitchenUpgrades: 0,
  
  // Egg production timers
  lastEggTime: Date.now(),
  lastGoldenEggTime: Date.now(),
  
  // Automation
  autoCollector: {
    owned: false,
    active: false,
    timeLeft: 0,
    maxTime: 5 * 60 * 1000,
    cost: 0.1,
  },
  autoFeeder: {
    owned: false,
    active: false,
    timeLeft: 0,
    maxTime: 10 * 60 * 1000,
    cost: 0.15,
  },
  
  // Production system
  productionQueue: [],
  productionSlots: 1,
  products: {
    scrambledEggs: 0,
    omelet: 0,
    eggSandwich: 0,
    birthdayCake: 0,
  },
  
  // Game time
  gameTime: Date.now(),
  gameDay: 1,
  lastUpdate: Date.now(),
  lastSalaryTime: Date.now(),
  lastFeedTime: Date.now(),
  feedGracePeriod: null,
};

// Recipes configuration
const RECIPES = {
  scrambledEggs: {
    name: 'Scrambled Eggs',
    icon: '🍳',
    eggCost: 1,
    goldenEggCost: 0,
    baseTime: 5000,
    sellPrice: 6,
    description: 'Quick and tasty'
  },
  omelet: {
    name: 'Omelet',
    icon: '🥚',
    eggCost: 3,
    goldenEggCost: 0,
    baseTime: 15000,
    sellPrice: 25,
    description: 'Fluffy perfection'
  },
  eggSandwich: {
    name: 'Egg Sandwich',
    icon: '🥪',
    eggCost: 2,
    goldenEggCost: 0,
    baseTime: 30000,
    sellPrice: 15,
    description: 'Hearty meal'
  },
  birthdayCake: {
    name: 'Birthday Cake',
    icon: '🎂',
    eggCost: 4,
    goldenEggCost: 1,
    baseTime: 60000,
    sellPrice: 75,
    description: 'Special celebration'
  },
};

export const useGameState = () => {
  const [gameState, setGameState] = useState(() => {
    // Load saved game state
    try {
      const saved = localStorage.getItem('chickenEmpireGame');
      if (saved) {
        const parsedState = JSON.parse(saved);
        return { ...initialGameState, ...parsedState, lastUpdate: Date.now() };
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
    return initialGameState;
  });

  const [gameInitialized, setGameInitialized] = useState(false);
  const gameLoopRef = useRef(null);
  const saveIntervalRef = useRef(null);

  // Calculate derived values
  const getEggRate = useCallback(() => {
    const base = gameState.chickens;
    const coopBonus = gameState.coopUpgrades * 0.2;
    return base * (1 + coopBonus);
  }, [gameState.chickens, gameState.coopUpgrades]);

  const getGoldenRate = useCallback(() => {
    const base = gameState.goldenChickens;
    const coopBonus = gameState.coopUpgrades * 0.2;
    return base * (1 + coopBonus);
  }, [gameState.goldenChickens, gameState.coopUpgrades]);

  const getTotalFeedConsumption = useCallback(() => {
    return (gameState.chickens * GAME_CONFIG.feedConsumptionRate) +
           (gameState.goldenChickens * GAME_CONFIG.goldenFeedRate);
  }, [gameState.chickens, gameState.goldenChickens]);

  // Game actions
  const updateGameState = useCallback((updater) => {
    setGameState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      return newState;
    });
  }, []);

  const collectEggs = useCallback(() => {
    const totalReady = gameState.readyEggs + gameState.readyGoldenEggs;
    if (totalReady === 0) return;

    // Collect ALL ready eggs at once
    updateGameState(state => ({
      ...state,
      readyEggs: 0,
      readyGoldenEggs: 0,
      eggInventory: state.eggInventory + gameState.readyEggs,
      goldenEggInventory: state.goldenEggInventory + gameState.readyGoldenEggs,
    }));

    // Show floating text for total collected
    if (gameState.readyGoldenEggs > 0 && gameState.readyEggs > 0) {
      showFloatingText(`+${gameState.readyEggs} 🥚 +${gameState.readyGoldenEggs} 🥇`);
    } else if (gameState.readyGoldenEggs > 0) {
      showFloatingText(`+${gameState.readyGoldenEggs} 🥇 Golden Eggs`);
    } else {
      showFloatingText(`+${gameState.readyEggs} 🥚 Eggs`);
    }
  }, [gameState.readyEggs, gameState.readyGoldenEggs, updateGameState, showFloatingText]);

  const sellEggs = useCallback(() => {
    const eggValue = gameState.eggInventory * 1 + gameState.goldenEggInventory * 5;
    if (eggValue > 0) {
      updateGameState(state => ({
        ...state,
        money: state.money + eggValue,
        eggInventory: 0,
        goldenEggInventory: 0,
      }));
      showFloatingText(`+$${eggValue}`);
    }
  }, [gameState.eggInventory, gameState.goldenEggInventory, updateGameState, showFloatingText]);

  const sellProducts = useCallback(() => {
    let totalValue = 0;
    const productUpdates = {};
    
    Object.entries(gameState.products).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const recipe = RECIPES[productId];
        totalValue += quantity * recipe.sellPrice;
        productUpdates[productId] = 0;
      }
    });

    if (totalValue > 0) {
      updateGameState(state => ({
        ...state,
        money: state.money + totalValue,
        products: { ...state.products, ...productUpdates },
      }));
      showFloatingText(`+$${totalValue}`);
    }
  }, [gameState.products, updateGameState, showFloatingText]);

  const buyChicken = useCallback(() => {
    const price = 15 + Math.floor(gameState.chickens * 1.5);
    if (gameState.money >= price) {
      updateGameState(state => ({
        ...state,
        money: state.money - price,
        chickens: state.chickens + 1,
      }));
    }
  }, [gameState.money, gameState.chickens, updateGameState]);

  const buyGoldenChicken = useCallback(() => {
    const price = 500 + gameState.goldenChickens * 100;
    if (gameState.money >= price) {
      updateGameState(state => ({
        ...state,
        money: state.money - price,
        goldenChickens: state.goldenChickens + 1,
      }));
    }
  }, [gameState.money, gameState.goldenChickens, updateGameState]);

  const buyCook = useCallback(() => {
    const price = 200 * Math.pow(2.5, gameState.cooks - 1);
    if (gameState.money >= price) {
      updateGameState(state => ({
        ...state,
        money: state.money - price,
        cooks: state.cooks + 1,
        productionSlots: state.cooks + 1,
      }));
    }
  }, [gameState.money, gameState.cooks, updateGameState]);

  const buyFeed = useCallback((type) => {
    const feedPackages = {
      small: { amount: 100, cost: 25 },
      large: { amount: 500, cost: 125 },
      mega: { amount: 1000, cost: 250 },
    };
    
    const pack = feedPackages[type];
    if (pack && gameState.money >= pack.cost) {
      updateGameState(state => ({
        ...state,
        money: state.money - pack.cost,
        feed: state.feed + pack.amount,
      }));
    }
  }, [gameState.money, updateGameState]);

  const startProduction = useCallback((recipeId) => {
    const recipe = RECIPES[recipeId];
    if (!recipe) return;

    const canProduce = gameState.eggInventory >= recipe.eggCost &&
                      gameState.goldenEggInventory >= recipe.goldenEggCost &&
                      gameState.productionQueue.length < gameState.productionSlots;

    if (canProduce) {
      const productionTime = recipe.baseTime / (1 + gameState.kitchenUpgrades * 0.2);
      
      updateGameState(state => ({
        ...state,
        eggInventory: state.eggInventory - recipe.eggCost,
        goldenEggInventory: state.goldenEggInventory - recipe.goldenEggCost,
        productionQueue: [...state.productionQueue, {
          id: Date.now(),
          recipeId,
          startTime: Date.now(),
          endTime: Date.now() + productionTime,
        }],
      }));
    }
  }, [gameState.eggInventory, gameState.goldenEggInventory, gameState.productionQueue.length, 
      gameState.productionSlots, gameState.kitchenUpgrades, updateGameState]);

  const showFloatingText = useCallback((text) => {
    // This would be implemented with a floating text system
    console.log(`Floating text: ${text}`);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const now = Date.now();
    setGameState(prevState => {
      const deltaTime = Math.min(now - prevState.lastUpdate, 60000); // Cap at 1 minute
      let newState = { ...prevState, lastUpdate: now };

      // Update game time (60x speed)
      const gameTimeIncrease = deltaTime * GAME_CONFIG.gameSpeed;
      newState.gameTime = prevState.gameTime + gameTimeIncrease;
      newState.gameDay = Math.floor((newState.gameTime - initialGameState.gameTime) / (24 * 60 * 60 * 1000)) + 1;

      // Produce eggs individually over time
      if (newState.feed > 0) { // Only produce eggs if there's feed
        const eggProductionTime = GAME_CONFIG.eggBaseTime / (1 + newState.coopUpgrades * 0.2);
        
        // Regular eggs production
        if (newState.chickens > 0) {
          const timeSinceLastEgg = now - newState.lastEggTime;
          const eggsToAdd = Math.floor(timeSinceLastEgg / eggProductionTime) * newState.chickens;
          if (eggsToAdd > 0) {
            newState.readyEggs += eggsToAdd;
            newState.lastEggTime = now;
          }
        }
        
        // Golden eggs production  
        if (newState.goldenChickens > 0) {
          const timeSinceLastGolden = now - newState.lastGoldenEggTime;
          const goldenEggsToAdd = Math.floor(timeSinceLastGolden / eggProductionTime) * newState.goldenChickens;
          if (goldenEggsToAdd > 0) {
            newState.readyGoldenEggs += goldenEggsToAdd;
            newState.lastGoldenEggTime = now;
          }
        }
      }

      // Feed consumption
      const feedConsumption = getTotalFeedConsumption() * (deltaTime / 60000);
      newState.feed = Math.max(0, newState.feed - feedConsumption);

      // Handle feed grace period
      if (newState.feed <= 0 && !newState.feedGracePeriod) {
        newState.feedGracePeriod = now + GAME_CONFIG.gracePeriod;
      } else if (newState.feed > 0 && newState.feedGracePeriod) {
        newState.feedGracePeriod = null;
      }

      // Kill chickens if grace period expired
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

      // Pay cook salaries (every hour)
      const salaryInterval = 60 * 60 * 1000; // 1 hour in game time
      if (now - newState.lastSalaryTime >= salaryInterval / GAME_CONFIG.gameSpeed) {
        const salaryCost = newState.cooks * 10;
        newState.money = Math.max(-200, newState.money - salaryCost); // Allow negative money up to -200
        newState.lastSalaryTime = now;
      }

      // Update automation systems
      if (newState.autoCollector.active && newState.autoCollector.timeLeft > 0) {
        newState.autoCollector.timeLeft = Math.max(0, newState.autoCollector.timeLeft - deltaTime);
        newState.money -= newState.autoCollector.cost * (deltaTime / 1000);
        
        if (newState.autoCollector.timeLeft <= 0) {
          newState.autoCollector.active = false;
        }
      }

      if (newState.autoFeeder.active && newState.autoFeeder.timeLeft > 0) {
        newState.autoFeeder.timeLeft = Math.max(0, newState.autoFeeder.timeLeft - deltaTime);
        newState.money -= newState.autoFeeder.cost * (deltaTime / 1000);
        
        if (newState.autoFeeder.timeLeft <= 0) {
          newState.autoFeeder.active = false;
        }
      }

      return newState;
    });
  }, [getTotalFeedConsumption]);

  // Save game
  const saveGame = useCallback(() => {
    try {
      localStorage.setItem('chickenEmpireGame', JSON.stringify(gameState));
    } catch (error) {
      console.error('Error saving game:', error);
    }
  }, [gameState]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    localStorage.removeItem('chickenEmpireGame');
    setGameInitialized(false);
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    if (gameInitialized) return;

    // Clear any existing intervals
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);

    // Start game loop
    gameLoopRef.current = setInterval(gameLoop, 100); // 10 FPS
    
    // Start save interval
    saveIntervalRef.current = setInterval(saveGame, GAME_CONFIG.saveInterval);

    setGameInitialized(true);
  }, [gameInitialized, gameLoop, saveGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  return {
    // Game state
    gameState,
    gameInitialized,
    
    // Calculated values - now showing ready eggs instead of production rates
    eggRate: gameState.readyEggs,
    goldenRate: gameState.readyGoldenEggs,
    feedConsumption: getTotalFeedConsumption(),
    
    // Actions
    initGame,
    resetGame,
    saveGame,
    collectEggs,
    sellEggs,
    sellProducts,
    buyChicken,
    buyGoldenChicken,
    buyCook,
    buyFeed,
    startProduction,
    
    // Recipes
    recipes: RECIPES,
  };
};
