import React from 'react';

const Shop = ({ gameState, onBuyChicken, onBuyGoldenChicken, onBuyCook, onBuyFeed }) => {
  const formatMoney = (amount) => `$${amount}`;

  const getChickenPrice = () => 15 + Math.floor(gameState.chickens * 1.5);
  const getGoldenChickenPrice = () => 500 + gameState.goldenChickens * 100;
  const getCookPrice = () => Math.floor(200 * Math.pow(2.5, gameState.cooks - 1));
  const getCookSalary = () => gameState.cooks * 10;

  const canAfford = (price) => gameState.money >= price;

  const ShopItem = ({ title, description, price, onBuy, disabled, icon, children }) => (
    <div className="shop-item" onClick={() => !disabled && !(!canAfford(price)) && onBuy()}>
      <div className="flex" style={{ alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <h3 className="font-bold text-sm" style={{ color: '#1f2937', marginBottom: '4px' }}>
            {title}
          </h3>
          <p className="text-xs mb-3" style={{ color: '#6b7280' }}>{description}</p>
          {children}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && canAfford(price)) onBuy();
            }}
            disabled={disabled || !canAfford(price)}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '8px 16px',
              fontSize: '14px',
              opacity: (disabled || !canAfford(price)) ? 0.5 : 1,
              background: (disabled || !canAfford(price)) ? '#ccc' : undefined,
              cursor: (disabled || !canAfford(price)) ? 'not-allowed' : 'pointer'
            }}
          >
            {formatMoney(price)}
          </button>
        </div>
      </div>
    </div>
  );

  const FeedItem = ({ type, amount, cost, bestValue }) => (
    <div className="shop-item text-center" onClick={() => canAfford(cost) && onBuyFeed(type.toLowerCase())}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌾</div>
      <h3 className="font-bold text-sm mb-1" style={{ color: '#1f2937' }}>
        {type} Feed Pack
        {bestValue && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '10px', 
            backgroundColor: '#dcf2e8', 
            color: '#15803d', 
            padding: '2px 8px', 
            borderRadius: '9999px' 
          }}>
            Best Value!
          </span>
        )}
      </h3>
      <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
        {amount} units of feed<br />
        ${(cost / amount).toFixed(2)} per unit
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (canAfford(cost)) onBuyFeed(type.toLowerCase());
        }}
        disabled={!canAfford(cost)}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '14px',
          opacity: !canAfford(cost) ? 0.5 : 1,
          background: !canAfford(cost) ? '#ccc' : undefined,
          cursor: !canAfford(cost) ? 'not-allowed' : 'pointer'
        }}
      >
        Buy for {formatMoney(cost)}
      </button>
    </div>
  );

  return (
    <div className="game-card" style={{ padding: '16px' }}>
      <h2 className="text-xl font-bold mb-4 text-center" style={{ 
        color: '#16a34a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        🛒 Shop
      </h2>
      
      <div className="space-y-6 overflow-y-auto" style={{ 
        maxHeight: '600px',
        paddingRight: '8px'
      }}>
        {/* Livestock Category */}
        <div>
          <div className="category-title">🐔 Livestock</div>
          <div className="grid" style={{ 
            gridTemplateColumns: window.innerWidth >= 1280 ? 'repeat(2, minmax(0, 1fr))' : '1fr', 
            gap: '12px' 
          }}>
            <ShopItem
              icon="🐔"
              title="Chicken"
              description="Lays eggs every 6 seconds"
              price={getChickenPrice()}
              onBuy={onBuyChicken}
            />
            <ShopItem
              icon="🐓"
              title="Golden Chicken"
              description="Golden eggs worth $10!"
              price={getGoldenChickenPrice()}
              onBuy={onBuyGoldenChicken}
            />
          </div>
        </div>

        {/* Staff Category */}
        <div>
          <div className="category-title">👥 Staff</div>
          <div className="grid grid-cols-1" style={{ gap: '12px' }}>
            <ShopItem
              icon="👨‍🍳"
              title="Hire Cook"
              description={`+1 production slot\n$${getCookSalary()}/hr salary`}
              price={getCookPrice()}
              onBuy={onBuyCook}
            />
          </div>
        </div>

        {/* Feed Supply Category */}
        <div>
          <div className="category-title">🌾 Feed Supply</div>
          <div className="grid" style={{ 
            gridTemplateColumns: window.innerWidth >= 1280 ? 'repeat(3, minmax(0, 1fr))' : '1fr', 
            gap: '12px' 
          }}>
            <FeedItem type="Small" amount={100} cost={25} />
            <FeedItem type="Large" amount={500} cost={125} bestValue />
            <FeedItem type="Mega" amount={1000} cost={250} />
          </div>
        </div>

        {/* Tools Category */}
        <div>
          <div className="category-title">🔧 Tools</div>
          <div className="grid grid-cols-1" style={{ gap: '12px' }}>
            <div className="shop-item text-center">
              <h3 className="font-bold text-sm mb-3" style={{ color: '#1f2937' }}>
                🔧 Game Tools
              </h3>
              <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Save & debug</p>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    try {
                      localStorage.setItem('chickenEmpireGame', JSON.stringify(gameState));
                      alert('Game saved!');
                    } catch (error) {
                      alert('Save failed: ' + error.message);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  💾 Save
                </button>
                <button 
                  onClick={() => {
                    console.log('Game State:', gameState);
                    alert('Debug info logged to console (F12)');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔍 Debug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;