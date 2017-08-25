const express = require('express');
const app = express();

const PORT = 8000;

app.use((req, res) => {
  res.sendStatus(418);
})

app.listen(PORT, () => {
  console.log('listening on port', PORT);
})
