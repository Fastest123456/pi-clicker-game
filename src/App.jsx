
import { useState, useEffect } from 'react';
import './App.css';

const Pi = window?.Pi;

function App() {
  const [piBalance, setPiBalance] = useState(() => parseFloat(localStorage.getItem('piBalance')) || 0);
  const [showPiShop, setShowPiShop] = useState(false);

  useEffect(() => {
    localStorage.setItem('piBalance', piBalance);
  }, [piBalance]);

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

      <p><strong>In-game Pi:</strong> {piBalance.toFixed(2)}</p>

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
    </div>
  );
}

export default App;
