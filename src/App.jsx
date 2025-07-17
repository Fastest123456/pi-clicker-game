// App.jsx (lühendatud näide – tegelik versioon on põhjalikum)
// Lisame ainult olulise osa näitena

import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [floatingTexts, setFloatingTexts] = useState([]);

  const addFloatingText = (text) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  const handleClick = () => {
    const bonus = 0.1;
    // loogika...
    addFloatingText(`+${bonus.toFixed(2)} Pi`);
  };

  return (
    <div className="app">
      <button onClick={handleClick} className="coin-button">
        <img src="/pi-coin.png" alt="Pi coin" className="coin-image" />
      </button>

      {floatingTexts.map(t => (
        <div key={t.id} className="float-text">{t.text}</div>
      ))}
    </div>
  );
}

export default App;