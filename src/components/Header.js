import React from 'react';

const Header = ({ gameState, gameInitialized, onStartGame, onResetGame }) => {
  const formatTime = (gameTime) => {
    const date = new Date(gameTime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="game-card" style={{ padding: '16px', marginBottom: '16px' }}>
      <div className="flex" style={{ 
        flexDirection: window.innerWidth >= 640 ? 'row' : 'column',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '16px' 
      }}>
        {/* Time Info */}
        <div style={{ textAlign: window.innerWidth >= 640 ? 'left' : 'center' }}>
          <h2 className="text-xl font-bold" style={{ 
            color: '#16a34a', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            justifyContent: window.innerWidth >= 640 ? 'flex-start' : 'center'
          }}>
            📅 Day {gameState.gameDay} | 🕐 {formatTime(gameState.gameTime)}
          </h2>
          <p className="text-sm" style={{ color: '#6b7280', marginTop: '4px' }}>
            Game Time: 60x Speed (1 real minute = 1 game hour)
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex" style={{ gap: '12px' }}>
          {!gameInitialized ? (
            <button
              onClick={onStartGame}
              style={{
                background: 'linear-gradient(45deg, #16a34a, #22c55e)',
                color: 'white',
                fontWeight: 'bold',
                padding: '8px 24px',
                borderRadius: '9999px',
                border: 'none',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(22, 163, 74, 0.4)';
              }}
            >
              🚀 Start Game
            </button>
          ) : null}
          
          <button
            onClick={onResetGame}
            style={{
              background: 'linear-gradient(45deg, #ef4444, #dc2626)',
              color: 'white',
              fontWeight: 'bold',
              padding: '8px 24px',
              borderRadius: '9999px',
              border: 'none',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;