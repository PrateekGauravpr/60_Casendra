const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the task
const task_schema = new Schema({
    Task_Name: {
        type: String,
        required: true // fixed the typo
    },
    Description: {
        type: String, // fixed the typo (String instead of Sting)
    },
    Priority: {
        type: Boolean
    },
    TaskType: {
        Personal: {
            type: Boolean // fixed the typo (Boolean instead of Boolen)
        },
        Official: {
            type: Boolean // fixed the typo (Boolean instead of Boolen)
        }
    },
    Assigned_to: {
        type: String // fixed the typo (String instead of Sting)
    },
    Created_at: {
        type: Date, // fixed the typo (Date instead of date)
        default: Date.now
    },
    Status: {
        type: String,
        default: "Open" // fixed missing quotes around the default value
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "register"
    },
    TAT : {
        type : Date,
        default: Date.now 
    },
    comment : {
        type : String,
    },
    duration : {
        type : String
    },
    
    duration_months : {
        type : Number,
    }

});

// Create the model for the task
const Task = mongoose.model("task", task_schema);

module.exports = Task;
