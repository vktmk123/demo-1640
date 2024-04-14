const Account = require("../models/user");
const bcrypt = require("bcryptjs");
const Event = require("../models/event");
const idea = require("../models/ideas");
const User = require("../models/user");
const Faculty = require("../models/faculty");
const validation = require("./validation");
const Comment = require("../models/comments");
const AdmZip = require("adm-zip");
var mongoose = require("mongoose");
const fs = require("fs");
const fsPromises = fs.promises;

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

exports.getManager = async (req, res) => {
  res.render("manager/manager_index", { loginName: req.session.email });
};

exports.changePassword = async (req, res) => {
  res.render("manager/changePassword", { loginName: req.session.email });
};

exports.doChangePassword = async (req, res) => {
  let user = await Account.findOne({ email: req.session.email });
  let current = req.body.current;
  let newpw = req.body.new;
  let confirm = req.body.confirm;
  let errors = {};
  let flag = true;
  try {
    await bcrypt.compare(current, user.password).then((doMatch) => {
      if (doMatch) {
        if (newpw.length < 8) {
          flag = false;
          Object.assign(errors, {
            length: "Password must contain 8 characters or more!",
          });
        } else if (newpw != confirm) {
          flag = false;
          Object.assign(errors, {
            check: "New Password and Confirm Password do not match!",
          });
        }
      } else {
        flag = false;
        Object.assign(errors, { current: "Old password is incorrect!" });
      }
    });
    if (!flag) {
      res.render("manager/changePassword", {
        errors: errors,
        loginName: req.session.email,
      });
    } else {
      await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newpw, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user = user.save();
          req.session.user = user;
          res.redirect("/manager_index");
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getAddEvent = async (req, res) => {
  res.render("manager/managerAddEvent", { loginName: req.session.email });
};


exports.getViewEvent = async (req, res) => {
  let listEvent = await Event.find();
  let tempDate = new Date();
  let listCompare = [];
  listEvent.forEach((element) => {
    listCompare.push({
      compare: tempDate > element.dateEnd,
      event: element,
    });
  });
  // console.log(listCompare)
  // let compare = tempDate > aEvent.dateEnd;
  res.render("manager/managerViewEvent", {
    listCompare: listCompare,
    loginName: req.session.email,
  });
};

exports.getEventDetail = async (req, res) => {
  console.log("1");
  let id;
  let noPage;
  //console.log(req.body.idEvent);
  let page = 1;
  if (req.body.noPage != undefined) {
    page = req.body.noPage;
  }
  if (req.query.id === undefined) {
    id = req.body.idEvent;
  } else {
    id = req.query.id;
  }
  if (req.body.sortBy != undefined) {
    req.session.sort = req.body.sortBy;
  }
  let sortBy = req.session.sort;
  // let id = req.query.id;
  let listFiles = [];
  try {
    let listIdeas = await idea
      .find({ eventID: id })
      .populate({ path: "comments", populate: { path: "author" } })
      .populate("author");
    let aEvent = await Event.findById(id);
    let tempDate = new Date();
    let compare = tempDate > aEvent.dateEnd;
    const fs = require("fs");
    var counter = 0;
    function callBack() {
      if (listIdeas.length === counter) {
        if (sortBy === "like") {
          listFiles.sort((a, b) => {
            if (b.idea.like < a.idea.like) {
              return -1;
            } else if (b.idea.like > a.idea.like) {
              return 1;
            } else {
              if (a.idea._id < b.idea._id) {
                return -1;
              }
              if (a.idea._id > b.idea._id) {
                return 1;
              }
            }
          });
          // console.log('like');
        } else if (sortBy === "comment") {
          listFiles.sort((a, b) => {
            if (b.idea.comments.length < a.idea.comments.length) {
              return -1;
            } else if (b.idea.comments.length > a.idea.comments.length) {
              return 1;
            } else {
              if (a.idea._id < b.idea._id) {
                return -1;
              }
              if (a.idea._id > b.idea._id) {
                return 1;
              }
            }
          });
          // console.log('comment');
        } else if (sortBy === "time") {
          listFiles.sort((a, b) => {
            const A = new Date(a.idea.time);
            const B = new Date(b.idea.time);
            if (A < B) {
              return 1;
            } else if (A > B) {
              return -1;
            } else {
              if (a.idea._id < b.idea._id) {
                return -1;
              }
              if (a.idea._id > b.idea._id) {
                return 1;
              }
            }
          });
          // console.log('time');
        } else {
          listFiles.sort((a, b) => {
            if (a.idea._id < b.idea._id) {
              return -1;
            }
            if (a.idea._id > b.idea._id) {
              return 1;
            }
          });
          //console.log('id');
        }
        noPage = Math.floor(listIdeas.length / 5);
        console.log(noPage);
        if (listIdeas.length % 5 != 0) {
          noPage += 1;
        }
        console.log(noPage);
        let s = (page - 1) * 5;
        console.log(s + " nnn " + (s + 5));
        listFiles = listFiles.slice(s, s + 5);
        console.log(noPage);
        console.log(listFiles.length);
        //res.render('admin/viewEventDetail', { idEvent: id, listFiles: listFiles, nameIdea: nameIdea, listComment: listComment, compare: compare, loginName: req.session.email });
        res.render("manager/managerViewEventDetail", {
          idEvent: id,
          listFiles: listFiles,
          sortBy: sortBy,
          noPage: noPage,
          page: page,
          loginName: req.session.email,
        });
      }
    }
    console.log(listIdeas);
    if (listIdeas.length != 0) {
      listIdeas.forEach(async (i) => {
        fs.readdir(i.url, (err, files) => {
          listFiles.push({
            counter: counter,
            value: files,
            linkValue: i.url.slice(7),
            idea: i,
          });
          counter = counter + 1;
          callBack();
        });
      });
    } else {
      res.render("manager/managerViewEventDetail", {
        idEvent: id,
        listFiles: listFiles,
        sortBy: sortBy,
        noPage: noPage,
        page: page,
        loginName: req.session.email,
      });
    }
  } catch (e) {
    // console.log(e);
    res.render("manager/managerViewEventDetail", {
      idEvent: id,
      listFiles: listFiles,
      sortBy: sortBy,
      noPage: noPage,
      page: page,
      loginName: req.session.email,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  let id = req.query.id;
  let dir = await Event.findById(id);
  Event.findByIdAndDelete(id).then((data = {}));
  const path = "public/folder/" + dir.name;
  // include node fs module
  const fs = require("fs");
  fs.rm(path, { recursive: true }, () => console.log("delete done"));
  res.redirect("/manager/managerViewEvent");
};

exports.editEvent = async (req, res) => {
  let id = req.query.id;
  let aEvent = await Event.findById(id);
  res.render("manager/managerEditEvent", {
    aEvent: aEvent,
    loginName: req.session.email,
  });
};

exports.updateEvent = async (req, res) => {
  let id = req.body.id;
  let aEvent = await Event.findById(id);
  console.log(aEvent);
  aEvent.name = req.body.name;
  aEvent.description = req.body.description;
  console.log(req.body.name);
  console.log(req.body.description);
  try {
    aEvent = await aEvent.save();
    res.redirect("/manager/managerViewEvent");
  } catch (error) {
    console.log(error);
    res.redirect("/manager/managerViewEvent");
  }
};

exports.downloadZip = async (req, res) => {
  const fs = require("fs");
  let id = req.query.id;
  let aEvent = await Event.findById(id);
  let folderpath = __dirname.slice(0, -10) + aEvent.url;

  var zp = new AdmZip();
  zp.addLocalFolder(folderpath);
  // here we assigned the name to our downloaded file!
  const file_after_download = "downloaded_file.zip";
  // toBuffer() is used to read the data and save it
  // for downloading process!
  const data = zp.toBuffer();
  res.set("Content-Type", "application/octet-stream");
  res.set("Content-Disposition", `attachment; filename=${file_after_download}`);
  res.set("Content-Length", data.length);
  res.send(data);
};

exports.numberOfContributionsPerFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find({});
    const contributionsPerFaculty = await Promise.all(
      faculties.map(async (faculty) => {
        const numberOfContributions = await idea.countDocuments({ faculty: faculty._id });
        return {
          facultyName: faculty.name,
          numberOfContributions: numberOfContributions
        };
      })
    );
    res.render("manager/numberOfContributionsPerFaculty", {
      contributionsPerFaculty: contributionsPerFaculty,
      loginName: req.session.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.numberOfIdeasByYear2 = async (req, res) => {
  let year = 2024;
  console.log(req.body.year);
  if (req.body.year != undefined) {
    year = parseInt(req.body.year);
  }
  let dateS = new Date(year + "-01-01");
  let dateE = new Date(year + "-12-31");
  let data = [];
  console.log(dateE);
  let listEvent = await Event.find({
    dateStart: {
      $gte: dateS,
      $lt: dateE,
    },
  });
  let counter = 0;
  listEvent.forEach(async (i) => {
    let noIdeas = await idea
      .find({
        eventID: i._id,
        time: {
          $gte: dateS,
          $lt: dateE,
        },
      })
      .count();
    data.push({
      x: i.name,
      value: noIdeas,
    });
    counter += 1;
    if (counter === listEvent.length) {
      console.log(data);
      res.render("manager/numberOfIdeasByYear2", {
        data: JSON.stringify(data),
        loginName: req.session.email,
      });
    }
  });
};

exports.numberOfPeople = async (req, res) => {
  let role = ["business", "Computer", "Design"];
  let data = [];
  let counter = 0;
  role.forEach(async (i) => {
    let noPeople = await Account.find({ role: i }).count();
    data.push({
      x: i,
      value: noPeople,
    });
    counter += 1;
    if (counter === 3) {
      console.log(data);
      res.render("manager/numberOfPeoPle", {
        data: JSON.stringify(data),
        loginName: req.session.email,
      });
    }
  });
};

exports.searchEvent = async (req, res) => {
  const searchText = req.body.keyword;
  console.log(req.body);
  let listEvent;
  let listCompare = [];
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");
  if (!checkEmpty) {
    res.redirect("/manager/managerViewEvent");
  } else {
    listEvent = await Event.find({ name: searchCondition });
    let tempDate = new Date();
    let listCompare = [];
    listEvent.forEach((element) => {
      listCompare.push({
        compare: tempDate > element.dateEnd,
        event: element,
      });
    });
    console.log(listCompare);
    res.render("manager/managerViewEvent", {
      listCompare: listCompare,
      loginName: req.session.email,
    });
  }
};
