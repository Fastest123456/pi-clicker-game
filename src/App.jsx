import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [piBalance, setPiBalance] = useState(() => {
    const saved = localStorage.getItem('piBalance');
    return saved ? parseFloat(saved) : 0;
  });

  const [pioneers, setPioneers] = useState(() => {
    const saved = localStorage.getItem('pioneers');
    return saved ? parseInt(saved) : 0;
  });

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
    localStorage.setItem('pioneers', pioneers);
  }, [piBalance, pioneers]);

  // Passive income from pioneers
  useEffect(() => {
    const interval = setInterval(() => {
      setPiBalance(prev => parseFloat((prev + pioneers * 0.05).toFixed(2)));
    }, 1000);
    return () => clearInterval(interval);
  }, [pioneers]);

  const handleClick = () => {
    setPiBalance(prev => parseFloat((prev + 0.1).toFixed(2)));
  };

  const handleBuyPioneer = () => {
    if (piBalance >= 20) {
      setPiBalance(prev => parseFloat((prev - 20).toFixed(2)));
      setPioneers(prev => prev + 1);
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
        <p><strong>Pioneers:</strong> {pioneers}</p>
        <button onClick={handleBuyPioneer}>
          Buy Pioneer (20 Pi)
        </button>
      </div>
    </div>
  );
}

export default App;
