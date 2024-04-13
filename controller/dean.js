const idea = require('../models/ideas');
const comment = require('../models/comments');
const Coordinator = require('../models/Coordinator');
const event = require("../models/event");
const fs = require("fs");
const Student = require("../models/student");
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const Dean = require('../models/Coordinator');

const nodemailer = require('nodemailer'); // Import nodemailer
const comments = require('../models/comments');


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
exports.viewIdea = async (req, res) => {
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
              });

          };
          res.render('dean/viewIdea', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
      } catch (e) {
          console.error(e);
          res.render('dean/viewIdea', { distance5_ideas: distance5_ideas, mostViewedIdeas: mostViewedIdeas, loginName: req.session.email });
      }
  }
}


//comment
exports.doComment = async (req, res) => {                                                                            
    let aIdea = await idea.findById(req.body.idIdea);
    let aDean = await Coordinator.findOne({ email: req.session.email });
    let idIdea = aIdea._id;
    let studenId = aIdea.author;
    let aStudent = await Student.findById(studenId);
    let std_email = aStudent.email;

    newComment = new comment({
      ideaID: req.body.idIdea,
      author: aDean,
      comment: req.body.comment,
    });
     console.log(std_email);
      newComment = await newComment.save();
      aIdea.comments.push(newComment);
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
              '<h4 style="color: #0085ff"> New Feedback </h4> <hr>';
            content +=
            '<span style="color: black"> Idea name: ' +
              aIdea.name.toString() +
              "</span><br>"; 
            content +=
            '<span style="color: black"> Content: ' +
              newComment.comment.toString() +
              "</span><br>"; 
            content += "</div> </div>";
            let mainOptions = {
                from: "1640 System",
                to: std_email,
                subject:
                  "New feedback " +
                  Math.round(Math.random() * 10000).toString(),
                text: "abc",
                html: content,
              };
  
              transporter.sendMail(mainOptions, function (err, info) {
                if (err) console.error("Error: ", err);
                else console.log("Message sent: ", info.response);
              });
      aIdea = await aIdea.save();
      res.redirect("/dean/viewIdea");
    
  };

    exports.viewIdeaByFaculty = async (req, res) => {
        const existedDean = await Dean.find({ email: req.session.email });
        if (req.session.email === undefined || existedDean.length == 0) {
            res.redirect('/');
        } else {
            const facultyID = existedDean[0].faculty;
            const page = req.query.page || 1;
            const perPage = 5;
            try {
                const totalIdeas = await idea.countDocuments({ facultyID: facultyID });
                const ideas = await idea.find({ facultyID: facultyID })
                    .skip((perPage * page) - perPage)
                    .limit(perPage);

                const paginateIdeas = paginate(ideas, totalIdeas, perPage, page);

                res.render('dean/viewIdeaByFaculty', {
                    ideas: paginateIdeas.docs,
                    currentPage: paginateIdeas.currentPage,
                    hasNextPage: paginateIdeas.hasNextPage,
                    hasPreviousPage: paginateIdeas.hasPreviousPage,
                    nextPage: paginateIdeas.nextPage,
                    previousPage: paginateIdeas.previousPage,
                    totalItems: totalIdeas,
                    totalPages: paginateIdeas.totalPages,
                    loginName: req.session.email,
                });
            } catch (error) {
                console.error(error);
                res.redirect('/');
            }
        }
    }

exports.selectIdeaToPublish = async (req, res) => {
    const existedDean = await Dean.find({ email: req.session.email });
    if (req.session.email === undefined || existedDean.length == 0) {
        res.redirect('/');
    } else {
        const facultyID = existedDean[0].faculty;
        const ideaID = req.body.ideaID;
        const ideas = await idea.findByIdAndUpdate({_id: ideaID, facultyID: facultyID}, {approve: true});
        res.redirect('/dean/viewIdeaByFaculty');
    }
}

exports.viewIdeaPublished = async (req, res) => {
    const existedDean = await Dean.find({ email: req.session.email });
    if (req.session.email === undefined || existedDean.length == 0) {
        res.redirect('/');
    } else {
        const facultyID = existedDean[0].faculty;
        const page = req.query.page || 1;
        const perPage = 5;
        const totalIdeas = await idea.countDocuments({ approve: true, facultyID: facultyID });
        const ideas = await idea.find({ approve: true, facultyID: facultyID })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec();
        const paginateIdeas = paginate(ideas, totalIdeas, perPage, page);
        res.render('dean/viewIdeaPublished', {
            ideas: paginateIdeas.docs, currentPage: paginateIdeas.currentPage,
            hasNextPage: paginateIdeas.hasNextPage, hasPreviousPage: paginateIdeas.hasPreviousPage,
            nextPage: paginateIdeas.nextPage, previousPage: paginateIdeas.previousPage,
            totalItems: totalIdeas, totalPages: paginateIdeas.totalPages,
            loginName: req.session.email
        });
    }
}

const paginate = (items, totalItems, perPage, page) => {
    const totalPages = Math.ceil(totalItems / perPage);
    return {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        itemsPerPage: perPage,
        docs: items
    };
}






