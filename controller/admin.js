const Account = require("../models/user");
const Student = require("../models/student");
const Coordinator = require("../models/Coordinator");
const QAmanager = require("../models/QAmanager");
const event = require("../models/event");
const Comments = require("../models/comments");
const idea = require("../models/ideas");
const Faculty = require("../models/faculty");
const validation = require("./validation");
const bcrypt = require("bcryptjs");

exports.getAdmin = async (req, res) => {
  res.render("admin/admin", { loginName: req.session.email });
};
exports.changePassword = async (req, res) => {
  res.render("admin/changePassword", { loginName: req.session.email });
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
      res.render("admin/changePassword", {
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
          res.redirect("/admin");
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
};
//QAmanager
exports.viewQAmanager = async (req, res) => {
  let listQAmanager = await QAmanager.find();
  console.log(listQAmanager);
  res.render("admin/viewQAmanager", {
    listQAmanager: listQAmanager,
    loginName: req.session.email,
  });
};
exports.addQAmanager = async (req, res) => {
  res.render("admin/addQAmanager", { loginName: req.session.email });
};
exports.doAddQAmanager = async (req, res) => {
  //console.log(req.body)
  let newQAmanager;
  if (req.file) {
    newQAmanager = new QAmanager({
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: new Date(req.body.date),
      address: req.body.address,
      img: req.file.filename,
    });
  } else {
    newQAmanager = new QAmanager({
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: new Date(req.body.date),
      address: req.body.address,
    });
  }
  let newAccount = new Account({
    email: req.body.email,
    password: "12345678",
    role: "QAmanager",
  });
  try {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newAccount.password, salt, (err, hash) => {
        if (err) throw err;
        newAccount.password = hash;
        newAccount = newAccount.save();
      });
    });
    newQAmanager = await newQAmanager.save();
    res.redirect("/admin/viewQualityAssuranceManager");
  } catch (error) {
    console.log(error);
    return 0;
    // res.redirect('/admin/viewQualityAssuranceManager');
  }
};
exports.editQAmanager = async (req, res) => {
  let id = req.query.id;
  let aQAmanager = await QAmanager.findById(id);

  res.render("admin/editQAmanager", {
    aQAmanager: aQAmanager,
    loginName: req.session.email,
  });
};
exports.doEditQAmanager = async (req, res) => {
  let id = req.body.id;
  let aQAmanager = await QAmanager.findById(id);
  // console.log(aQAmanager);

  try {
    if (req.file) {
      aQAmanager.img = req.file.filename;
    }
    aQAmanager.name = req.body.name;
    aQAmanager.dateOfBirth = new Date(req.body.date);
    aQAmanager.address = req.body.address;
    aQAmanager = await aQAmanager.save();
    res.redirect("/admin/viewQualityAssuranceManager");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/viewQualityAssuranceManager");
  }
};
exports.deleteQAmanager = async (req, res) => {
  let id = req.query.id;
  let aQAmanager = await QAmanager.findById(id);
  let email = aQAmanager.email;
  console.log(email);
  try {
    await Account.deleteOne({ email: email });
    console.log("Account is deleted");
  } catch (err) {
    console.error(err);
  }
  await QAmanager.findByIdAndDelete(id).then((data = {}));

  res.redirect("/admin/viewQualityAssuranceManager");
};

exports.searchQAmanager = async (req, res) => {
  const searchText = req.body.keyword;
  //console.log(req.body.keyword);
  let listQAmanager;
  let checkAlphaName = validation.checkAlphabet(searchText);
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");

  //console.log(checkEmpty);
  if (!checkEmpty) {
    res.redirect("/admin/viewQualityAssuranceManager");
  } else if (checkAlphaName) {
    listQAmanager = await QAmanager.find({ name: searchCondition });
  }
  res.render("admin/viewQAmanager", {
    listQAmanager: listQAmanager,
    loginName: req.session.email,
  });
};

//Faculty
exports.getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find({});
    res.json(faculties);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
//Coordinator
exports.viewCoordinator = async (req, res) => {
  let listCoordinator = await Coordinator.find().populate("faculty");
  res.render("admin/viewCoordinator", {
    listCoordinator: listCoordinator,
    loginName: req.session.email,
  });
};

