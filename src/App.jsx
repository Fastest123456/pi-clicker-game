// [Pi Clicker Game – With Settings Panel]
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

const achievementsList = [
  { id: 'click1', label: 'First Click', condition: (stats) => stats.totalEarned >= 0.1 },
  { id: 'pi100', label: 'Earn 100 Pi', condition: (stats) => stats.totalEarned >= 100 },
  { id: 'miner10', label: 'Own 10 Miners', condition: (stats) => (stats.upgrades['miner'] || 0) >= 10 },
  { id: 'pi5000', label: 'Earn 5000 Pi', condition: (stats) => stats.totalEarned >= 5000 },
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
  const [rebirthCost, setRebirthCost] = useState(() => parseInt(localStorage.getItem('rebirthCost')) || 10000);

  const [vibration, setVibration] = useState(() => JSON.parse(localStorage.getItem('vibration')) ?? true);
  const [sound, setSound] = useState(() => JSON.parse(localStorage.getItem('sound')) ?? true);

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [autoClickerActive, setAutoClickerActive] = useState(false);
  const [activeBoost, setActiveBoost] = useState(null);

  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRebirthShop, setShowRebirthShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    localStorage.setItem('rebirthCost', rebirthCost);
    localStorage.setItem('vibration', vibration);
    localStorage.setItem('sound', sound);
  }, [piBalance, upgrades, clickPower, totalEarned, totalSpent, timePlayed, rebirthCount, rebirthPoints, permBoost, rebirthCost, vibration, sound]);

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

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset your game? This will delete all your progress.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClick = () => {
    if (vibration && window.navigator.vibrate) window.navigator.vibrate(30);
    const bonus = clickPower + rebirthCount * 0.1;
    setPiBalance(p => parseFloat((p + bonus).toFixed(4)));
    setTotalEarned(e => parseFloat((e + bonus).toFixed(4)));
    addFloatingText(`+${bonus.toFixed(1)} Pi`);
  };

  const addFloatingText = (text) => {
    const id = Date.now();
    setFloatingTexts(f => [...f, { id, text }]);
    setTimeout(() => setFloatingTexts(f => f.filter(t => t.id !== id)), 1000);
  };

  const handleClickUpgrade = () => {
    const cost = Math.floor(50 * Math.pow(1.5, (clickPower * 10) - 1));
    if (piBalance >= cost) {
      setPiBalance(p => parseFloat((p - cost).toFixed(4)));
      setClickPower(cp => parseFloat((cp + 0.1).toFixed(2)));
      setTotalSpent(s => parseFloat((s + cost).toFixed(4)));
    }
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

  const handleRebirth = () => {
    if (piBalance >= rebirthCost) {
      if (window.confirm(`Migrate to Mainnet for ${rebirthCost} Pi?
This resets progress but grants permanent bonuses.`)) {
        setPiBalance(0);
        setClickPower(0.1);
        setUpgrades({});
        setTotalEarned(0);
        setTotalSpent(0);
        setTimePlayed(0);
        setActiveBoost(null);
        setAutoClickerActive(false);
        setRebirthCount(r => r + 1);
        setRebirthPoints(p => p + 10);
        setPermBoost(b => parseFloat((b + 0.1).toFixed(2)));
        setRebirthCost(c => c + 15000);
      }
    } else {
      alert(`You need ${rebirthCost} Pi to migrate.`);
    }
  };

  const completedAchievements = achievementsList.filter(a => a.condition({ totalEarned, upgrades }));

  return (
    <div className="app">
      <h1>Pi Clicker</h1>
      <div className="top-buttons">
        <button onClick={() => setShowShop(s => !s)}>Pi Shop</button>
        <button onClick={() => setShowAchievements(a => !a)}>Achievements</button>
        <button onClick={() => setShowRebirthShop(r => !r)}>Rebirth Shop</button>
        <button onClick={() => setShowSettings(p => !p)}>Settings</button>
      </div>

      {showSettings && (
        <div className="panel">
          <h2>Settings</h2>
          <label>
            <input type="checkbox" checked={vibration} onChange={() => setVibration(v => !v)} />
            Vibration
          </label><br/>
          <label>
            <input type="checkbox" checked={sound} onChange={() => setSound(s => !s)} />
            Sound
          </label><br/>
          <button onClick={handleResetGame} className="danger">RESET Game</button>
        </div>
      )}

      {showAchievements && (
        <div className="panel achievements">
          <h2>Achievements</h2>
          <ul>
            {achievementsList.map(a => (
              <li key={a.id} style={{ color: completedAchievements.includes(a) ? 'green' : 'gray' }}>{a.label}</li>
            ))}
          </ul>
        </div>
      )}

      {showRebirthShop && (
        <div className="panel">
          <h2>Rebirth Bonus Shop</h2>
          <p>Coming soon: spend rebirth points for powerful bonuses.</p>
        </div>
      )}

      <p><strong>Balance:</strong> {piBalance.toFixed(2)} Pi</p>
      <p><strong>Pi / second:</strong> {totalIncome.toFixed(2)}</p>
      <p><strong>Pi / click:</strong> {(clickPower + rebirthCount * 0.1).toFixed(2)}</p>
      <p><strong>Rebirths:</strong> {rebirthCount} | Points: {rebirthPoints}</p>
      <p><strong>Permanent Boost:</strong> +{(permBoost * 100).toFixed(0)}%</p>

      <button onClick={handleClick} className="coin-button">
        <img src="/pi-coin.png" alt="Pi coin" className="coin-image" />
      </button>
      {floatingTexts.map(t => (<div key={t.id} className="float-text">{t.text}</div>))}

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

      <div className="stats">
        <h2>Statistics</h2>
        <p>Total earned: {totalEarned.toFixed(2)} Pi</p>
        <p>Total spent: {totalSpent.toFixed(2)} Pi</p>
        <p>Time played: {Math.floor(timePlayed / 60)}m {timePlayed % 60}s</p>
        <button onClick={handleRebirth} className="rebirth-btn">Migrate to Mainnet ({rebirthCost.toLocaleString()} Pi)</button>
      </div>
    </div>
  );
}

export default App;
