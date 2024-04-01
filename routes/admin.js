const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const adminController = require("../controller/admin");
const { isAdmin } = require("../middleware/auth");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

router.get("/admin", isAdmin, adminController.getAdmin);
router.get("/admin/changePassword", isAdmin, adminController.changePassword);
router.post(
  "/admin/doChangePassword",
  isAdmin,
  adminController.doChangePassword
);

//QAmanager
const storageQAmanager = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/QAmanager");
    console.log(req.body);
  },
  //add back the extension
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const uploadQAmanager = multer({
  storage: storageQAmanager,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.get(
  "/admin/viewQualityAssuranceManager",
  isAdmin,
  adminController.viewQAmanager
);
router.get(
  "/admin/addQualityAssuranceManager",
  isAdmin,
  adminController.addQAmanager
);
router.post(
  "/admin/doAddQualityAssuranceManager",
  isAdmin,
  uploadQAmanager.single("picture"),
  adminController.doAddQAmanager
);
router.get(
  "/admin/deleteQualityAssuranceManager",
  isAdmin,
  adminController.deleteQAmanager
);
router.get(
  "/admin/editQualityAssuranceManager",
  isAdmin,
  adminController.editQAmanager
);
router.post(
  "/admin/doEditQualityAssuranceManager",
  isAdmin,
  uploadQAmanager.single("picture"),
  adminController.doEditQAmanager
);
router.post(
  "/admin/searchQualityAssuranceManager",
  isAdmin,
  adminController.searchQAmanager
);

//Faculty
router.get("/admin/getFaculties", isAdmin, adminController.getFaculties);

//QAcoordinator
const storageQAcoordinator = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/QAcoordinator");
  },
  //add back the extension
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const uploadQAcoordinator = multer({
  storage: storageQAcoordinator,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});
router.get(
  "/admin/viewQualityAssuranceCoordinator",
  isAdmin,
  adminController.viewQAcoordinator
);
router.get(
  "/admin/addQualityAssuranceCoordinator",
  isAdmin,
  adminController.addQAcoordinator
);
router.post(
  "/admin/doAddQualityAssuranceCoordinator",
  isAdmin,
  uploadQAcoordinator.single("picture"),
  adminController.doAddQAcoordinator
);
router.get(
  "/admin/editQualityAssuranceCoordinator",
  isAdmin,
  adminController.editQAcoordinator
);
router.post(
  "/admin/doEditQualityAssuranceCoordinator",
  isAdmin,
  uploadQAcoordinator.single("picture"),
  adminController.doEditQAcoordinator
);
router.get(
  "/admin/deleteQualityAssuranceCoordinator",
  isAdmin,
  adminController.deleteQAcoordinator
);
router.post(
  "/admin/searchQualityAssuranceCoordinator",
  isAdmin,
  adminController.searchQAcoordinator
);

//Student
const storageStudent = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/student");
  },
  //add back the extension
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const uploadStudent = multer({
  storage: storageStudent,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});
router.get("/admin/viewStudent", isAdmin, adminController.viewStudent);
router.get("/admin/addStudent", isAdmin, adminController.addStudent);
router.post(
  "/admin/doAddStudent",
  isAdmin,
  uploadStudent.single("picture"),
  adminController.doAddStudent
);
router.get("/admin/editStudent", isAdmin, adminController.editStudent);
router.post(
  "/admin/doEditStudent",
  isAdmin,
  uploadStudent.single("picture"),
  adminController.doEditStudent
);
router.get("/admin/deleteStudent", isAdmin, adminController.deleteStudent);
router.post("/admin/searchStudent", isAdmin, adminController.searchStudent);

router.get("/admin/viewEvent", isAdmin, adminController.viewEvent);
router.post("/admin/searchEvent", isAdmin, adminController.searchEvent);
router.get("/admin/event/edit", isAdmin, adminController.editDate);
router.post("/admin/doEditEvent", isAdmin, adminController.doEditDate);

router.get(
  "/admin/viewSubmittedIdeas",
  isAdmin,
  adminController.viewSubmittedIdeas
);
router.get("/admin/viewEventDetail", isAdmin, adminController.viewEventDetail);
router.post("/admin/viewEventDetail", isAdmin, adminController.viewEventDetail);
module.exports = router;
