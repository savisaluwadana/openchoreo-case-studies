const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const quizzesRouter = require('./routes/quizzes');
const { handleJoin, handleSubmitAnswer, handleFinish, handleDisconnect } = require('./ws/handler');

const app = express();
const PORT = parseInt(process.env.PORT || '8080');

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── REST Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/quizzes', quizzesRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── HTTP Server ─────────────────────────────────────────────────────────────
const server = http.createServer(app);

// ── WebSocket Server ─────────────────────────────────────────────────────────
// Choreo WebSocket Service components expose the same port as the HTTP service.
// Clients upgrade the connection using the WS protocol on the same host/port.
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log(`[ws] New connection from ${req.socket.remoteAddress}`);
  let currentSessionId = null;

  ws.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
      return;
    }

    const { type } = msg;
    console.log(`[ws] ${type}`, msg);

    switch (type) {
      case 'JOIN':
        currentSessionId = msg.sessionId;
        await handleJoin(ws, msg);
        break;
      case 'SUBMIT_ANSWER':
        await handleSubmitAnswer(ws, msg);
        break;
      case 'FINISH':
        await handleFinish(ws, msg);
        break;
      default:
        ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown message type: ${type}` }));
    }
  });

  ws.on('close', () => {
    console.log('[ws] Connection closed');
    handleDisconnect(ws, currentSessionId);
  });

  ws.on('error', (err) => {
    console.error('[ws] Error:', err.message);
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Quiz Platform backend listening on port ${PORT}`);
  console.log(`  REST: http://localhost:${PORT}/api/v1/quizzes`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
});

module.exports = { app, server };
