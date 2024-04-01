const mongoose = require('mongoose');

const faculty = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    }
});

module.exports = mongoose.model('faculty', faculty);