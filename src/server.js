const express = require('express');
const path = require('path');
const app = express();

require('./app/db');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiRoutes = require('./app/routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;