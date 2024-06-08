// routes/groupRoutes.js
const express = require('express');
const { createGroup, deleteGroup, searchGroups, addMember, getAllGroups, viewMembers } = require('../controllers/groupController');
// const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/creategroup',  createGroup);
router.get('/getGroup',  getAllGroups);
router.delete('/deletegroup/:groupId',  deleteGroup);
router.get('/search',  searchGroups);
router.put('/:groupId/members',  addMember);
router.get('/:groupId/viewmeber', viewMembers);

module.exports = router;
