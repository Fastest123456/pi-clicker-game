
// Pi Clicker Game – Täielik versioon
import { useState, useEffect, useRef } from 'react';
import './App.css';

// Upgrades
const upgradesData = [
  { id: 'pioneer', name: 'Pioneer', baseCost: 20, income: 0.05 },
  { id: 'miner', name: 'Miner', baseCost: 50, income: 0.2 },
  { id: 'node', name: 'Node', baseCost: 200, income: 1 },
  { id: 'validator', name: 'Validator', baseCost: 500, income: 3 },
  { id: 'botnet', name: 'AI Botnet', baseCost: 1500, income: 10 },
  { id: 'solar', name: 'Solar Farm', baseCost: 5000, income: 25 },
];

// Achievements
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

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [autoClickerActive, setAutoClickerActive] = useState(false);
  const [activeBoost, setActiveBoost] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRebirthShop, setShowRebirthShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTimePlayed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoClickerActive) {
      const intv = setInterval(() => handleClick(), 1000);
      setTimeout(() => setAutoClickerActive(false), 600000);
      return () => clearInterval(intv);
    }
  }, [autoClickerActive]);

  const incomeMultiplier = (1 + rebirthCount * 0.1) * (rebirthCount >= 1 ? 10 : 1) * (activeBoost ? 2 : 1) * (1 + permBoost);
  const totalIncome = upgradesData.reduce((acc, u) => acc + (upgrades[u.id] || 0) * u.income, 0) * incomeMultiplier;

  useEffect(() => {
    const interval = setInterval(() => {
      const step = totalIncome / 20;
      setPiBalance(p => parseFloat((p + step).toFixed(4)));
      setTotalEarned(e => parseFloat((e + step).toFixed(4)));
    }, 50);
    return () => clearInterval(interval);
  }, [totalIncome]);

  const handleRealPiPurchase = async () => {
  if (!window.Pi) {
    alert("Pi Network SDK not found.");
    return;
  }

  const paymentData = {
    amount: 1, // 1 Pi
    memo: "Buy 100 game Pi",
    metadata: { type: "buy_game_pi", gamePiAmount: 100 },
  };

  try {
    const scopes = ['payments'];
    const accessToken = await window.Pi.authenticate(scopes, () => {});
    
    const payment = await window.Pi.createPayment(paymentData, {
      onReadyForServerApproval: (paymentId) => {
        console.log("Payment ready for server approval:", paymentId);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        console.log("Payment completed:", paymentId, txid);
        alert("Payment successful!");
        setPiBalance(p => p + 100); // Lisa 100 mängu Pi
      },
      onCancel: (paymentId) => {
        console.log("Payment cancelled:", paymentId);
        alert("Payment cancelled.");
      },
      onError: (error, payment) => {
        console.error("Payment error:", error);
        alert("Payment failed.");
      },
    });
  } catch (err) {
    console.error("Authentication or payment error:", err);
    alert("Pi authentication failed.");
  }
};


  const addFloatingText = (text) => {
    const id = Date.now();
    setFloatingTexts(f => [...f, { id, text }]);
    setTimeout(() => setFloatingTexts(f => f.filter(t => t.id !== id)), 1000);
  };

  const handleClick = () => {
    const bonus = clickPower + rebirthCount * 0.1;
    setPiBalance(p => parseFloat((p + bonus).toFixed(4)));
    setTotalEarned(e => parseFloat((e + bonus).toFixed(4)));
    addFloatingText(`+${bonus.toFixed(1)} Pi`);
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

  const completedAchievements = achievementsList.filter(a => a.condition({ totalEarned, upgrades }));



  return (
    <div className="app">
      <h1>Pi Clicker</h1>

      <div className="top-buttons">
        <button onClick={() => setShowShop(s => !s)}>Pi Shop</button>
        <button onClick={() => setShowAchievements(a => !a)}>Achievements</button>
        <button onClick={() => setShowRebirthShop(r => !r)}>Rebirth Shop</button>
        <button onClick={() => setShowSettings(s => !s)}>Settings</button>
      </div>

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

      {showSettings && (
  <div className="panel settings">
    <h2>Settings</h2>
    <label>
      <input
        type="checkbox"
        checked={vibrationEnabled}
        onChange={() => setVibrationEnabled(v => !v)}
      />
      Vibration {vibrationEnabled ? "ON" : "OFF"}
    </label>
    <label>
      <input
        type="checkbox"
        checked={soundEnabled}
        onChange={() => setSoundEnabled(s => !s)}
      />
      Sound {soundEnabled ? "ON" : "OFF"}
    </label>
    <button
      onClick={() => {
        if (window.confirm("Are you sure you want to reset the game? This will erase all progress.")) {
          localStorage.clear();
          window.location.reload();
        }
      }}
      style={{ marginTop: "1rem", backgroundColor: "#e74c3c", color: "#fff" }}
    >
      Reset Game
    </button>
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

  {/* 👇 Ainult siis, kui on avatud Pi Shop */}
  {showShop && (
  <div className="top-buttons">
    <button onClick={handleRealPiPurchase}>
      Buy 100 game Pi (1 real Pi)
    </button>
  </div>
)}

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
        <button onClick={handleRebirth} className="rebirth-btn">Migrate to Mainnet (10,000 Pi)</button>
      </div>
    </div>
  );
}

export default App;

