import React from 'react';

const ProductionKitchen = ({ gameState, recipes, onStartProduction }) => {
  const canAffordRecipe = (recipe) => {
    return gameState.eggInventory >= recipe.eggCost && 
           gameState.goldenEggInventory >= recipe.goldenEggCost &&
           gameState.productionQueue.length < gameState.productionSlots;
  };

  const getProductionTime = (baseTime) => {
    return baseTime / (1 + gameState.kitchenUpgrades * 0.2);
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgress = (item) => {
    const now = Date.now();
    const totalTime = item.endTime - item.startTime;
    const elapsed = now - item.startTime;
    return Math.min(100, (elapsed / totalTime) * 100);
  };

  const getRemainingTime = (item) => {
    const now = Date.now();
    return Math.max(0, item.endTime - now);
  };

  return (
    <div className="game-card" style={{ padding: '24px' }}>
      <h2 className="text-xl font-bold text-center mb-4" style={{ 
        color: '#16a34a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '8px' 
      }}>
        🍳 Production Kitchen
      </h2>
      
      <div className="text-center text-sm mb-4" style={{ color: '#6b7280' }}>
        Using {gameState.productionQueue.length}/{gameState.productionSlots} production slots
        <br />
        {gameState.productionQueue.length === 0 ? 'No items in production' : ''}
        {gameState.cooks > 0 ? `All ${gameState.cooks} cook${gameState.cooks > 1 ? 's' : ''} available` : ''}
      </div>

      {/* Production Queue */}
      {gameState.productionQueue.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold" style={{ color: '#374151' }}>Current Production:</h3>
          {gameState.productionQueue.map(item => {
            const recipe = recipes[item.recipeId];
            const progress = getProgress(item);
            const remaining = getRemainingTime(item);
            
            return (
              <div key={item.id} style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                padding: '12px' 
              }}>
                <div className="flex" style={{ 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px' 
                }}>
                  <span className="font-medium">{recipe.icon} {recipe.name}</span>
                  <span className="text-sm" style={{ color: '#6b7280' }}>
                    {formatTime(remaining)} left
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid" style={{ 
        gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(2, minmax(0, 1fr))' : '1fr', 
        gap: '16px' 
      }}>
        {Object.entries(recipes).map(([recipeId, recipe]) => (
          <div 
            key={recipeId}
            style={{ 
              border: canAffordRecipe(recipe) ? '2px solid #dcf2e8' : '2px solid #e5e7eb',
              borderRadius: '8px', 
              padding: '16px', 
              transition: 'all 0.3s ease',
              cursor: canAffordRecipe(recipe) ? 'pointer' : 'not-allowed',
              backgroundColor: canAffordRecipe(recipe) ? 'white' : '#f9fafb',
              opacity: canAffordRecipe(recipe) ? 1 : 0.6
            }}
            onClick={() => canAffordRecipe(recipe) && onStartProduction(recipeId)}
            onMouseOver={(e) => {
              if (canAffordRecipe(recipe)) {
                e.target.style.borderColor = '#2E8B57';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (canAffordRecipe(recipe)) {
                e.target.style.borderColor = '#dcf2e8';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{recipe.icon}</div>
              <div className="font-bold mb-1" style={{ color: '#1f2937' }}>{recipe.name}</div>
              <div className="text-xs mb-3" style={{ color: '#6b7280' }}>{recipe.description}</div>
              
              {/* Costs */}
              <div className="text-sm space-y-1 mb-3">
                {recipe.eggCost > 0 && (
                  <div style={{ 
                    color: gameState.eggInventory >= recipe.eggCost ? '#16a34a' : '#ef4444' 
                  }}>
                    🥚 {recipe.eggCost} eggs
                  </div>
                )}
                {recipe.goldenEggCost > 0 && (
                  <div style={{ 
                    color: gameState.goldenEggInventory >= recipe.goldenEggCost ? '#16a34a' : '#ef4444' 
                  }}>
                    🥇 {recipe.goldenEggCost} golden
                  </div>
                )}
              </div>

              {/* Time and Value */}
              <div className="text-xs space-y-1" style={{ color: '#6b7280' }}>
                <div>⏱️ {formatTime(getProductionTime(recipe.baseTime))}</div>
                <div>💰 Sells for ${recipe.sellPrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionKitchen;