import { useState, useEffect, useRef } from 'react';
import './App.css';

const upgradesData = [
  { id: 'pioneer', name: 'Pioneer', baseCost: 20, income: 0.05 },
  { id: 'miner', name: 'Miner', baseCost: 50, income: 0.2 },
  { id: 'node', name: 'Node', baseCost: 200, income: 1 },
  { id: 'validator', name: 'Validator', baseCost: 500, income: 3 },
  { id: 'botnet', name: 'AI Botnet', baseCost: 1500, income: 10 },
  { id: 'solar', name: 'Solar Farm', baseCost: 5000, income: 25 },
];

const piShopItems = [
  { id: 'boost10min', name: 'x2 Income (10 min)', cost: 1, type: 'tempBoost' },
  { id: 'instant500', name: 'Instant 500 Pi', cost: 2, type: 'instantPi', amount: 500 },
  { id: 'autoclick10', name: 'Auto Clicker (10 min)', cost: 1.5, type: 'autoClicker' },
  { id: 'clickBoost', name: '+0.5 Click Power', cost: 3, type: 'clickBoost' },
  { id: 'aiAssistant', name: 'AI Assistant (+5% forever)', cost: 5, type: 'permBoost' },
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
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [rebirthCount, setRebirthCount] = useState(() => parseInt(localStorage.getItem('rebirthCount')) || 0);
  const [rebirthPoints, setRebirthPoints] = useState(() => parseInt(localStorage.getItem('rebirthPoints')) || 0);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRebirthShop, setShowRebirthShop] = useState(false);
  const [activeBoost, setActiveBoost] = useState(null);
  const [permBoost, setPermBoost] = useState(() => parseFloat(localStorage.getItem('permBoost')) || 0);
  const [autoClickerActive, setAutoClickerActive] = useState(false);

  const addFloatingText = (text) => {
    const id = Date.now();
    const newText = { id, text };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

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
    const timer = setInterval(() => {
      setTimePlayed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoClickerActive) {
      const interval = setInterval(() => {
        handleClick();
      }, 1000);
      setTimeout(() => setAutoClickerActive(false), 600000);
      return () => clearInterval(interval);
    }
  }, [autoClickerActive]);

  const incomeMultiplier = (1 + rebirthCount * 0.1) * (rebirthCount >= 1 ? 10 : 1) * (activeBoost ? 2 : 1) * (1 + permBoost);
  const totalIncome = upgradesData.reduce((acc, upgrade) => {
    const count = upgrades[upgrade.id] || 0;
    return acc + count * upgrade.income;
  }, 0) * incomeMultiplier;

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
    const clickBonus = clickPower + rebirthCount * 0.1;
    setPiBalance(prev => {
      const updated = parseFloat((prev + clickBonus).toFixed(4));
      setTotalEarned(prevEarned => parseFloat((prevEarned + clickBonus).toFixed(4)));
      return updated;
    });
    addFloatingText(`+${clickBonus.toFixed(1)} Pi`);
  };

  const handleBuy = (id, baseCost) => {
    const count = upgrades[id] || 0;
    const cost = Math.floor(baseCost * Math.pow(1.2, count));
    if (piBalance >= cost) {
      setPiBalance(prev => parseFloat((prev - cost).toFixed(4)));
      setUpgrades(prev => ({ ...prev, [id]: count + 1 }));
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

  const handleRebirth = () => {
    if (piBalance >= 10000) {
      if (window.confirm("Migrate to Mainnet? This will reset your progress and grant bonuses.")) {
        setPiBalance(0);
        setClickPower(0.1);
        setUpgrades({});
        setTotalEarned(0);
        setTotalSpent(0);
        setTimePlayed(0);
        setRebirthCount(prev => prev + 1);
        setRebirthPoints(prev => prev + 10);
        setActiveBoost(null);
        setAutoClickerActive(false);
      }
    } else {
      alert("You need at least 10,000 Pi to Migrate to Mainnet.");
    }
  };

  const handleUseShopItem = (item) => {
    if (piBalance < item.cost) return alert("Not enough Pi!");

    setPiBalance(prev => parseFloat((prev - item.cost).toFixed(4)));
    setTotalSpent(prev => parseFloat((prev + item.cost).toFixed(4)));

    switch (item.type) {
      case 'tempBoost':
        setActiveBoost(true);
        setTimeout(() => setActiveBoost(false), 600000);
        break;
      case 'instantPi':
        setPiBalance(prev => prev + item.amount);
        break;
      case 'autoClicker':
        setAutoClickerActive(true);
        break;
      case 'clickBoost':
        setClickPower(prev => parseFloat((prev + 0.5).toFixed(2)));
        break;
      case 'permBoost':
        setPermBoost(prev => parseFloat((prev + 0.05).toFixed(3)));
        break;
      default:
        break;
    }
  };

  const completedAchievements = achievementsList.filter(a => a.condition({ totalEarned, upgrades }));

  return (
    <div className="app">
      <h1>Pi Clicker</h1>

      <button onClick={() => setShowShop(!showShop)}>{showShop ? 'Hide Shop' : 'Open Pi Shop'}</button>
      <button onClick={() => setShowAchievements(!showAchievements)}>{showAchievements ? 'Hide Achievements' : 'Show Achievements'}</button>
      <button onClick={() => setShowRebirthShop(!showRebirthShop)}>{showRebirthShop ? 'Hide Rebirth Shop' : 'Rebirth Bonus Shop'}</button>

      {showShop && (
        <div className="panel">
          <h2>Pi Shop</h2>
          {piShopItems.map(item => (
            <button key={item.id} onClick={() => handleUseShopItem(item)}>
              {item.name} – {item.cost} Pi
            </button>
          ))}
        </div>
      )}

      {showAchievements && (
        <div className="panel">
          <h2>Achievements</h2>
          <ul>
            {achievementsList.map(a => (
              <li key={a.id} style={{ color: completedAchievements.includes(a) ? 'green' : 'gray' }}>
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRebirthShop && (
        <div className="panel">
          <h2>Rebirth Bonus Shop</h2>
          <p>Coming soon: Spend rebirth points for permanent upgrades!</p>
        </div>
      )}

      <p><strong>Balance:</strong> {piBalance.toFixed(2)} Pi</p>
      <p><strong>Pi / second:</strong> {totalIncome.toFixed(2)}</p>
      <p><strong>Pi / click:</strong> {(clickPower + rebirthCount * 0.1).toFixed(2)}</p>
      <p><strong>Rebirths:</strong> {rebirthCount} | Points: {rebirthPoints}</p>

      <button onClick={handleClick} className="coin-button">
        <img src="/pi-coin.png" alt="Pi coin" className="coin-image" />
      </button>

      {floatingTexts.map(t => (
        <div key={t.id} className="float-text">{t.text}</div>
      ))}

      <div className="shop">
        <h2>Click Upgrade</h2>
        <button onClick={handleClickUpgrade}>Upgrade click (+0.1 Pi)</button>

        <h2>Upgrades</h2>
        {upgradesData.map(upg => {
          const count = upgrades[upg.id] || 0;
          const cost = Math.floor(upg.baseCost * Math.pow(1.2, count));
          return (
            <div key={upg.id}>
              <p><strong>{upg.name}</strong> (owned: {count})</p>
              <button onClick={() => handleBuy(upg.id, upg.baseCost)}>Buy for {cost} Pi</button>
            </div>
          );
        })}
      </div>

      <div className="stats">
        <h2>Statistics</h2>
        <p>Total earned: {totalEarned.toFixed(2)} Pi</p>
        <p>Total spent: {totalSpent.toFixed(2)} Pi</p>
        <p>Time played: {Math.floor(timePlayed / 60)}m {timePlayed % 60}s</p>
        <button onClick={handleRebirth}>Migrate to Mainnet (10,000 Pi)</button>
      </div>
    </div>
  );
}

export default App;
