// pages/index.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import TradingViewWidget from '../components/TradingViewWidget';
import AnalysisPanel from '../components/AnalysisPanel';

// Popular coins ke liye TradingView symbol mapping
const chartSymbols = {
  bitcoin: 'BITSTAMP:BTCUSD',
  ethereum: 'BITSTAMP:ETHUSD',
  solana: 'COINBASE:SOLUSD',
};

const popularCoins = [
  { name: 'Bitcoin', id: 'bitcoin' },
  { name: 'Ethereum', id: 'ethereum' },
  { name: 'Solana', id: 'solana' },
];

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [customCoin, setCustomCoin] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [chartSymbol, setChartSymbol] = useState(chartSymbols['bitcoin']);

  // API call function
  const fetchAnalysis = async (coinId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/analysis?coin=${coinId}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
      setAnalysis({
        signal: 'ERROR',
        trend: '—',
        confidence: 0,
        explanation: 'Failed to fetch analysis. Check coin ID or try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Jab selectedCoin change ho toh analysis fetch karo
  useEffect(() => {
    fetchAnalysis(selectedCoin);
  }, [selectedCoin]);

  // Popular coin dropdown change handler
  const handlePopularChange = (e) => {
    const newCoin = e.target.value;
    setSelectedCoin(newCoin);
    // Agar mapping hai toh chart symbol update karo
    if (chartSymbols[newCoin]) {
      setChartSymbol(chartSymbols[newCoin]);
    } else {
      setChartSymbol(chartSymbols['bitcoin']); // fallback
    }
  };

  // Custom coin submit handler
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customCoin.trim()) return;
    const coinId = customCoin.trim().toLowerCase();
    setSelectedCoin(coinId);
    // Chart symbol update nahi karte custom coin ke liye, previous chart rahega
    fetchAnalysis(coinId);
  };

  return (
    <div className="container">
      {/* Coin selector area */}
      <div className="coin-selector">
        <select value={selectedCoin} onChange={handlePopularChange}>
          {popularCoins.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>
        <form onSubmit={handleCustomSubmit}>
          <input
            type="text"
            placeholder="Custom Coin ID (e.g., cardano)"
            value={customCoin}
            onChange={(e) => setCustomCoin(e.target.value)}
          />
          <button type="submit">Analyze</button>
        </form>
      </div>

      {/* TradingView chart */}
      <div className="chart-container">
        <TradingViewWidget symbol={chartSymbol} />
      </div>

      {/* Toggle button for bottom panel */}
      <button className="toggle-panel-btn" onClick={() => setShowPanel(!showPanel)}>
        {showPanel ? 'Hide Analysis' : 'Show Analysis'}
      </button>

      {/* Analysis panel (visible only if analysis data exists) */}
      {analysis && (
        <AnalysisPanel data={analysis} visible={showPanel} />
      )}
    </div>
  );
      }
