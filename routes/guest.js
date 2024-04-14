const express = require("express");
const guestController = require("../controller/guest"); 
const router = express.Router();

router.get("/guest", guestController.getGuest);
router.get("/guest/viewIdeaPublished", guestController.viewIdeaPublished);


module.exports = router;