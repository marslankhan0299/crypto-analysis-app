// pages/api/analysis.js
import axios from 'axios';

export default async function handler(req, res) {
  const { coin = 'bitcoin' } = req.query;

  try {
    // CoinGecko se 200 din ka daily price data fetch karo
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: '200',
          interval: 'daily',
        },
      }
    );

    const prices = response.data.prices.map((p) => p[1]); // closing prices array

    if (prices.length < 200) {
      return res.status(400).json({ error: 'Not enough data for analysis (need at least 200 days)' });
    }

    // EMA calculate
    const ema50 = calculateEMA(prices, 50);
    const ema200 = calculateEMA(prices, 200);

    // RSI calculate
    const rsi = calculateRSI(prices, 14);

    const latestRSI = rsi[rsi.length - 1];
    const latestEMA50 = ema50[ema50.length - 1];
    const latestEMA200 = ema200[ema200.length - 1];

    // Trend
    const trend = latestEMA50 > latestEMA200 ? 'UP' : 'DOWN';

    // Signal
    let signal = 'HOLD';
    if (latestRSI < 30) signal = 'BUY';
    else if (latestRSI > 70) signal = 'SELL';

    // Confidence
    let confidence = 0;
    if (signal === 'BUY') {
      confidence = Math.min(100, Math.round(((30 - latestRSI) / 30) * 100));
    } else if (signal === 'SELL') {
      confidence = Math.min(100, Math.round(((latestRSI - 70) / 30) * 100));
    } else {
      confidence = Math.round(100 - Math.abs(50 - latestRSI) / 0.5);
      confidence = Math.min(100, Math.max(0, confidence));
    }

    // Explanation text
    const explanation = generateExplanation(trend, latestRSI, signal);

    res.status(200).json({
      signal,
      trend,
      confidence,
      explanation,
      rsi: latestRSI,
      ema50: latestEMA50,
      ema200: latestEMA200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from CoinGecko' });
  }
}

// Exponential Moving Average function
function calculateEMA(prices, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);
  let sma = 0;
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma += prices[i];
      ema.push(null);
    } else if (i === period - 1) {
      sma += prices[i];
      ema.push(sma / period);
    } else {
      const prevEma = ema[i - 1];
      const emaValue = (prices[i] - prevEma) * multiplier + prevEma;
      ema.push(emaValue);
    }
  }
  return ema;
}

// RSI function
function calculateRSI(prices, period = 14) {
  const gains = [];
  const losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  const rsi = [];
  let avgGain = 0, avgLoss = 0;

  for (let i = 0; i < gains.length; i++) {
    if (i < period) {
      avgGain += gains[i];
      avgLoss += losses[i];
      if (i === period - 1) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      } else {
        rsi.push(null);
      }
    } else {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

// Explanation generator
function generateExplanation(trend, rsi, signal) {
  let explanation = '';
  if (trend === 'UP') {
    explanation += 'Market is in an uptrend (EMA50 > EMA200). ';
  } else {
    explanation += 'Market is in a downtrend (EMA50 < EMA200). ';
  }

  if (signal === 'BUY') {
    explanation += `RSI is ${rsi.toFixed(1)} (<30), indicating oversold conditions. This suggests a potential buying opportunity.`;
  } else if (signal === 'SELL') {
    explanation += `RSI is ${rsi.toFixed(1)} (>70), indicating overbought conditions. A pullback or reversal may be imminent.`;
  } else {
    explanation += `RSI is ${rsi.toFixed(1)} (neutral zone). No strong signal at the moment. Wait for clearer conditions.`;
  }
  return explanation;
  }
