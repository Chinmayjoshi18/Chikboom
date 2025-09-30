import React from 'react';

const CollectButton = ({ eggRate, goldenRate, onCollect }) => {
  const totalEggs = eggRate + goldenRate;

  return (
    <button
      onClick={onCollect}
      disabled={totalEggs === 0}
      className="collect-button"
    >
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥚</div>
      <div>Collect</div>
      <div style={{ fontSize: '14px', opacity: '0.9', marginTop: '4px' }}>
        {totalEggs} ready
      </div>
    </button>
  );
};

export default CollectButton;