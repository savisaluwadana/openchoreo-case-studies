const express = require('express');
const invoices = require('./routes/invoices');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/invoices', invoices);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Invoice backend listening on ${PORT}`));
