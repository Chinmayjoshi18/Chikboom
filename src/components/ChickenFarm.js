import React from 'react';

const ChickenFarm = ({ gameState }) => {
  const renderChickens = () => {
    const chickens = [];
    const hasFood = gameState.feed > 0;
    
    // Regular chickens
    for (let i = 1; i <= gameState.chickens; i++) {
      chickens.push(
        <div key={`chicken-${i}`} className="text-center">
          <div style={{ 
            fontSize: '30px', 
            marginBottom: '4px', 
            filter: hasFood ? 'none' : 'grayscale(100%)',
            opacity: hasFood ? 1 : 0.5
          }}>
            🐔
          </div>
          <div className="text-xs" style={{ color: '#6b7280' }}>
            Chicken {i}
          </div>
          <div className="text-xs font-medium" style={{ color: hasFood ? '#16a34a' : '#ef4444' }}>
            {hasFood ? 'Productive' : 'Starving'}
          </div>
        </div>
      );
    }
    
    // Golden chickens
    for (let i = 1; i <= gameState.goldenChickens; i++) {
      chickens.push(
        <div key={`golden-${i}`} className="text-center">
          <div style={{ 
            fontSize: '30px', 
            marginBottom: '4px', 
            filter: hasFood ? 'none' : 'grayscale(100%)',
            opacity: hasFood ? 1 : 0.5
          }}>
            🐓
          </div>
          <div className="text-xs" style={{ color: '#6b7280' }}>
            Golden {i}
          </div>
          <div className="text-xs font-medium" style={{ color: hasFood ? '#ca8a04' : '#ef4444' }}>
            {hasFood ? 'Productive' : 'Starving'}
          </div>
        </div>
      );
    }
    
    return chickens;
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
        🐔 Your Chicken Farm
      </h2>
      
      <div style={{ 
        background: 'linear-gradient(to bottom, #f0fdf4, #dcf2e8)', 
        borderRadius: '12px', 
        padding: '24px', 
        minHeight: '128px' 
      }}>
        {gameState.chickens + gameState.goldenChickens === 0 ? (
          <div className="text-center" style={{ color: '#6b7280', padding: '32px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏜️</div>
            <p>No chickens yet! Buy some from the shop.</p>
          </div>
        ) : (
          <div className="grid" style={{ 
            gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(6, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', 
            gap: '16px' 
          }}>
            {renderChickens()}
          </div>
        )}
      </div>
      
      {/* Grace period warning */}
      {gameState.feedGracePeriod && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fca5a5', 
          borderRadius: '8px' 
        }}>
          <div className="text-center font-bold" style={{ color: '#b91c1c' }}>
            ⚠️ CRITICAL: Chickens are starving! Feed them quickly or they will die!
          </div>
        </div>
      )}
    </div>
  );
};

export default ChickenFarm;