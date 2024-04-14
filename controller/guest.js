const idea = require('../models/ideas');
const Guest = require('../models/guest');
const fs = require('fs');

exports.getGuest = async (req, res) => {
    const existedGuest = await Guest.find({ email: req.session.email });
    if (req.session.email === undefined || existedGuest.length == 0) {
        res.redirect('/');
    } else {
        res.render('guest/index', { loginName: req.session.email });
    }

}

exports.viewIdeaPublished = async (req, res) => {
    const existedQAC = await Guest.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        const facultyID = existedQAC[0].faculty;
        const page = req.query.page || 1;
        const perPage = 5;
        const totalIdeas = await idea.countDocuments({ approve: true, facultyID: facultyID });
        const ideas = await idea.find({ approve: true, facultyID: facultyID })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec();
        const paginateIdeas = paginate(ideas, totalIdeas, perPage, page);

        let listIdeas = [];
        let counter = 0;
        // Iterate over the paginated ideas and asynchronously read files
        for (let i = 0; i < paginateIdeas.docs.length; i++) {
            const idea = paginateIdeas.docs[i];
            fs.readdir(idea.url, (err, files) => {
                listIdeas.push({
                    idea: idea,
                    id: idea._id,
                    value: files,
                    linkValue: idea.url.slice(7),
                    name: idea.name,
                    comment: idea.comments.length,
                    idEvent: idea.eventID,
                    approve: idea.approve
                });
                counter += 1;   
            });
        }

        res.render('guest/viewIdeaPublished', {
            ideas: listIdeas,
             currentPage: paginateIdeas.currentPage,
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