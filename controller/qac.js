const idea = require('../models/ideas');
const comment = require('../models/comments');
const student = require('../models/student');
const fs = require("fs");
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const QAC = require('../models/QAcoordinator');


exports.getQAC = async (req, res) => {
    const existedQAC = await QAC.find({email: req.session.email});
    if (req.session.email === undefined || existedQAC.length==0) {
        res.redirect('/');
    } else {
        res.render('qac/index', { loginName: req.session.email });
    }

}

// ======================== View Change Password ========================== //
exports.changePassword = async (req, res) => {
    const existedQAC = await QAC.find({email: req.session.email});
    if (req.session.email === undefined || existedQAC.length==0) {
        res.redirect('/');
    } else {
        res.render('qac/changePassword', { loginName: req.session.email });
    }
}

// ======================== Change Password ========================== //
exports.doChangePassword = async (req, res) => {
    const existedQAC = await QAC.find({email: req.session.email});
    if (req.session.email === undefined || existedQAC.length==0) {
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
                res.render('qac/changePassword', { errors: errors, loginName: req.session.email })
            }
            else {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpw, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user = user.save();
                        req.session.user = user;
                        res.redirect('/qac')
                    })
                })

            }
        } catch (err) {
            console.log(err);
        }
    }
}

// ======================== View Lastest Comments ========================== //
exports.viewLastestComment = async (req, res) => {
    const existedQAC = await QAC.find({email: req.session.email});
    if (req.session.email === undefined || existedQAC.length==0) {
        res.redirect('/');
    } else {
        try {
            let listComments = await comment.find();
            let len_comments = listComments.length;
            let distance5_comments = [];
            let temp_len_comments = len_comments;
            let k = 1;
            while (temp_len_comments > 5) {
                distance5_comments.push(5 * k);
                k++;
                temp_len_comments -= 5;
            }
            if (k > 1) {
                distance5_comments.push(distance5_comments[k - 2] + temp_len_comments);
            }
            let last_comments = [];
            if (len_comments == 0) {
                last_comments = [];
            }
            else if (len_comments < 5) {
                last_comments = listComments.reverse();
            }
            else {
                last_comments = listComments.slice(-5, len_comments).reverse();
            }
            let lastComments_detail = [];
            let counter = 0;
            function callBack() {
                if (last_comments.length === counter) {
                    lastComments_detail.sort((a, b) => {
                        const A = new Date(a.time)
                        const B = new Date(b.time)
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
            for (let comment of last_comments) {
                let objIdea = await idea.findOne({ _id: comment.ideaID });
                let objAuthor = await student.findOne({ _id: comment.author });
                if (objIdea === null || objAuthor === null) {
                    if (objIdea === null)
                        console.log('Idea lost: ', comment.ideaID);
                    else if (objAuthor === null)
                        console.log('Author lost: ', comment.author);
                    continue;
                }
                fs.readdir(objIdea.url, (err, files) => {
                    lastComments_detail.push({
                        idea: objIdea,
                        value: files,
                        linkValue: objIdea.url.slice(7),
                        name: objIdea.name,
                        comment_len: objIdea.comments.length,
                        comment_content: comment.comment,
                        n_likes: objIdea.like,
                        n_dislikes: objIdea.dislike,
                        author: objAuthor,
                        time: comment.time.toString().slice(0, -25)
                    });
                    counter += 1;
                    callBack();
                });
            }
            res.render('qac/viewLastestComment', { distance5_comments: distance5_comments, lastComments_detail: lastComments_detail, loginName: req.session.email });
        }
        catch (err) {
            console.log(err);
            res.render('qac/viewLastestComment', { distance5_comments: distance5_comments, lastComments_detail: lastComments_detail, loginName: req.session.email });
        }
    }
}




