"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    timestamp : { type : Date },
    meta : {
        nature : { type : String },
		userId : { type : String },
		convo : { type : Boolean}
    },
    message : { type : String },
    level : { type : String },
})


module.exports = mongoose.model("Log", LogSchema);
