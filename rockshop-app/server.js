// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();

// Use body-parser to parse JSON requests
app.use(bodyParser.json());

// Use body-parser to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" folder (index.html, scripts.js, etc.)
app.use(express.static('public'));

// Mount your routes under "/api"
app.use('/api', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
