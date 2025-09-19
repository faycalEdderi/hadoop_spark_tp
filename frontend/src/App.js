import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ScatterChart, Scatter,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './App.css';

function App() {
  const [pricesData, setPricesData] = useState([]);
  const [symbolsData, setSymbolsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [volatilityData, setVolatilityData] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [pricesFromHdfs, setPricesFromHdfs] = useState([]);


  useEffect(() => {
    axios.get('http://localhost:5000/api/prices_from_hdfs')
  .then(res => {
    const data = res.data.map(d => ({
      ...d,
      price: parseFloat(d.price),
      timestamp: new Date(d.timestamp).toLocaleString()
    }));
    setPricesFromHdfs(data);
  })
  .catch(console.error);
    axios.get('http://localhost:5000/api/prices')
      .then(res => {
        const data = res.data.map(d => ({
          ...d,
          price: parseFloat(d.price)
        }));
        setPricesData(data);

        const symbolMap = {};
        data.forEach(d => {
          if (!symbolMap[d.symbol]) {
            symbolMap[d.symbol] = { symbol: d.symbol, prices: [], category: d.category };
          }
          symbolMap[d.symbol].prices.push(d.price);
        });

        const symbolsStats = Object.values(symbolMap).map(s => ({
          symbol: s.symbol,
          category: s.category,
          avg_price: s.prices.reduce((a,b) => a+b,0)/s.prices.length,
          min_price: Math.min(...s.prices),
          max_price: Math.max(...s.prices)
        }));

        setSymbolsData(symbolsStats);

        const categoryMap = {};
        symbolsStats.forEach(s => {
          if (!categoryMap[s.category]) categoryMap[s.category] = { prices: [] };
          categoryMap[s.category].prices.push(s.avg_price);
        });

        const categoriesStats = Object.entries(categoryMap).map(([cat, v]) => ({
          category: cat,
          avg_price: v.prices.reduce((a,b) => a+b,0)/v.prices.length
        }));

        setCategoryData(categoriesStats);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/ranking')
      .then(res => setRankingData(res.data))
      .catch(console.error);

    axios.get('http://localhost:5000/api/volatility')
      .then(res => setVolatilityData(res.data))
      .catch(console.error);

    axios.get('http://localhost:5000/api/category_summary')
      .then(res => setCategorySummary(res.data))
      .catch(console.error);

    axios.get('http://localhost:5000/api/summary')
      .then(res => setSummaryData(res.data))
      .catch(console.error);
  }, []);

  const enrichedRankingData = rankingData.map(rank => {
    const summary = summaryData.find(s => s.symbol === rank.symbol);
    return {
      ...rank,
      avg_price: summary ? summary.avg_price : 0
    };
  });

  const stableCoins = symbolsData.filter(s => ['BTCUSDT','ETHUSDT'].includes(s.symbol));
  const memeCoins = symbolsData.filter(s => !['BTCUSDT','ETHUSDT'].includes(s.symbol));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

  return (
    <div className="App">
      <h1>
        <img src="/bitcoin-btc-logo.png" alt="Bitcoin" style={{ width:50, verticalAlign:'middle', marginRight:10 }} />
        Meme Crypto Dashboard
        <img src="/ethereum-eth-logo.png" alt="Ethereum" style={{ width:50, verticalAlign:'middle', marginLeft:10 }} />
      </h1>

      <h2>
        <img src="/bitcoin-btc-logo.png" alt="Bitcoin" style={{ width:25, verticalAlign:'middle', marginRight:5 }} />
        Cryptos
        <img src="/ethereum-eth-logo.png" alt="Ethereum" style={{ width:25, verticalAlign:'middle', marginLeft:5 }} />
      </h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Avg Price (USD)</th>
            <th>Min Price (USD)</th>
            <th>Max Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {stableCoins.map((item, idx) => (
            <tr key={`stable-${idx}`}>
              <td>{item.symbol}</td>
              <td>{item.avg_price.toFixed(5)}</td>
              <td>{item.min_price.toFixed(5)}</td>
              <td>{item.max_price.toFixed(5)}</td>
            </tr>
          ))}
          {memeCoins.map((item, idx) => (
            <tr key={`meme-${idx}`}>
              <td>{item.symbol}</td>
              <td>{item.avg_price.toFixed(5)}</td>
              <td>{item.min_price.toFixed(5)}</td>
              <td>{item.max_price.toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>
        <img src="/bitcoin-btc-logo.png" alt="Bitcoin" style={{ width:25, verticalAlign:'middle', marginRight:5 }} />
        Stats par catégorie
        <img src="/ethereum-eth-logo.png" alt="Ethereum" style={{ width:25, verticalAlign:'middle', marginLeft:5 }} />
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categoryData}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avg_price" fill="#ff7300" name="Prix Moyen" />
        </BarChart>
      </ResponsiveContainer>

      <h2>
        📊 Classement par Amplitude de Prix (Max - Min)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={rankingData}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toFixed(6)} $`} />
          <Legend />
          <Bar dataKey="price_range" fill="#8884d8" name="Amplitude ($)" />
        </BarChart>
      </ResponsiveContainer>

      <h2>
        📈 Volatilité par Catégorie (Écart-type des variations)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={volatilityData}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toFixed(8)}`} />
          <Legend />
          <Bar dataKey="volatility" fill="#FF6B6B" name="Volatilité" />
        </BarChart>
      </ResponsiveContainer>

      {categorySummary.length > 0 && (
        <>
          <h2>
            🆚 Comparaison Détailée : Solid vs Meme Coins
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            {categorySummary.map((cat, idx) => (
              <div key={idx} style={{ width: '45%', margin: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ color: cat.category === 'solid' ? '#28a745' : '#dc3545' }}>
                  {cat.category.toUpperCase()}
                </h3>
                <p><strong>Prix Moyen :</strong> ${cat.avg_price.toFixed(5)}</p>
                <p><strong>Prix Min :</strong> ${cat.min_price.toFixed(5)}</p>
                <p><strong>Prix Max :</strong> ${cat.max_price.toFixed(5)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {enrichedRankingData.length > 0 && (
        <>
          <h2>
            🎯 Analyse Avancée Meme Coins — Prix Moyen vs Amplitude
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="price_range" name="Amplitude de Prix" unit="$" />
              <YAxis type="number" dataKey="avg_price" name="Prix Moyen" unit="$" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [value.toFixed(6), name]} />
              <Legend />
              <Scatter
                name="Meme Coins"
                data={enrichedRankingData.filter(d => !['BTCUSDT','ETHUSDT'].includes(d.symbol))}
                fill="#FF6B6B"
                shape="circle"
              />
              <Scatter
                name="Stable Coins"
                data={enrichedRankingData.filter(d => ['BTCUSDT','ETHUSDT'].includes(d.symbol))}
                fill="#28a745"
                shape="diamond"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </>
      )}

      <h2>
        <img src="/shiba-inu-shib-logo.png" alt="Shiba Inu" style={{ width:25, verticalAlign:'middle', marginRight:5 }} />
        Volatilité des Meme Coins (Version simple)
        <img src="/bonk1-bonk-logo.png" alt="Bonk" style={{ width:25, verticalAlign:'middle', marginLeft:5 }} />
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis type="category" dataKey="symbol" name="Symbol" />
          <YAxis type="number" dataKey="avg_price" name="Avg Price" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Price Range" data={memeCoins} fill="#ff0000" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>

      {pricesFromHdfs.length > 0 && (
        <>
          <h2 style={{ marginTop: '50px', color: '#28a745' }}>
            💾 Données chargées depuis HDFS via Spark
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Symbol</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price (USD)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {pricesFromHdfs.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.symbol}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>${item.price.toFixed(5)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
    
  );
}

export default App;