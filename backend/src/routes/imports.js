const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { upload, importCsvHandler } = require('../controllers/importController');

// protected: only admin/trainer
router.post('/courses/csv', requireAuth, requireRole(['admin','trainer']), upload.single('file'), importCsvHandler);

module.exports = router;
