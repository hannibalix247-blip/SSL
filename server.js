import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_SCHEDULES } from './src/services/sampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'schedules.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const loadSchedules = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading schedules file:', err);
  }
  // Initialize with initial sample schedules
  fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SCHEDULES, null, 2), 'utf8');
  return INITIAL_SCHEDULES;
};

const saveSchedules = (schedules) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving schedules file:', err);
  }
};

let schedules = loadSchedules();

// Broadcast update to all connected WebSocket clients
const broadcast = (data) => {
  const message = JSON.stringify({ type: 'SCHEDULES_UPDATE', data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  // Send current schedules immediately on connect
  ws.send(JSON.stringify({ type: 'SCHEDULES_UPDATE', data: schedules }));
});

// REST API Endpoints
app.get('/api/schedules', (req, res) => {
  res.json(schedules);
});

app.post('/api/schedules', (req, res) => {
  const item = req.body;
  if (!item || !item.sport) {
    return res.status(400).json({ error: 'Invalid schedule data' });
  }

  const now = new Date().toISOString();
  const scheduleToSave = {
    ...item,
    id: item.id || `sodam-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    teachers: item.teachers || [],
    playersCount: Number(item.playersCount) || 6,
    updatedAt: now,
    createdAt: item.createdAt || now,
  };

  const existingIndex = schedules.findIndex((s) => s.id === scheduleToSave.id);
  if (existingIndex >= 0) {
    schedules[existingIndex] = scheduleToSave;
  } else {
    schedules = [scheduleToSave, ...schedules];
  }

  saveSchedules(schedules);
  broadcast(schedules);
  res.json(scheduleToSave);
});

app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  schedules = schedules.filter((s) => s.id !== id);
  saveSchedules(schedules);
  broadcast(schedules);
  res.json({ success: true, id });
});

app.post('/api/schedules/reset', (req, res) => {
  schedules = [...INITIAL_SCHEDULES];
  saveSchedules(schedules);
  broadcast(schedules);
  res.json(schedules);
});

app.post('/api/schedules/import', (req, res) => {
  const importedList = req.body;
  if (Array.isArray(importedList)) {
    schedules = importedList;
    saveSchedules(schedules);
    broadcast(schedules);
    res.json({ success: true, count: schedules.length });
  } else {
    res.status(400).json({ error: 'Invalid imported data' });
  }
});

// Serve frontend production build (if exists)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 소담초 스포츠클럽 실시간 서버 실행 중: http://0.0.0.0:${PORT}`);
});
