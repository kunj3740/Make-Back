const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createFolder,
  getFoldersByProject,
  getFolderById,
  updateFolder,
  deleteFolder,
  createApi,
  getApiById,
  updateApi,
  deleteApi
} = require('../controllers/folderController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Folder CRUD operations
router.post('/', createFolder);
router.get('/project/:projectId', getFoldersByProject);
router.get('/:folderId', getFolderById);
router.put('/:folderId', updateFolder);
router.delete('/:folderId', deleteFolder);

// API CRUD operations within folders
router.post('/:folderId/api', createApi);
router.get('/:folderId/api/:apiId', getApiById);
router.put('/:folderId/api/:apiId', updateApi);
router.delete('/:folderId/api/:apiId', deleteApi);

module.exports = router;