const mongoose = require('../db/db');

const ideas = new mongoose.Schema({
    eventID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'event',
        require : true
    }, 
    facultyID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'faculty',
        require : true
    },
    approve:{
        type: Boolean,
        require : true,
        default: false
    },
    name: { 
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student',
        require : true
    },
    time:{
        type: Date,
        default: Date.now()
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'comments'
    }],
    annonymously: {
        type: Boolean,
        require : true,
        default: false
    },
});

module.exports = mongoose.model('ideas', ideas);
