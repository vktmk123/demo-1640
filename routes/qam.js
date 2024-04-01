const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const qamController = require('../controller/qam');
const { isQAM } = require("../middleware/auth");

// router.get('/qam_index', isQAM, qamController.getQAM);
router.get('/qam_index', isQAM, qamController.getQAM);
router.get('/qam/qamAddEvent', isQAM, qamController.getAddEvent);
router.post('/qam/doAddEvent', isQAM, qamController.doAddEvent);
router.get('/qam/qamViewEvent', isQAM, qamController.getViewEvent);
router.get('/qam/qamViewEventDetail', isQAM, qamController.getEventDetail);
router.post('/qam/qamViewEventDetail', isQAM, qamController.getEventDetail);
router.get('/qam/qamDeleteEvent', isQAM, qamController.deleteEvent);


router.get('/qam/qamEditEvent', isQAM, qamController.editEvent);
router.post('/qam/doEditEvent', isQAM, qamController.updateEvent);
router.get('/qam/downloadZip', isQAM, qamController.downloadZip);
router.get('/qam/downloadCSV', isQAM, qamController.downloadCSV);

router.get('/qam/numberOfIdeasByYear', isQAM, qamController.numberOfIdeasByYear);
router.post('/qam/numberOfIdeasByYear', isQAM, qamController.numberOfIdeasByYear);
router.get('/qam/numberOfIdeasByYear2', isQAM, qamController.numberOfIdeasByYear2);
router.post('/qam/numberOfIdeasByYear2', isQAM, qamController.numberOfIdeasByYear2);
router.get('/qam/numberOfPeople', isQAM, qamController.numberOfPeople);

router.get('/qam/changePassword', isQAM, qamController.changePassword)
router.post('/qam/doChangePassword', isQAM, qamController.doChangePassword)

router.post('/qam/qamSearchEvent', isQAM, qamController.searchEvent);
module.exports = router;