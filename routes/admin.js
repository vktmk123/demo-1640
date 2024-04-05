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

//Coordinator
const storageCoordinator = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/Coordinator");
  },
  //add back the extension
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const uploadCoordinator = multer({
  storage: storageCoordinator,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});
router.get(
  "/admin/viewCoordinator",
  isAdmin,
  adminController.viewCoordinator
);
router.get(
  "/admin/addCoordinator",
  isAdmin,
  adminController.addCoordinator
);
router.post(
  "/admin/doAddCoordinator",
  isAdmin,
  uploadCoordinator.single("picture"),
  adminController.doAddCoordinator
);
router.get(
  "/admin/editCoordinator",
  isAdmin,
  adminController.editCoordinator
);
router.post(
  "/admin/doEditCoordinator",
  isAdmin,
  uploadCoordinator.single("picture"),
  adminController.doEditCoordinator
);
router.get(
  "/admin/deleteCoordinator",
  isAdmin,
  adminController.deleteCoordinator
);
router.post(
  "/admin/searchCoordinator",
  isAdmin,
  adminController.searchCoordinator
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
