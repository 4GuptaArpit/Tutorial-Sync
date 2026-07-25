const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateProject } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

const {
  getProjects,
  getProjectById,
  createProject,
  analyzeProject,
  updateProject,
  deleteProject,
  exportProjectMarkdown
} = require('../controllers/projectController');

// All project routes require auth
router.use(auth);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', validateProject, createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/analyze', aiLimiter, analyzeProject);
router.get('/:id/export', exportProjectMarkdown);

module.exports = router;
