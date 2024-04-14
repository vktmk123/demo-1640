const validation = require("./validation");
const Account = require("../models/user");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const idea = require("../models/ideas");
const event = require("../models/event");
const comment = require("../models/comments");
const multer = require("multer");
const { redirect } = require("express/lib/response");
const Student = require("../models/student");
const nodemailer = require("nodemailer");
const Dean = require("../models/Coordinator");
const faculty = require("../models/faculty");

exports.getStudent = async (req, res) => {
  res.render("student/student", { loginName: req.session.email });
};

exports.viewStudent = async (req, res) => {
  let students = await Student.find().populate("faculty");
  res.render("student/viewStudent", {
    listStudent: students,
    loginName: req.session.email,
  });
};

exports.searchStudent = async (req, res) => {
  const searchText = req.body.keyword;
  console.log(req.body);
  let listStudent;
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");

  //console.log(checkEmpty);
  if (!checkEmpty) {
    res.redirect("/student/viewStudent");
  } else {
    listStudent = await Student.find({ name: searchCondition });
  }
  res.render("student/viewStudent", {
    listStudent: listStudent,
    loginName: req.session.email,
  });
};

exports.addIdea = async (req, res) => {
  var id = req.query.id;
  res.render("student/addIdeas", { idEvent: id, loginName: req.session.email });
};

exports.doAddIdea = async (req, res) => {
  const fs = require("fs");
  let aStudent = await Student.findOne({ email: req.session.email });
  let idFaculty = aStudent.faculty;
  let ideaName = req.body.name;
  req.body.name = req.body.name.replace(" ", "_");
  var idEvent = req.body.idEvent;
  let aEvent = await event.findById(idEvent);
  let path = aEvent.url + "/" + req.body.name;

  let allQacs = await Dean.find({faculty: idFaculty});
  let dean_emails = [];
  for (let dean of allQacs) {
    dean_emails.push(dean.email);
  }
  console.log(dean_emails);
  let count = 0;
  function loop() {
    console.log(path);
    fs.access(path, (error) => {
      if (error) {
        fs.mkdir(path, (error) => {
          if (error) {
            console.log(error);
          } else {
            let newIdea;
            let checkAnnonymously = false;
            if (req.body.annonymously != undefined) {
              checkAnnonymously = true;
              newIdea = new idea({
                eventID: aEvent,
                name: req.body.name,
                author: aStudent,
                url: path,
                facultyID: idFaculty,
                approve: false,
                annonymously: true,
              });
            } else {
              newIdea = new idea({
                eventID: aEvent,
                name: req.body.name,
                author: aStudent,
                url: path,
                facultyID: idFaculty,
                approve: false,
              });
              //ok
            }
            let transporter = nodemailer.createTransport({
              service: "gmail",
              host: "smtp.gmail.com",
              port: 587,
              secure: false,
              auth: {
                user: "taydmgch190016@fpt.edu.vn",
                pass: "ycec ixbo vbwk pzlj",
              },
              tls: { rejectUnauthorized: false },
            });
            let content = "";
            content += `
                            <div style="padding: 10px; background-color: #003375">
                                <div style="padding: 10px; background-color: white;">    
                        `;
            content +=
              '<h4 style="color: #0085ff"> New Submitted Article</h4> <hr>';
            content +=
              '<span style="color: black"> Idea name: ' +
              ideaName.toString() +
              "</span><br>";
            content +=
              '<span style="color: black"> Event name: ' +
              aEvent.name.toString() +
              "</span><br>";
            if (!checkAnnonymously) {
              content +=
                '<span style="color: black"> Student name: ' +
                aStudent.name.toString() +
                "</span>";
            } else {
              content +=
                '<span style="color: black"> Student name: Annonymously </span>';
            }
            content += "</div> </div>";
            let mainOptions = {
              from: "1640 System",
              to: dean_emails,
              subject:
                "New submitted article " +
                Math.round(Math.random() * 10000).toString(),
              text: "abc",
              html: content,
            };

            transporter.sendMail(mainOptions, function (err, info) {
              if (err) console.error("Error: ", err);
              else console.log("Message sent: ", info.response);
            });
            newIdea = newIdea.save();
            console.log("New Directory created successfully !!");
          }
        });
        res.render("student/addFileToIdea", {
          idEvent: idEvent,
          path: path,
          loginName: req.session.email,
        });
      } else {
        console.log("Given Directory already exists !!");
        count += 1;
        path = path + "_(" + count + ")";
        req.body.name = req.body.name + "_(" + count + ")";
        loop();
      }
    });
  }

  await loop();
};

exports.doAddFile = async (req, res) => {
  let id = req.body.idEvent;
  res.redirect("viewEventDetail?id=" + id);
};

exports.searchEvent = async (req, res) => {
  const searchText = req.body.keyword;
  let listEvent;
  let checkEmpty = validation.checkEmpty(searchText);
  const searchCondition = new RegExp(searchText, "i");

  if (!checkEmpty) {
    res.redirect("/student/viewSubmittedIdeas");
  } else {
    listEvent = await event.find({ name: searchCondition });
  }
  res.render("student/viewSubmittedIdeas", {
    listEvent: listEvent,
    loginName: req.session.email,
  });
};

exports.viewSubmittedIdeas = async (req, res) => {
  let listEvent = await event.find();
  res.render("student/viewSubmittedIdeas", {
    listEvent: listEvent,
    loginName: req.session.email,
  });
};

