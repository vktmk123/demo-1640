const mongoose = require('../db/db');

const event = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    description: { 
        type: String,
        required: true
    },
    dateStart:{
        type: Date,
        required: true
    },
    dateEnd:{
        type: Date,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('event', event);