exports.addCoordinator = async (req, res) => {
  res.render("admin/addCoordinator", { loginName: req.session.email });
};
exports.doAddCoordinator = async (req, res) => {
  let newCoordinator;
  console.log(req.body);
  if (req.file) {
    newCoordinator = new Coordinator({
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: new Date(req.body.date),
      address: req.body.address,
      img: req.file.filename,
      faculty: req.body.faculty,
    });
  } else {
    newCoordinator = new Coordinator({
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: new Date(req.body.date),
      address: req.body.address,
      faculty: req.body.faculty,
    });
  }
  let newAccount = new Account({
    email: req.body.email,
    password: "12345678",
    role: "Coordinator",
  });
  try {
    await bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newAccount.password, salt, (err, hash) => {
        if (err) throw err;
        newAccount.password = hash;
        newAccount = newAccount.save();
      });
    });
    newCoordinator = await newCoordinator.save();
    //console.log(newTrainee);
    res.redirect("/admin/viewCoordinator");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/viewCoordinator");
  }
};
exports.editCoordinator = async (req, res) => {
  let id = req.query.id;
  let aCoordinator = await Coordinator.findById(id);

  res.render("admin/editCoordinator", {
    aCoordinator: aCoordinator,
    loginName: req.session.email,
  });
};
exports.doEditCoordinator = async (req, res) => {
  let id = req.body.id;
  let aCoordinator = await Coordinator.findById(id);

  try {
    if (req.file) {
      aCoordinator.img = req.file.filename;
    }
    aCoordinator.name = req.body.name;
    aCoordinator.dateOfBirth = new Date(req.body.date);
    aCoordinator.address = req.body.address;
    aCoordinator.faculty = req.body.faculty;
    aCoordinator = await aCoordinator.save();
    res.redirect("/admin/viewCoordinator");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/viewCoordinator");
  }
};

exports.deleteCoordinator = async (req, res) => {
  let id = req.query.id;
  let aCoordinator = await Coordinator.findById(id);
  let email = aCoordinator.email;
  try {
    await Account.deleteOne({ email: email });
    console.log("Account is deleted");
  } catch (err) {
    console.error(err);
  }
  await Coordinator.findByIdAndDelete(id).then((data = {}));

  res.redirect("/admin/viewCoordinator");
};

exports.searchCoordinator = async (req, res) => {
  const searchText = req.body.keyword;
  //console.log(req.body.keyword);
  let listCoordinator;
  let checkAlphaName = validation.checkAlphabet(searchText);
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");

  //console.log(checkEmpty);
  if (!checkEmpty) {
    res.redirect("/admin/viewCoordinator");
  } else if (checkAlphaName) {
    listCoordinator = await Coordinator.find({ name: searchCondition });
  }
  res.render("admin/viewCoordinator", {
    listCoordinator: listCoordinator,
    loginName: req.session.email,
  });
};

//Student student
exports.viewStudent = async (req, res) => {
  let students = await Student.find().populate("faculty");
  res.render("admin/viewStudent", {
    listStudent: students,
    loginName: req.session.email,
  });
};
exports.addStudent = async (req, res) => {
  res.render("admin/addStudent", { loginName: req.session.email });
};
exports.doAddStudent = async (req, res) => {
  let newStudent;
  if (req.file) {
    newStudent = new Student({
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: new Date(req.body.date),
      address: req.body.address,
      img: req.file.filename,
      type: req.body.department,
      faculty: req.body.faculty,
    });
  } else {
    newStudent = new Student({
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: new Date(req.body.date),
      address: req.body.address,
      faculty: req.body.faculty,
    });
  }
  let newAccount = new Account({
    email: req.body.email,
    password: "12345678",
    role: "Student",
  });
  try {
    await bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newAccount.password, salt, (err, hash) => {
        if (err) throw err;
        newAccount.password = hash;
        newAccount = newAccount.save();
      });
    });
    newStudent = await newStudent.save();
    res.redirect("/admin/viewStudent");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/viewStudent");
  }
};
exports.editStudent = async (req, res) => {
  let id = req.query.id;
  let aStudent = await Student.findById(id);

  res.render("admin/editStudent", {
    aStudent: aStudent,
    loginName: req.session.email,
  });
};
exports.doEditStudent = async (req, res) => {
  let id = req.body.id;
  let aStudent = await Student.findById(id);

  try {
    if (req.file) {
      aStudent.img = req.file.filename;
    }
    aStudent.name = req.body.name;
    aStudent.dateOfBirth = new Date(req.body.date);
    aStudent.address = req.body.address;
    aStudent.faculty = req.body.faculty;
    aStudent = await aStudent.save();
    res.redirect("/admin/viewStudent");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/viewStudent");
  }
};
exports.deleteStudent = async (req, res) => {
  let id = req.query.id;
  let aStudent = await Student.findById(id);
  let email = aStudent.email;
  console.log(email);
  try {
    await Account.deleteOne({ email: email });
    console.log("Account is deleted");
  } catch (err) {
    console.error(err);
  }
  await idea.deleteMany({ author: aStudent.id });
  await Comments.deleteMany({ author: aStudent.id });
  await Student.findByIdAndDelete(id);
  res.redirect("/admin/viewStudent");
};

