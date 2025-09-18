const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let collection;

async function connectDB() {
  await client.connect();
  const db = client.db(process.env.MONGO_DB);
  collection = db.collection(process.env.MONGO_COLLECTION);
}
connectDB();

app.get('/api/prices', async (req, res) => {
  try {
    const data = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
