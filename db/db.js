const mongoose = require('mongoose');

try 
{
    const client = mongoose.connect('mongodb+srv://patheonmk:saELQNxFaNBNGyWy@cluster0.0n3rej0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        // useFindAndModify: true
    })
    
    console.log("connected")
} catch (e) {
    console.log("loi roi")
    console.log(e)
}


module.exports = mongoose