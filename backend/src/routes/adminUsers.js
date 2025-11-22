const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const {
  createUserValidators,
  updateUserValidators,
  listUsers,
  createUser,
  updateUser,
  deactivateUser
} = require('../controllers/adminUserController');

// All these routes are only for admin
router.use(requireAuth, requireRole(['admin']));

router.get('/', listUsers);
router.post('/', createUserValidators, createUser);
router.put('/:id', updateUserValidators, updateUser);
router.delete('/:id', deactivateUser);

module.exports = router;
