const express = require('express');
const app = express();
const port = 3000;

const db = require('./app/db');
const path = require('path');

app.use(express.static('public'));
const apiRoutes = require('./app/routes/api');

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Servidor funcionando`)
})