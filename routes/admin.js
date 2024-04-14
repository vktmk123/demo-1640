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

//Manager
const storageManager = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/Manager");
    console.log(req.body);
  },
  //add back the extension
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const uploadManager = multer({
  storage: storageManager,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.get("/admin/viewManager", isAdmin, adminController.viewManager);
router.get("/admin/addManager", isAdmin, adminController.addManager);
router.post(
  "/admin/doAddManager",
  isAdmin,
  uploadManager.single("picture"),
  adminController.doAddManager
);
router.get("/admin/deleteManager", isAdmin, adminController.deleteManager);
router.get("/admin/editManager", isAdmin, adminController.editManager);
router.post(
  "/admin/doEditManager",
  isAdmin,
  uploadManager.single("picture"),
  adminController.doEditManager
);
router.post("/admin/searchManager", isAdmin, adminController.searchManager);

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
router.post("/admin/doAddStudent", isAdmin, uploadStudent.single("picture"), adminController.doAddStudent);

router.get("/admin/editStudent", isAdmin, adminController.editStudent);
router.post("/admin/doEditStudent", isAdmin, uploadStudent.single("picture"), adminController.doEditStudent);
router.get("/admin/deleteStudent", isAdmin, adminController.deleteStudent);
router.post("/admin/searchStudent", isAdmin, adminController.searchStudent);

router.get("/admin/viewEvent", isAdmin, adminController.viewEvent);
router.post("/admin/searchEvent", isAdmin, adminController.searchEvent);
router.get("/admin/event/edit", isAdmin, adminController.editDate);
router.post("/admin/doEditEvent", isAdmin, adminController.doEditDate);

router.get("/admin/AddEvent", isAdmin, adminController.getAddEvent);
router.post("/admin/doAddEvent", isAdmin, adminController.doAddEvent);


router.get("/admin/viewSubmittedIdeas", isAdmin, adminController.viewSubmittedIdeas);
router.get("/admin/viewEventDetail", isAdmin, adminController.viewEventDetail);
router.post("/admin/viewEventDetail", isAdmin, adminController.viewEventDetail);


//Guest
const storageGuest = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/guest");
  },
  //add back the extension
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
const uploadGuest = multer({
  storage: storageGuest,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.get("/admin/viewGuest", isAdmin, adminController.viewGuest);
router.get("/admin/addGuest", isAdmin, adminController.addGuest);
router.post("/admin/doAddGuest", isAdmin, uploadGuest.single("picture"), adminController.doAddGuest);
router.get("/admin/editGuest", isAdmin, adminController.editGuest);
router.post("/admin/doEditGuest", isAdmin, uploadGuest.single("picture"), adminController.doEditGuest);
router.get("/admin/deleteGuest", isAdmin, adminController.deleteGuest);



module.exports = router;
