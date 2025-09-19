const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectDB() {
  await client.connect();
  db = client.db(process.env.MONGO_DB);
  console.log("✅ Connected to MongoDB");
}
connectDB();

app.get('/api/prices', async (req, res) => {
  try {
    const collection = db.collection(process.env.MONGO_COLLECTION);
    const data = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/summary', async (req, res) => {
  try {
    const collection = db.collection('summary');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ranking', async (req, res) => {
  try {
    const collection = db.collection('ranking');
    const data = await collection.find({}).sort({ price_range: -1 }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/category_summary', async (req, res) => {
  try {
    const collection = db.collection('category_summary');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/volatility', async (req, res) => {
  try {
    const collection = db.collection('volatility');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});