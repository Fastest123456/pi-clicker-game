
// Täismahus App.jsx koos Pi makse funktsionaalsusega
import { useState, useEffect } from 'react';
import './App.css';

const Pi = window?.Pi;

// Upgrades that generate Pi/s
const upgradesData = [
  { id: 'pioneer', name: 'Pioneer', baseCost: 20, income: 0.05 },
  { id: 'miner', name: 'Miner', baseCost: 50, income: 0.2 },
  { id: 'node', name: 'Node', baseCost: 200, income: 1 },
  { id: 'validator', name: 'Validator', baseCost: 500, income: 3 },
  { id: 'botnet', name: 'AI Botnet', baseCost: 1500, income: 10 },
  { id: 'solar', name: 'Solar Farm', baseCost: 5000, income: 25 },
];

function App() {
  const [piBalance, setPiBalance] = useState(() => parseFloat(localStorage.getItem('piBalance')) || 0);
  const [upgrades, setUpgrades] = useState(() => JSON.parse(localStorage.getItem('upgrades')) || {});
  const [clickPower, setClickPower] = useState(() => parseFloat(localStorage.getItem('clickPower')) || 0.1);
  const [totalEarned, setTotalEarned] = useState(() => parseFloat(localStorage.getItem('totalEarned')) || 0);
  const [totalSpent, setTotalSpent] = useState(() => parseFloat(localStorage.getItem('totalSpent')) || 0);
  const [rebirthCount, setRebirthCount] = useState(() => parseInt(localStorage.getItem('rebirthCount')) || 0);
  const [rebirthPoints, setRebirthPoints] = useState(() => parseInt(localStorage.getItem('rebirthPoints')) || 0);
  const [permBoost, setPermBoost] = useState(() => parseFloat(localStorage.getItem('permBoost')) || 0);

  const [showPiShop, setShowPiShop] = useState(false);

  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
    localStorage.setItem('clickPower', clickPower);
    localStorage.setItem('totalEarned', totalEarned);
    localStorage.setItem('totalSpent', totalSpent);
    localStorage.setItem('rebirthCount', rebirthCount);
    localStorage.setItem('rebirthPoints', rebirthPoints);
    localStorage.setItem('permBoost', permBoost);
  }, [piBalance, upgrades, clickPower, totalEarned, totalSpent, rebirthCount, rebirthPoints, permBoost]);

  const incomeMultiplier = (1 + rebirthCount * 0.1) * (1 + permBoost);
  const totalIncome = upgradesData.reduce((acc, u) => acc + (upgrades[u.id] || 0) * u.income, 0) * incomeMultiplier;

  useEffect(() => {
    const interval = setInterval(() => {
      const step = totalIncome / 20;
      setPiBalance(p => parseFloat((p + step).toFixed(4)));
      setTotalEarned(e => parseFloat((e + step).toFixed(4)));
    }, 50);
    return () => clearInterval(interval);
  }, [totalIncome]);

  const handleClick = () => {
    const bonus = clickPower + rebirthCount * 0.1;
    setPiBalance(p => parseFloat((p + bonus).toFixed(4)));
    setTotalEarned(e => parseFloat((e + bonus).toFixed(4)));
  };

  const handleBuy = (id, baseCost) => {
    const count = upgrades[id] || 0;
    const cost = Math.floor(baseCost * Math.pow(1.2, count));
    if (piBalance >= cost) {
      setPiBalance(p => parseFloat((p - cost).toFixed(4)));
      setTotalSpent(s => parseFloat((s + cost).toFixed(4)));
      setUpgrades(u => ({ ...u, [id]: count + 1 }));
    }
  };

  const handleClickUpgrade = () => {
    const cost = Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1));
    if (piBalance >= cost) {
      setPiBalance(p => parseFloat((p - cost).toFixed(4)));
      setClickPower(cp => parseFloat((cp + 0.1).toFixed(2)));
      setTotalSpent(s => parseFloat((s + cost).toFixed(4)));
    }
  };

  const handlePiPayment = async () => {
    if (!Pi || !Pi.createPayment) {
      alert('Pi SDK not available. Please open this app in the Pi Browser.');
      return;
    }

    try {
      const payment = await Pi.createPayment({
        amount: 0.01,
        memo: "Buy 100 game Pi",
        metadata: { type: 'game-purchase', value: 100 }
      });

      if (payment.identifier) {
        alert('Payment successful! You received 100 in-game Pi!');
        setPiBalance(b => b + 100);
      }
    } catch (error) {
      alert('Payment failed or cancelled.');
      console.error(error);
    }
  };

  return (
    <div className="app">
      <h1>Pi Clicker</h1>

      <div className="top-buttons">
        <button onClick={() => setShowPiShop(s => !s)}>Pi Shop</button>
      </div>

      {showPiShop && (
        <div className="panel">
          <h2>Spend real Pi</h2>
          <p>Buy 100 game Pi for 0.01 Pi</p>
          <button onClick={handlePiPayment}>Purchase</button>
        </div>
      )}

      <p><strong>Balance:</strong> {piBalance.toFixed(2)} Pi</p>
      <p><strong>Pi / second:</strong> {totalIncome.toFixed(2)}</p>
      <p><strong>Pi / click:</strong> {(clickPower + rebirthCount * 0.1).toFixed(2)}</p>

      <button onClick={handleClick} className="coin-button">
        <img src="/pi-coin.png" alt="Pi coin" className="coin-image" />
      </button>

      <div className="shop">
        <h2>Click Upgrade</h2>
        <button
          onClick={handleClickUpgrade}
          className={piBalance >= Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1)) ? 'can-afford' : ''}
        >
          Upgrade click (+0.1 Pi) – {Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1))} Pi
        </button>

        <h2>Upgrades</h2>
        {upgradesData.map(u => {
          const count = upgrades[u.id] || 0;
          const cost = Math.floor(u.baseCost * Math.pow(1.2, count));
          return (
            <div key={u.id}>
              <p><strong>{u.name}</strong> (owned: {count}) – Generates +{u.income}/s</p>
              <button
                onClick={() => handleBuy(u.id, u.baseCost)}
                className={piBalance >= cost ? 'can-afford' : ''}
              >
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
