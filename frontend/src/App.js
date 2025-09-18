import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import './App.css';

function App() {
  const [symbolsData, setSymbolsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/prices')
      .then(res => {
        const data = res.data;

        const validSymbols = data.filter(d => d.symbol && d.avg_price !== undefined && d.min_price !== undefined && d.max_price !== undefined);
        const validCategories = data.filter(d => d.category && (d.avg_price !== undefined || d.volatility !== undefined));

        setSymbolsData(validSymbols);
        setCategoryData(validCategories);
      })
      .catch(err => console.error(err));
  }, []);

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
          {symbolsData.map((item, idx) => (
            <tr key={idx}>
              <td>{item.symbol}</td>
              <td>{item.avg_price}</td>
              <td>{item.min_price}</td>
              <td>{item.max_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Stats par catégorie</h2>
      <BarChart width={800} height={400} data={categoryData}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg_price" fill="#ff7300" />
        <Bar dataKey="volatility" fill="#00ff73" />
      </BarChart>
    </div>
  );
}

export default App;
