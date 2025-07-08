import { useState, useEffect } from 'react';
import './App.css';

const upgradesData = [
  { id: 'pioneer', name: 'Pioneer', baseCost: 20, income: 0.05 },
  { id: 'miner', name: 'Miner', baseCost: 50, income: 0.2 },
  { id: 'node', name: 'Node', baseCost: 200, income: 1 },
  { id: 'validator', name: 'Validator', baseCost: 500, income: 3 },
  { id: 'botnet', name: 'AI Botnet', baseCost: 1500, income: 10 },
  { id: 'solar', name: 'Solar Farm', baseCost: 5000, income: 25 },
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

  const [clickPower, setClickPower] = useState(() => {
    const saved = localStorage.getItem('clickPower');
    return saved ? parseFloat(saved) : 0.1;
  });

  // Salvestamine
  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
    localStorage.setItem('clickPower', clickPower);
  }, [piBalance, upgrades, clickPower]);

  // Pi per second arvutus
  const totalIncome = upgradesData.reduce((acc, upgrade) => {
    const count = upgrades[upgrade.id] || 0;
    return acc + count * upgrade.income;
  }, 0);

  // Smooth passive income
useEffect(() => {
  const interval = setInterval(() => {
    const step = totalIncome / 20; // jagame 20-ks → 50ms intervall = 1000ms kokku
    setPiBalance(prev => parseFloat((prev + step).toFixed(4)));
  }, 50); // 20 korda sekundis
  return () => clearInterval(interval);
}, [totalIncome]);

  const handleClick = () => {
    setPiBalance(prev => parseFloat((prev + clickPower).toFixed(2)));
  };

  const handleBuy = (id, baseCost) => {
    const count = upgrades[id] || 0;
    const cost = Math.floor(baseCost * Math.pow(1.2, count));
    if (piBalance >= cost) {
      setPiBalance(prev => parseFloat((prev - cost).toFixed(2)));
      setUpgrades(prev => ({
        ...prev,
        [id]: count + 1,
      }));
    }
  };

  const handleClickUpgrade = () => {
    const cost = Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1));
    if (piBalance >= cost) {
      setPiBalance(prev => parseFloat((prev - cost).toFixed(2)));
      setClickPower(prev => parseFloat((prev + 0.1).toFixed(2)));
    }
  };

  const clickUpgradeCost = Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1));

  return (
    <div className="app">
      <h1>Pi Clicker</h1>
      <p><strong>Balance:</strong> {piBalance.toFixed(2)} Pi</p>
      <p><strong>Pi / second:</strong> {totalIncome.toFixed(2)}</p>
      <p><strong>Pi / click:</strong> {clickPower.toFixed(2)}</p>

      <button onClick={handleClick} className="coin-button">
        <img src="/pi-coin.png" alt="Pi coin" className="coin-image" />
      </button>

      <div className="shop">
        <h2>Click Upgrade</h2>
        <button onClick={handleClickUpgrade}>
          Upgrade click (+0.1 Pi) – {clickUpgradeCost} Pi
        </button>

        <h2 style={{ marginTop: '2rem' }}>Upgrades</h2>
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