exports.viewEventDetail = async (req, res) => {
  const student = await Student.findOne({ email: req.session.email });
  let id;
  let ideaID = student._id;
  let noPage;
  let page = 1;
  let sortBy = req.query.sort;
  if ((req.body, noPage != undefined)) {
    page = req.body.noPage;
  }
  if (req.query.id === undefined) {
    id = req.body.idEvent;
    sortBy = req.body.sortBy;
  } else {
    id = req.query.id;
  }
  if (sortBy === undefined) {
    req.session.sort = req.body.sortBy;
  }

  let listFiles = [];
  try {
    let listIdeas = await idea
      .find({ author: ideaID })
      .populate({ path: "comments", populate: { path: "author" } })
      .populate("author");

    let aEvent = await event.findById(id);
    let tempDate = new Date();
    let compare = tempDate > aEvent.dateEnd;
    const fs = require("fs");
    var counter = 0;
    function callBack() {
      if (listIdeas.length === counter) {
        if (sortBy === "comment") {
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
          console.log("comment");
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
          console.log("time");
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
        res.render("student/viewEventDetail", {
          idEvent: id,
          listFiles: listFiles,
          compare: compare,
          noPage: noPage,
          loginName: req.session.email,
        });
      }
    }
    console.log(listIdeas);
    if (listIdeas.length != 0) {
      listIdeas.forEach(async (i) => {
        fs.readdir(i.url, (err, files) => {
          listFiles.push({
            value: files,
            linkValue: i.url.slice(7),
            idea: i,
          });
          counter = counter + 1;
          callBack();
        });
      });
    } else {
      res.render("student/viewEventDetail", {
        idEvent: id,
        listFiles: listFiles,
        compare: compare,
        sortBy: sortBy,
        noPage: noPage,
        page: page,
        loginName: req.session.email,
      });
    }
  } catch (e) {
    console.log(e);
    let compare = false;
    res.render("student/viewEventDetail", {
      idEvent: id,
      listFiles: listFiles,
      compare: compare,
      loginName: req.session.email,
    });
  }
};

exports.doComment = async (req, res) => {
  let id = req.body.idEvent;
  let aIdea = await idea.findById(req.body.idIdea);
  let aStudent = await Student.findOne({ email: req.session.email });
  let aEvent = await event.findById(id);
  let allStudents = await Student.find();
  let studentEmails = [];
  for (let student of allStudents) {
    if (student.email != aStudent.email) studentEmails.push(student.email);
  }
  console.log(studentEmails);
  let checkAnnonymously = false;
  if (req.body.annonymously != undefined) {
    checkAnnonymously = true;
    newComment = new comment({
      ideaID: aIdea,
      author: aStudent,
      comment: req.body.comment,
      annonymously: true,
    });
  } else {
    newComment = new comment({
      ideaID: req.body.idIdea,
      author: aStudent,
      comment: req.body.comment,
    });
  }

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "tempstudent1123@gmail.com",
      pass: "neymar9701",
    },
    tls: { rejectUnauthorized: false },
  });

  let content = "";
  content += `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">    
    `;
  content +=
    '<h4 style="color: #0085ff"> From: ' +
    aStudent.email.toString() +
    "</h4> <hr>";
  content +=
    '<span style="color: black"> Event name: ' +
    aEvent.name.toString() +
    "</span><br>";
  content +=
    '<span style="color: black"> Comment to Idea: ' +
    aIdea.name.toString() +
    "</span><br>";
  content +=
    '<span style="color: black"> Comment: ' +
    req.body.comment.toString() +
    "</span><br>";
  if (!checkAnnonymously) {
    content +=
      '<span style="color: black"> Student name: ' +
      aStudent.name.toString() +
      "</span>";
  } else {
    content += '<span style="color: black"> Student name: Annonymously </span>';
  }

  content += "</div> </div>";
  let mainOptions = {
    from: "tempstudent1123@gmail.com",
    to: studentEmails,
    subject:
      "New submitted idea" + Math.round(Math.random() * 10000).toString(),
    text: "abc",
    html: content,
  };

  transporter.sendMail(mainOptions, function (err, info) {
    if (err) {
      console.error(err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });

  let tempDate = new Date();
  let compare = tempDate > aEvent.dateEnd;
  if (compare) {
    console.log("Final closure date had ended");
    res.redirect("../viewEventDetail?id=" + id);
  } else {
    newComment = await newComment.save();
    aIdea.comments.push(newComment);
    aIdea = await aIdea.save();
    //console.log(newComment.comment);
    res.redirect("../viewEventDetail?id=" + id);
  }
};

exports.paginations = async (req, res) => {
  const pageSize = 5;
  var page = req.query.page;
  if (page) {
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    skip = (page - 1) * pageSize;
    let listEvent = await event
      .find({})
      .skip(skip)
      .limit(pageSize)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.status(500).json("loi");
      });
    res.render("student/testPagination", {
      listEvent: listEvent,
      loginName: req.session.email,
    });
  } else {
    let listEvent = await event.find({});
    res.render("student/testPagination", {
      listEvent: listEvent,
      loginName: req.session.email,
    });
  }
};

exports.changePassword = async (req, res) => {
  res.render("student/changePassword", { loginName: req.session.email });
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
      res.render("student/changePassword", {
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
          res.redirect("/student");
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
};
