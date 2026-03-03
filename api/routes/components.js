const express = require('express');
const router = express.Router();
const can_access = require('../middleware/can_access');

router.get('/components', can_access('user'), (req, res) => {
  res.json({ items: [] });
});

router.post('/components', can_access('manager'), (req, res) => {
  res.status(201).json({ ok: true });
});

module.exports = router;
