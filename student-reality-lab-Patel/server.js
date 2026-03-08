const express = require('express');
const path = require('path');
const app = express();
const basePath = '/IS219';

// serve static assets from the dist folder
app.use(basePath, express.static(path.join(__dirname, 'dist')));

// convenience redirect for local testing
app.get('/', (req, res) => {
  res.redirect(`${basePath}/`);
});

// fallback to index.html for client-side routing
app.get(`${basePath}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Production server running on http://localhost:${port}`);
});
