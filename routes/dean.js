const express = require('express');
const router = express.Router();
const deanController = require('../controller/dean');
// const { isDean } = require("../middleware/auth");

router.get('/dean',deanController.getDean);

// router.post('/dean/viewMostComments/Comment',deanController.doComment);
router.get('/dean/viewMostComments',deanController.viewMostComments);

router.post('/dean/viewMostComments/Comment', deanController.doComment);

router.get('/dean/changePassword', deanController.changePassword);
router.post('/dean/doChangePassword', deanController.doChangePassword);



module.exports = router;