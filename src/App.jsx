import { useState, useEffect } from 'react';
import './App.css';

const upgradesData = [
  { id: 'pioneer', name: 'Pioneer', baseCost: 20, income: 0.05 },
  { id: 'miner', name: 'Miner', baseCost: 50, income: 0.2 },
  { id: 'node', name: 'Node', baseCost: 200, income: 1 },
];

function App() {
  const [piBalance, setPiBalance] = useState(() => {
    const saved = localStorage.getItem('piBalance');
    return saved ? parseFloat(saved) : 0;
  });

  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('upgrades');
    return saved ? JSON.parse(saved) : {};
  });

  // Salvestus
  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
  }, [piBalance, upgrades]);

  // Automaatne teenimine
  useEffect(() => {
    const interval = setInterval(() => {
      let totalIncome = 0;
      for (const upgrade of upgradesData) {
        const count = upgrades[upgrade.id] || 0;
        totalIncome += count * upgrade.income;
      }
      setPiBalance(prev => parseFloat((prev + totalIncome).toFixed(2)));
    }, 1000);
    return () => clearInterval(interval);
  }, [upgrades]);

  const handleClick = () => {
    setPiBalance(prev => parseFloat((prev + 0.1).toFixed(2)));
  };

  const handleBuy = (id, baseCost) => {
    const count = upgrades[id] || 0;
    const cost = Math.floor(baseCost * Math.pow(1.2, count)); // Hind kasvab 20% iga ostuga
    if (piBalance >= cost) {
      setPiBalance(prev => parseFloat((prev - cost).toFixed(2)));
      setUpgrades(prev => ({
        ...prev,
        [id]: count + 1,
      }));
    }
  };

  return (
    <div className="app">
      <h1>Pi Clicker</h1>
      <p><strong>Balance:</strong> {piBalance.toFixed(2)} Pi</p>
      <button onClick={handleClick} className="coin-button">
        <img src="/pi-coin.png" alt="Pi coin" className="coin-image" />
      </button>

      <div className="shop">
        <h2>Upgrades</h2>
        {upgradesData.map(upg => {
          const count = upgrades[upg.id] || 0;
          const cost = Math.floor(upg.baseCost * Math.pow(1.2, count));
          return (
            <div key={upg.id} style={{ marginBottom: '1rem' }}>
              <p><strong>{upg.name}</strong> (owned: {count})</p>
              <p>Generates: +{upg.income}/s</p>
              <button onClick={() => handleBuy(upg.id, upg.baseCost)}>
                Buy for {cost} Pi
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
