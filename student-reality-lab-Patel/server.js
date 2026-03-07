const express = require('express');
const path = require('path');
const app = express();

// serve static assets from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Production server running on http://localhost:${port}`);
});
