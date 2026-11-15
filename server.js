// Grandora Realty backend: Express + JSON file storage
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const DATA = path.join(__dirname, 'data');
const read = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8') || '[]');
const write = (f, d) => fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2));
if (!fs.existsSync(path.join(DATA, 'enquiries.json'))) write('enquiries.json', []);

app.use(express.json({ limit: '50kb' }));
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Public: list properties (?type=Residential&q=chennai)
app.get('/api/properties', (req, res) => {
  const { type, q } = req.query;
  let list = read('properties.json');
  if (type && type !== 'All') list = list.filter(p => p.type === type);
  if (q) list = list.filter(p => (p.title + p.location).toLowerCase().includes(String(q).toLowerCase()));
  res.json(list);
});

// Public: submit an enquiry
app.post('/api/enquiries', (req, res) => {
  const { name, phone, email, interest, message } = req.body || {};
  if (!name || !phone || !/^[+\d][\d\s-]{6,15}$/.test(phone))
    return res.status(400).json({ error: 'Enter your name and a valid phone number.' });
  const list = read('enquiries.json');
  list.push({ id: Date.now(), name: String(name).slice(0, 80), phone, email: String(email || '').slice(0, 120),
    interest: String(interest || '').slice(0, 60), message: String(message || '').slice(0, 1000),
    createdAt: new Date().toISOString() });
  write('enquiries.json', list);
  res.status(201).json({ ok: true });
});

// Admin: view enquiries (header: x-admin-key)
app.get('/api/enquiries', (req, res) => {
  if (req.get('x-admin-key') !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  res.json(read('enquiries.json').reverse());
});

// Admin: add a property
app.post('/api/properties', (req, res) => {
  if (req.get('x-admin-key') !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const { title, type, location, price, details } = req.body || {};
  if (!title || !type || !location || !price) return res.status(400).json({ error: 'Missing fields' });
  const list = read('properties.json');
  const item = { id: Date.now(), title, type, location, price, details: details || '' };
  list.push(item); write('properties.json', list);
  res.status(201).json(item);
});

app.listen(PORT, () => console.log(`Grandora Realty running at http://localhost:${PORT}`));
