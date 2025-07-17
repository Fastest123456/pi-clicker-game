
// Täielik Pi Clicker mäng koos kõikide funktsioonidega
import { useState, useEffect } from 'react';
import './App.css';

const Pi = window?.Pi;

const upgradesData = [
  { id: 'pioneer', name: 'Pioneer', baseCost: 20, income: 0.05 },
  { id: 'miner', name: 'Miner', baseCost: 50, income: 0.2 },
  { id: 'node', name: 'Node', baseCost: 200, income: 1 },
  { id: 'validator', name: 'Validator', baseCost: 500, income: 3 },
  { id: 'botnet', name: 'AI Botnet', baseCost: 1500, income: 10 },
  { id: 'solar', name: 'Solar Farm', baseCost: 5000, income: 25 },
];

const achievementsList = [
  { id: 'click1', label: 'First Click', condition: (s) => s.totalEarned >= 0.1 },
  { id: 'pi100', label: 'Earn 100 Pi', condition: (s) => s.totalEarned >= 100 },
  { id: 'miner10', label: 'Own 10 Miners', condition: (s) => (s.upgrades['miner'] || 0) >= 10 },
  { id: 'pi5000', label: 'Earn 5000 Pi', condition: (s) => s.totalEarned >= 5000 },
];

function App() {
  const [piBalance, setPiBalance] = useState(() => parseFloat(localStorage.getItem('piBalance')) || 0);
  const [upgrades, setUpgrades] = useState(() => JSON.parse(localStorage.getItem('upgrades')) || {});
  const [clickPower, setClickPower] = useState(() => parseFloat(localStorage.getItem('clickPower')) || 0.1);
  const [totalEarned, setTotalEarned] = useState(() => parseFloat(localStorage.getItem('totalEarned')) || 0);
  const [totalSpent, setTotalSpent] = useState(() => parseFloat(localStorage.getItem('totalSpent')) || 0);
  const [timePlayed, setTimePlayed] = useState(() => parseInt(localStorage.getItem('timePlayed')) || 0);
  const [rebirthCount, setRebirthCount] = useState(() => parseInt(localStorage.getItem('rebirthCount')) || 0);
  const [rebirthPoints, setRebirthPoints] = useState(() => parseInt(localStorage.getItem('rebirthPoints')) || 0);
  const [permBoost, setPermBoost] = useState(() => parseFloat(localStorage.getItem('permBoost')) || 0);

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [autoClickerActive, setAutoClickerActive] = useState(false);
  const [activeBoost, setActiveBoost] = useState(null);

  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRebirthShop, setShowRebirthShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
    localStorage.setItem('clickPower', clickPower);
    localStorage.setItem('totalEarned', totalEarned);
    localStorage.setItem('totalSpent', totalSpent);
    localStorage.setItem('timePlayed', timePlayed);
    localStorage.setItem('rebirthCount', rebirthCount);
    localStorage.setItem('rebirthPoints', rebirthPoints);
    localStorage.setItem('permBoost', permBoost);
  }, [piBalance, upgrades, clickPower, totalEarned, totalSpent, timePlayed, rebirthCount, rebirthPoints, permBoost]);

  useEffect(() => {
    const timer = setInterval(() => setTimePlayed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const incomeMultiplier = (1 + rebirthCount * 0.1) * (activeBoost ? 2 : 1) * (1 + permBoost);
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
    setFloatingTexts(f => [...f, { id: Date.now(), text: `+${bonus.toFixed(1)} Pi` }]);
    if (vibrationOn && navigator.vibrate) navigator.vibrate(50);
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

  const handleRebirth = () => {
    if (piBalance >= 10000) {
      if (window.confirm('Migrate to Mainnet? This resets your progress and grants bonuses.')) {
        setPiBalance(0);
        setClickPower(0.1);
        setUpgrades({});
        setTotalEarned(0);
        setTotalSpent(0);
        setTimePlayed(0);
        setRebirthCount(r => r + 1);
        setRebirthPoints(p => p + 10);
        setActiveBoost(null);
        setAutoClickerActive(false);
      }
    } else alert('You need 10,000 Pi to migrate.');
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game completely?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleRealPiPurchase = async () => {
    if (!Pi || !Pi.createPayment) return alert('Pi SDK not available in this browser.');

    try {
      const payment = await Pi.createPayment({
        amount: 0.01,
        memo: "Buy 100 game Pi",
        metadata: { type: 'game-purchase', value: 100 }
      });
      if (payment.identifier) {
        alert("Success! You got 100 game Pi.");
        setPiBalance(p => p + 100);
      }
    } catch (err) {
      alert("Payment failed or cancelled.");
    }
  };

  return (
    <div className="app">
      <h1>Pi Clicker</h1>

      <div className="top-buttons">
        <button onClick={() => setShowShop(s => !s)}>Pi Shop</button>
        <button onClick={() => setShowAchievements(a => !a)}>Achievements</button>
        <button onClick={() => setShowRebirthShop(r => !r)}>Rebirth Shop</button>
        <button onClick={() => setShowSettings(s => !s)}>Settings</button>
      </div>

      {showShop && (
        <div className="panel">
          <h2>Real Pi Purchases</h2>
          <button onClick={handleRealPiPurchase}>Buy 100 game Pi (0.01 Pi)</button>
        </div>
      )}

      {showAchievements && (
        <div className="panel">
          <h2>Achievements</h2>
          <ul>
            {achievementsList.map(a => (
              <li key={a.id} style={{ color: a.condition({ totalEarned, upgrades }) ? 'green' : 'gray' }}>{a.label}</li>
            ))}
          </ul>
        </div>
      )}

      {showRebirthShop && (
        <div className="panel">
          <h2>Rebirth Bonuses</h2>
          <p>Rebirths: {rebirthCount} | Points: {rebirthPoints}</p>
          <p>Each rebirth gives +10 points and +10% bonus income.</p>
        </div>
      )}

      {showSettings && (
        <div className="panel">
          <h2>Settings</h2>
          <label><input type="checkbox" checked={vibrationOn} onChange={() => setVibrationOn(v => !v)} /> Vibration</label>
          <label><input type="checkbox" checked={soundOn} onChange={() => setSoundOn(s => !s)} /> Sound</label>
          <button onClick={handleResetGame}>Reset Game</button>
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
        <button onClick={handleClickUpgrade}>
          Upgrade click (+0.1 Pi) – {Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1))} Pi
        </button>

        <h2>Upgrades</h2>
        {upgradesData.map(u => {
          const count = upgrades[u.id] || 0;
          const cost = Math.floor(u.baseCost * Math.pow(1.2, count));
          return (
            <div key={u.id}>
              <p><strong>{u.name}</strong> (owned: {count}) – +{u.income}/s</p>
              <button onClick={() => handleBuy(u.id, u.baseCost)}>Buy for {cost} Pi</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
