const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    name : {
        type : String,
        require: true,
    },
    mobile_no : {
        type : Number,
        min : 10,
        required : true,
    },
    email_id : {
        type : String,
    },
    username : {
        type : String,
        required : true,
        unique : true
    }
    
});
userSchema.plugin(passportLocalMongoose);

const user = mongoose.model("user", userSchema)


module.exports = user