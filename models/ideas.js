const mongoose = require('../db/db');

const ideas = new mongoose.Schema({
    eventID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'event',
        require : true
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
    like: { 
        type: Number,
        required: true
    },
    dislike:{
        type: Number,
        required: true
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
