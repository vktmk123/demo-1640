const express = require('express');
const router = express.Router();
const deanController = require('../controller/dean');
// const { isDean } = require("../middleware/auth");

router.get('/dean',deanController.getDean);

// router.post('/dean/viewMostComments/Comment',deanController.doComment);
router.get('/dean/viewMostComments',deanController.viewMostComments);


// router.get('/dean/view_ideas_by_faculty',deanController.view_ideas_by_faculty);
router.post('/dean/viewMostComments/Comment', deanController.doComment);

router.get('/dean/changePassword', deanController.changePassword);
router.post('/dean/doChangePassword', deanController.doChangePassword);

router.get('/dean/viewIdeaByFaculty', deanController.viewIdeaByFaculty);
router.post('/dean/publishIdea', deanController.selectIdeaToPublish);
router.get('/dean/viewIdeaPublished', deanController.viewIdeaPublished);


module.exports = router;