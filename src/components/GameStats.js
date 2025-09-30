import React from 'react';

const GameStats = ({ gameState, eggRate, goldenRate, feedConsumption }) => {
  const formatMoney = (amount) => `$${amount.toFixed(2)}`;
  
  const formatFeedTime = () => {
    if (feedConsumption === 0) return '∞';
    const hoursLeft = gameState.feed / (feedConsumption * 60);
    return hoursLeft > 0 ? `~${hoursLeft.toFixed(1)} hours` : 'OUT OF FEED!';
  };

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="flex justify-center">
        <div className="balance-card">
          <div className="balance-amount">
            {formatMoney(gameState.money)}
          </div>
          <div className="balance-label">
            Balance
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid" style={{ 
        gridTemplateColumns: window.innerWidth >= 768 ? 
          (window.innerWidth >= 1024 ? 'repeat(6, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))') : 
          'repeat(2, minmax(0, 1fr))',
        gap: '12px' 
      }}>
        {/* Ready Eggs */}
        <div className="stat-card">
          <div className="text-2xl font-bold" style={{ color: '#16a34a', marginBottom: '4px' }}>
            {eggRate + goldenRate}
          </div>
          <div className="text-xs" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            🥚 Ready
          </div>
        </div>

        {/* Egg Inventory */}
        <div className="stat-card">
          <div className="text-2xl font-bold" style={{ color: '#16a34a', marginBottom: '4px' }}>
            {gameState.eggInventory}
          </div>
          <div className="text-xs" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            📦 Inventory
          </div>
        </div>

        {/* Chickens */}
        <div className="stat-card">
          <div className="text-2xl font-bold" style={{ color: '#16a34a', marginBottom: '4px' }}>
            {gameState.chickens}
          </div>
          <div className="text-xs" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            🐔 Chickens
          </div>
        </div>

        {/* Golden Chickens */}
        <div className="stat-card">
          <div className="text-2xl font-bold" style={{ color: '#16a34a', marginBottom: '4px' }}>
            {gameState.goldenChickens}
          </div>
          <div className="text-xs" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            🐓 Golden
          </div>
        </div>

        {/* Feed */}
        <div className="stat-card">
          <div className="text-2xl font-bold" style={{ color: '#16a34a', marginBottom: '4px' }}>
            {Math.floor(gameState.feed)}
          </div>
          <div className="text-xs" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            🌾 Feed
          </div>
        </div>

        {/* Cooks */}
        <div className="stat-card">
          <div className="text-2xl font-bold" style={{ color: '#16a34a', marginBottom: '4px' }}>
            {gameState.cooks}
          </div>
          <div className="text-xs" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            👨‍🍳 Cooks
          </div>
        </div>
      </div>

      {/* Feed Status */}
      <div className="game-card" style={{ padding: '12px' }}>
        <div className="text-center text-sm font-medium" style={{ 
          color: gameState.feed > 10 ? '#16a34a' : 
                gameState.feed > 0 ? '#ca8a04' : '#ef4444'
        }}>
          {gameState.feed > 0 
            ? `Feed will last ${formatFeedTime()} at current consumption`
            : '⚠️ OUT OF FEED! Chickens will start dying!'
          }
        </div>
      </div>
    </div>
  );
};

export default GameStats;