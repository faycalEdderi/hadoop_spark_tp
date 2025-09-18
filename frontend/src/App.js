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

        // Filtrer symbols valides (avec avg_price, min_price, max_price)
        const validSymbols = data.filter(d => d.symbol && d.avg_price !== undefined && d.min_price !== undefined && d.max_price !== undefined);

        // Filtrer categories valides (avec avg_price et min/max ou volatility)
        const validCategories = data.filter(d => d.category && (d.avg_price !== undefined || d.volatility !== undefined));

        setSymbolsData(validSymbols);
        setCategoryData(validCategories);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <h1>Meme Crypto Dashboard 🚀💎</h1>

      <h2>Cryptos par symbol</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Avg Price</th>
            <th>Min Price</th>
            <th>Max Price</th>
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
