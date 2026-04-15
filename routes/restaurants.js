const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { name: "Test Restaurant 1" },
    { name: "Test Restaurant 2" }
  ]);
});

module.exports = router;