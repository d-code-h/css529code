const express = require('express'),
  router = express.Router();
// User Dashboard
router.get('/dashboard', (req, res) => {
  res.render('student/dashboard');
});

module.exports = router;
