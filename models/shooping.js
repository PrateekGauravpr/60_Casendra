const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shooping_schema = new Schema({

    item : {
        type : String,
        default:"task1"
    },

    scheduled : {
        type : Date,

    },
    category : {
        type : String,
        default : "Others"

    },
    createdby : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "register"
    },
    statu : {
        type : String,
        default : "Open"
    },
    date_new : {
        type : String
    }

})

const item = mongoose.model("item", shooping_schema)
module.exports = item;