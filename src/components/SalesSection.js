import React from 'react';

const SalesSection = ({ gameState, onSellEggs, onSellProducts, recipes }) => {
  const getEggValue = () => {
    return gameState.eggInventory * 1 + gameState.goldenEggInventory * 5;
  };

  const getTotalEggCount = () => {
    return gameState.eggInventory + gameState.goldenEggInventory;
  };

  const getProductValue = () => {
    let total = 0;
    Object.entries(gameState.products).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const recipe = recipes[productId];
        total += quantity * recipe.sellPrice;
      }
    });
    return total;
  };

  const getTotalProductCount = () => {
    return Object.values(gameState.products).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="space-y-4">
      {/* Sell Eggs Button */}
      <button
        onClick={onSellEggs}
        disabled={getTotalEggCount() === 0}
        className="sales-button"
        style={{ 
          width: '100%',
          opacity: getTotalEggCount() === 0 ? 0.6 : 1,
          cursor: getTotalEggCount() === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <div style={{ fontSize: '18px', marginBottom: '4px' }}>💰 Sell Eggs</div>
        <div style={{ fontSize: '14px', opacity: '0.9' }}>
          {getTotalEggCount()} eggs (${getEggValue()})
        </div>
      </button>

      {/* Sell Products Button */}
      <button
        onClick={onSellProducts}
        disabled={getTotalProductCount() === 0}
        className="sales-button"
        style={{ 
          width: '100%',
          opacity: getTotalProductCount() === 0 ? 0.6 : 1,
          cursor: getTotalProductCount() === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <div style={{ fontSize: '18px', marginBottom: '4px' }}>🍽️ Sell Products</div>
        <div style={{ fontSize: '14px', opacity: '0.9' }}>
          {getTotalProductCount()} products (${getProductValue()})
        </div>
      </button>

      {/* Product Inventory Display */}
      {getTotalProductCount() > 0 && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          padding: '12px' 
        }}>
          <div className="text-sm font-semibold mb-2" style={{ color: '#374151' }}>
            Ready to Sell:
          </div>
          <div className="space-y-1">
            {Object.entries(gameState.products).map(([productId, quantity]) => {
              if (quantity === 0) return null;
              const recipe = recipes[productId];
              return (
                <div key={productId} className="flex" style={{ 
                  justifyContent: 'space-between', 
                  fontSize: '12px' 
                }}>
                  <span>{recipe.icon} {recipe.name}</span>
                  <span className="font-medium">{quantity} × ${recipe.sellPrice}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesSection;