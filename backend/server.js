const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

// Use the cors middleware
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/svgs', (req, res) => {
  const svgDirectory = path.join(__dirname, 'public/svgs');
  fs.readdir(svgDirectory, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory');
    }
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    res.json(svgFiles);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
