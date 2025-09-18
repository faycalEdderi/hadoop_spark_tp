import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ScatterChart, Scatter } from 'recharts';
import './App.css';

function App() {
  const [symbolsData, setSymbolsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/prices')
      .then(res => {
        const data = res.data;

        const validSymbols = data.filter(d => d.symbol && d.avg_price !== undefined && d.min_price !== undefined && d.max_price !== undefined);
        const validCategories = data.filter(d => d.category && d.avg_price !== undefined);

        setSymbolsData(validSymbols);
        setCategoryData(validCategories);
      })
      .catch(err => console.error(err));
  }, []);

  const memeCoins = symbolsData.filter(s => !['BTCUSDT', 'ETHUSDT'].includes(s.symbol));

  return (
    <div className="App">
      <h1>
        <img src="/bitcoin-btc-logo.png" alt="Bitcoin" style={{ width: 50, verticalAlign: 'middle', marginRight: 10 }} />
        Meme Crypto Dashboard
        <img src="/ethereum-eth-logo.png" alt="Ethereum" style={{ width: 50, verticalAlign: 'middle', marginLeft: 10 }} />
      </h1>

      <h2>Cryptos</h2>
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
          {symbolsData
            .filter(item => ["BTCUSDT", "ETHUSDT"].includes(item.symbol))
            .map((item, idx) => (
              <tr key={`stable-${idx}`}>
                <td>{item.symbol}</td>
                <td>{item.avg_price}</td>
                <td>{item.min_price}</td>
                <td>{item.max_price}</td>
              </tr>
            ))}
          {symbolsData
            .filter(item => !["BTCUSDT", "ETHUSDT"].includes(item.symbol))
            .map((item, idx) => (
              <tr key={`meme-${idx}`}>
                <td>{item.symbol}</td>
                <td>{item.avg_price}</td>
                <td>{item.min_price}</td>
                <td>{item.max_price}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <h2><img src="/bitcoin-btc-logo.png" alt="Bitcoin" style={{ width: 50, verticalAlign: 'middle', marginRight: 10 }} />
      Stats par catégorie&nbsp;
      <img src="/pepe-pepe-logo.png" alt="Pepe" style={{ width: 50, verticalAlign: 'middle', marginRight: 10 }} /></h2>
      <BarChart width={800} height={400} data={categoryData}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg_price" fill="#ff7300" />
      </BarChart>

      <h2><img src="/shiba-inu-shib-logo.png" alt="Shiba Inu" style={{ width: 50, verticalAlign: 'middle', marginRight: 10 }} />
      Volatilité des Meme Coins&nbsp;
      <img src="/bonk1-bonk-logo.png" alt="Bonk" style={{ width: 50, verticalAlign: 'middle', marginRight: 10 }} /></h2>
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
