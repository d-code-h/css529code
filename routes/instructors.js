const express = require('express'),
  router = express.Router();
// User Dashboard
router.get('/', (req, res, next) => {
  res.render('dashboard');
});

module.exports = router;
