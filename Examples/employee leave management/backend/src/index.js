const express = require('express');
const cors = require('cors');
const leavesRouter = require('./routes/leaves');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/leaves', leavesRouter);

// basic error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack || err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Leave backend listening on port ${PORT}`));
