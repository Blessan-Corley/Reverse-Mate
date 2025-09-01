const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'chesspursuit';
const COLLECTION = process.env.COLLECTION || 'leaderboard';

let client;
let col;

async function init() {
    if (!MONGO_URI) {
        throw new Error('Missing MONGO_URI. Set it in your environment or .env file.');
    }
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    col = db.collection(COLLECTION);
    await col.createIndex({ name: 1 }, { unique: true });
    await col.createIndex({ pauses: 1, ts: 1 });
}

app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
        const skip = Math.max(parseInt(req.query.skip || '0', 10), 0);
        const items = await col
            .find({}, { projection: { _id: 0 } })
            .sort({ pauses: 1, ts: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json({ items, skip, limit });
    } catch (e) {
        res.status(500).json({ error: 'failed' });
    }
});

app.post('/api/leaderboard', async (req, res) => {
    try {
        const name = (req.body && (req.body.name || '').trim()).slice(0, 40);
        const pauses = Math.max(
            0,
            Math.min(9999, parseInt((req.body && req.body.pauses) || 0, 10))
        );
        if (!name) return res.status(400).json({ error: 'name required' });
        const now = Date.now();
        const existing = await col.findOne({ name });
        if (!existing) {
            await col.insertOne({ name, pauses, ts: now });
        } else if (pauses < (existing.pauses || Infinity)) {
            await col.updateOne({ name }, { $set: { pauses, ts: now } });
        }
        const doc = await col.findOne({ name }, { projection: { _id: 0 } });
        res.json({ ok: true, record: doc });
    } catch (e) {
        res.status(500).json({ error: 'failed' });
    }
});

init()
    .then(() => {
        const port = process.env.PORT || 5000;
        app.listen(port, () => console.log('Leaderboard API on :' + port));
    })
    .catch((err) => {
        console.error('failed to init mongo', err);
        process.exit(1);
    });
