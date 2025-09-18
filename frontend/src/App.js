import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ScatterChart, Scatter } from 'recharts';
import './App.css';

function App() {
  const [pricesData, setPricesData] = useState([]);
  const [symbolsData, setSymbolsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/prices')
      .then(res => {
        const data = res.data.map(d => ({
          ...d,
          price: parseFloat(d.price)
        }));
        setPricesData(data);

        // calcul des stats par symbol
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

        // calcul stats par catégorie
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

  const stableCoins = symbolsData.filter(s => ['BTCUSDT','ETHUSDT'].includes(s.symbol));
  const memeCoins = symbolsData.filter(s => !['BTCUSDT','ETHUSDT'].includes(s.symbol));

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
      <BarChart width={800} height={400} data={categoryData}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg_price" fill="#ff7300" />
      </BarChart>

      <h2>
        <img src="/shiba-inu-shib-logo.png" alt="Shiba Inu" style={{ width:25, verticalAlign:'middle', marginRight:5 }} />
        Volatilité des Meme Coins
        <img src="/bonk1-bonk-logo.png" alt="Bonk" style={{ width:25, verticalAlign:'middle', marginLeft:5 }} />
      </h2>
      <ScatterChart width={800} height={400}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis type="category" dataKey="symbol" name="Symbol" />
        <YAxis type="number" dataKey="avg_price" name="Avg Price" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Price Range" data={memeCoins} fill="#ff0000" shape="circle" />
      </ScatterChart>
    </div>
  );
}

export default App;
