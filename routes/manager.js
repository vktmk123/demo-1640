const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const managerController = require("../controller/manager");
const { isMng } = require("../middleware/auth");

// router.get('/manager_index', isMng, managerController.getManager);
router.get("/manager_index", isMng, managerController.getManager);
router.get("/manager/managerAddEvent", isMng, managerController.getAddEvent);
router.post("/manager/doAddEvent", isMng, managerController.doAddEvent);
router.get("/manager/managerViewEvent", isMng, managerController.getViewEvent);
router.get(
  "/manager/managerViewEventDetail",
  isMng,
  managerController.getEventDetail
);
router.post(
  "/manager/managerViewEventDetail",
  isMng,
  managerController.getEventDetail
);
router.get("/manager/managerDeleteEvent", isMng, managerController.deleteEvent);

router.get("/manager/managerEditEvent", isMng, managerController.editEvent);
router.post("/manager/doEditEvent", isMng, managerController.updateEvent);
router.get("/manager/downloadZip", isMng, managerController.downloadZip);
router.get("/manager/downloadCSV", isMng, managerController.downloadCSV);

router.get(
  "/manager/numberOfIdeasByYear",
  isMng,
  managerController.numberOfIdeasByYear
);
router.post(
  "/manager/numberOfIdeasByYear",
  isMng,
  managerController.numberOfIdeasByYear
);
router.get(
  "/manager/numberOfIdeasByYear2",
  isMng,
  managerController.numberOfIdeasByYear2
);
router.post(
  "/manager/numberOfIdeasByYear2",
  isMng,
  managerController.numberOfIdeasByYear2
);
router.get("/manager/numberOfPeople", isMng, managerController.numberOfPeople);

router.get("/manager/changePassword", isMng, managerController.changePassword);
router.post(
  "/manager/doChangePassword",
  isMng,
  managerController.doChangePassword
);

router.post(
  "/manager/managerSearchEvent",
  isMng,
  managerController.searchEvent
);
module.exports = router;
