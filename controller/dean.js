const idea = require('../models/ideas');
const comment = require('../models/comments');
const Coordinator = require('../models/Coordinator');
const event = require("../models/event");
const fs = require("fs");
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const Dean = require('../models/Coordinator');

const nodemailer = require('nodemailer'); // Import nodemailer


exports.getDean = async (req, res) => {
    const existedDean = await Dean.find({email: req.session.email});
    if (req.session.email === undefined || existedDean.length==0) {
        res.redirect('/');
    } else {
        res.render('dean/index', { loginName: req.session.email });
    }

}

// ======================== View Change Password ========================== //
exports.changePassword = async (req, res) => {
    const existedDean = await Dean.find({email: req.session.email});
    if (req.session.email === undefined || existedDean.length==0) {
        res.redirect('/');
    } else {
        res.render('dean/changePassword', { loginName: req.session.email });
    }
}

// ======================== Change Password ========================== //
exports.doChangePassword = async (req, res) => {
    const existedDean = await Dean.find({email: req.session.email});
    if (req.session.email === undefined || existedDean.length==0) {
        res.redirect('/');
    } else {
        let user = await Account.findOne({ email: req.session.email });
        let current = req.body.current;
        let newpw = req.body.new;
        let confirm = req.body.confirm;
        let errors = {};
        let flag = true;
        console.log(1);
        try {
            await bcrypt.compare(current, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        if (newpw.length < 8) {
                            flag = false;
                            Object.assign(errors, { length: "Password must contain 8 characters or more!" });
                        }
                        else if (newpw != confirm) {
                            flag = false;
                            Object.assign(errors, { check: "New Password and Confirm Password do not match!" });
                        }
                    }
                    else {
                        flag = false;
                        Object.assign(errors, { current: "Old password is incorrect!" });
                    }
                });
            if (!flag) {
                res.render('dean/changePassword', { errors: errors, loginName: req.session.email })
            }
            else {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpw, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user = user.save();
                        req.session.user = user;
                        res.redirect('/dean')
                    })
                })

            }
        } catch (err) {
            console.log(err);
        }
    }
}

// ======================== Most Comments in Idea ========================== //
exports.viewMostComments = async (req, res) => {
  const existedDean = await Dean.find({email: req.session.email});
  if (req.session.email === undefined || existedDean.length==0) {
      res.redirect('/');
  } else {
      try {
          let listIdeas = await idea.find().populate('comments');
          let n_ideas = listIdeas.length;
          let distance5_ideas = [];
          let temp_len_ideas = n_ideas;
          let k = 1;
          while (temp_len_ideas > 5) {
              distance5_ideas.push(5 * k);
              k++;
              temp_len_ideas -= 5;
          }
          if (k > 1) {
              distance5_ideas.push(distance5_ideas[k - 2] + temp_len_ideas);
          }
          let default_ideas = 5;
          if (n_ideas < default_ideas) default_ideas = n_ideas;
          // check if idea was added
          let visited_max = [];
          for (let m = 0; m < n_ideas; m++) {
              visited_max.push(0);
          }
          // count total 'view = like+dis_like+comment'
          let countViews = [];
          for (let idea of listIdeas) {
              countViews.push(idea.comments.length);
          }
          let topViews = [];
          let i = 0;
          while (i < default_ideas) {
              let fake_max = -1;
              let idx_max = -1;
              let j = 0;
              while (j < n_ideas) {
                  if (visited_max[j] == 0 && countViews[j] >= fake_max) {
                      fake_max = countViews[j];
                      idx_max = j;
                  }
                  j++;
              }
              visited_max[idx_max] = 1;
              topViews.push(listIdeas[idx_max]);
              i++;
          }
          let mostViewedIdeas = [];
          let counter = 0;
          function callBack() {
              if (topViews.length === counter) {
                  mostViewedIdeas.sort((a, b) => {
                      let A = a.comment;
                      let B = b.comment;
                      if (A < B) {
                          return 1;
                      }
                      else if (A > B) {
                          return -1;
                      }
                      else {
                          if (a._id < b._id) {
                              return -1;
                          }
                          if (a._id > b._id) {
                              return 1;
                          }
                      };
                  });
              }
          }
          for (let j = 0; j < topViews.length; j++) {
              let i = topViews[j];
              fs.readdir(i.url, (err, files) => {
                  mostViewedIdeas.push({
                      idea: i,
                      id: i._id,
                      value: files,
                      linkValue: i.url.slice(7),
                      name: i.name,
                      comment: i.comments.length,
                      idEvent: i.eventID,
                  });
                  counter += 1;
                  callBack();
              });

          };
          res.render('dean/mostComments', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
      } catch (e) {
          console.error(e);
          res.render('dean/mostComments', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
      }
  }
}



//comment
exports.doComment = async (req, res) => {                                                                            
    let aIdea = await idea.findById(req.body.idIdea);
    let aQac = await Coordinator.findOne({ email: req.session.email });
    let allQacs = await Coordinator.find();
    let deanEmails = [];
    for (let dean of allQacs) {
      if (dean.email != aQac.email) deanEmails.push(dean.email);
    }

    newComment = new comment({
      ideaID: req.body.idIdea,
      author: aQac,
      comment: req.body.comment,
    });
  
     console.log(deanEmails);
      newComment = await newComment.save();
      aIdea.comments.push(newComment);
      aIdea = await aIdea.save();
      res.redirect("/dean/viewMostComments");
    
  };







