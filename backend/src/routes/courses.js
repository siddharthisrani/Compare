const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const {
  createValidators, listCourses, getCourse, createCourse, updateCourse, deactivateCourse,exportCourseXlsx
} = require('../controllers/courseController');

// public listing
router.get('/', listCourses);
router.get('/:id', getCourse);
router.get('/:id/export-xlsx', exportCourseXlsx);

// protected CRUD: only admin/trainer can create/update/delete
router.post('/', requireAuth, requireRole(['admin','trainer']), createValidators, createCourse);
router.put('/:id', requireAuth, requireRole(['admin','trainer']), updateCourse);
router.delete('/:id', requireAuth, requireRole(['admin','trainer']), deactivateCourse);

module.exports = router;