exports.searchStudent = async (req, res) => {
  const searchText = req.body.keyword;
  console.log(req.body);
  let listStudent;
  let checkAlphaName = validation.checkAlphabet(searchText);
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");

  //console.log(checkEmpty);
  if (!checkEmpty) {
    res.redirect("/admin/viewStudent");
  } else if (checkAlphaName) {
    listStudent = await Student.find({ name: searchCondition });
  }
  res.render("admin/viewStudent", {
    listStudent: listStudent,
    loginName: req.session.email,
  });
};
//Edit date
exports.viewEvent = async (req, res) => {
  let listEvent = await event.find();
  res.render("admin/viewEvent", {
    listEvent: listEvent,
    loginName: req.session.email,
  });
};
exports.searchEvent = async (req, res) => {
  const searchText = req.body.keyword;
  let listEvent;
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");

  if (!checkEmpty) {
    res.redirect("/admin/viewEvent");
  } else {
    listEvent = await event.find({ name: searchCondition });
  }
  res.render("admin/viewEvent", {
    listEvent: listEvent,
    loginName: req.session.email,
  });
};
exports.editDate = async (req, res) => {
  let id = req.query.id;
  let aEvent = await event.findById(id);
  res.render("admin/editDate", {
    aEvent: aEvent,
    loginName: req.session.email,
  });
};
exports.doEditDate = async (req, res) => {
  console.log(req.body);
  let id = req.body.id;

  let aEvent = await event.findById(id);
  console.log(req.body.dateStart);
  console.log(req.body.dateEnd);
  let errors;
  try {
    if (req.body.dateStart < req.body.dateEnd) {
      aEvent.dateStart = new Date(req.body.dateStart);
      aEvent.dateEnd = new Date(req.body.dateEnd);
      aEvent = await aEvent.save();
      res.redirect("/admin/viewEvent");
    } else {
      errors = "End date must be greater than start date";
      res.render("admin/editDate", {
        errors: errors,
        aEvent: aEvent,
        loginName: req.session.email,
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/admin/viewEvent");
  }
};

//view

exports.viewSubmittedIdeas = async (req, res) => {
  let listEvent = await event.find();
  res.render("admin/viewSubmittedIdeas", {
    listEvent: listEvent,
    loginName: req.session.email,
  });
};

exports.viewEventDetail = async (req, res) => {
  let id;
  let noPage;
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
  let listFiles = [];
  try {
      let listIdeas = await idea.find({ eventID: id }).populate({path:'comments', populate : { path: 'author'}}).populate('author');
      let aEvent = await event.findById(id);
      let tempDate = new Date();
      let compare = tempDate > aEvent.dateEnd;
      const fs = require("fs");
      var counter = 0;
      function callBack() {
          if (listIdeas.length === counter) {
              if (sortBy === 'time') {
                  listFiles.sort((a, b) => {
                      const A = new Date(a.idea.time)
                      const B = new Date(b.idea.time)
                      if (A < B) {
                          return 1;
                      }
                      else if (A > B) {
                          return -1;
                      }
                      else{
                          if (a.idea._id < b.idea._id) {
                              return -1;
                          }
                          if (a.idea._id > b.idea._id) {
                              return 1;
                          }
                      };
                  });
              } else {
                  listFiles.sort((a, b) => {
                      if (a.idea._id < b.idea._id) {
                          return -1;
                      }
                      if (a.idea._id > b.idea._id) {
                          return 1;
                      }
                  });
              }
              noPage = Math.floor(listIdeas.length / 5);
              if (listIdeas.length % 5 != 0) {
                  noPage += 1
              }
              let s = (page - 1) * 5;
              listFiles = listFiles.slice(s, s + 5);
              res.render('admin/viewEventDetail', { idEvent: id, listFiles: listFiles, compare: compare, sortBy:sortBy, noPage: noPage, page: page, loginName: req.session.email });  
          };
      };
      if (listIdeas.length != 0){
          listIdeas.forEach(async (i) => {
              fs.readdir(i.url, (err, files) => {
                  listFiles.push({
                      counter: counter,
                      value: files,
                      linkValue: i.url.slice(7),
                      idea: i
                  });
                  counter = counter + 1;
                  callBack();
              });
          })
      }else{
          res.render('admin/viewEventDetail', { idEvent: id, listFiles: listFiles, compare: compare, sortBy:sortBy, noPage: noPage, page: page, loginName: req.session.email });  
      }
  } catch (e) {
    console.log("123")
      console.log(e);
      res.render('admin/viewEventDetail', { idEvent: id, listFiles: listFiles, compare: compare, sortBy:sortBy, noPage: noPage, page: page, loginName: req.session.email });
  }
}

