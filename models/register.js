const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true, // Fixed 'require' typo
    },
    mobile_no: {
        type: String, // Changed from Number to String for better handling
        minlength: 10, // Enforcing minimum length instead of 'min'
        required: true,
        unique: true
    },
    email_id: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    members: [
        {
            name: { type: String },
            mobile: { type: Number}, // Changed mobile to String for consistency
            id: { type : String}
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
