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
    return parseFloat(localStorage.getItem('piBalance')) || 0;
  });

  const [upgrades, setUpgrades] = useState(() => {
    return JSON.parse(localStorage.getItem('upgrades')) || {};
  });

  const [clickPower, setClickPower] = useState(() => {
    return parseFloat(localStorage.getItem('clickPower')) || 0.1;
  });

  const [totalEarned, setTotalEarned] = useState(() => {
    return parseFloat(localStorage.getItem('totalEarned')) || 0;
  });

  const [totalSpent, setTotalSpent] = useState(() => {
    return parseFloat(localStorage.getItem('totalSpent')) || 0;
  });

  const [timePlayed, setTimePlayed] = useState(() => {
    return parseInt(localStorage.getItem('timePlayed')) || 0;
  });

  // Salvestamine
  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
    localStorage.setItem('clickPower', clickPower);
    localStorage.setItem('totalEarned', totalEarned);
    localStorage.setItem('totalSpent', totalSpent);
    localStorage.setItem('timePlayed', timePlayed);
  }, [piBalance, upgrades, clickPower, totalEarned, totalSpent, timePlayed]);

  // Aeg kasvab iga sekund
  useEffect(() => {
    const timer = setInterval(() => {
      setTimePlayed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalIncome = upgradesData.reduce((acc, upgrade) => {
    const count = upgrades[upgrade.id] || 0;
    return acc + count * upgrade.income;
  }, 0);

  // Smooth Pi/s voolamine
  useEffect(() => {
    const interval = setInterval(() => {
      const step = totalIncome / 20;
      setPiBalance(prev => {
        const updated = parseFloat((prev + step).toFixed(4));
        setTotalEarned(prevEarned => parseFloat((prevEarned + step).toFixed(4)));
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [totalIncome]);

  const handleClick = () => {
    setPiBalance(prev => {
      const updated = parseFloat((prev + clickPower).toFixed(4));
      setTotalEarned(prevEarned => parseFloat((prevEarned + clickPower).toFixed(4)));
      return updated;
    });
  };

  const handleBuy = (id, baseCost) => {
    const count = upgrades[id] || 0;
    const cost = Math.floor(baseCost * Math.pow(1.2, count));
    if (piBalance >= cost) {
      setPiBalance(prev => parseFloat((prev - cost).toFixed(4)));
      setUpgrades(prev => ({
        ...prev,
        [id]: count + 1,
      }));
      setTotalSpent(prev => parseFloat((prev + cost).toFixed(4)));
    }
  };

  const handleClickUpgrade = () => {
    const cost = Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1));
    if (piBalance >= cost) {
      setPiBalance(prev => parseFloat((prev - cost).toFixed(4)));
      setClickPower(prev => parseFloat((prev + 0.1).toFixed(2)));
      setTotalSpent(prev => parseFloat((prev + cost).toFixed(4)));
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the game?")) {
      setPiBalance(0);
      setClickPower(0.1);
      setUpgrades({});
      setTotalEarned(0);
      setTotalSpent(0);
      setTimePlayed(0);
      localStorage.clear();
    }
  };

  const clickUpgradeCost = Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1));

  // Sekundid minutiteks
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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

      <div className="stats" style={{ marginTop: '3rem' }}>
        <h2>Statistics</h2>
        <p>Total earned: {totalEarned.toFixed(2)} Pi</p>
        <p>Total spent: {totalSpent.toFixed(2)} Pi</p>
        <p>Time played: {formatTime(timePlayed)}</p>
        <button onClick={handleReset} style={{ marginTop: '1rem', backgroundColor: '#e74c3c', color: 'white' }}>
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default App;
