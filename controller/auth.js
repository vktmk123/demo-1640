const Account = require("../models/user");
const bcrypt = require("bcryptjs");

exports.handleLogin = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // console.log(bcrypt
  //     .hash('123456789', 10)
  //     .then(hash => {
  //       console.log('Hash ', hash)
  //     })
  //     .catch(err => console.error(err.message)));

  // console.log(username)
  try {
    let user = await Account.findOne({ email: username });
    // console.log(user)
    await bcrypt.compare(password, user.password).then((doMatch) => {
      if (doMatch) {
        // console.log(user)
        if (user.role == "admin") {
          req.session.user = user;
          req.session.email = username;
          req.session.admin = true;
          res.redirect("/admin");
        } else if (user.role == "Student") {
          req.session.user = user;
          req.session.email = username;
          req.session.student = true;
          res.redirect("/student");
        } else if (user.role == "Manager") {
          req.session.user = user;
          req.session.email = username;
          req.session.manager = true;
          res.redirect("/manager_index");
        } 
        else if (user.role == "Guest") {
          req.session.user = user;
          req.session.email = username;
          req.session.manager = true;
          res.redirect("/guest");
        }else {
          req.session.user = user;
          req.session.email = username;
          req.session.QAcoordinator = true;
          res.redirect("/dean");
        }
      } else {
        return res.render("index", {
          errors: "Username or password is incorrect",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.render("index", { errors: "Username or password is incorrect" });
  }
};

exports.handleLogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
