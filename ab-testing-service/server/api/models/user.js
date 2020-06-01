const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName : { type : String },
    lastName : { type : String },
    timeZone : { type : String },
    locale : { type : String },
    gender : { type : String },
    profilePic : { type : String },
    username : { type : String , required : true},
    password : { type : String , require : true},
    pointsEarned : { type : Number },
    badge : { type : String },
    email : { type : String},
    bio : { type : String }, 
    website : { type : String },
    organisation : { type : String },
    founderSkills : [{type : String}],
    founderGoal : { type : String},
    founderRole : { type : String},
    creativityScore : { type : Number },
    founderConnections  : [{type : String}],
    bigFivePersonalityScores : {
        Extraversion : Number,
        Agreeableness : Number,
        Conscientiousness : Number,
        Neuroticism : Number,
        Openness : Number
    },
    entrepreneurEfficacyScores : {
        Marketing : Number,
        Innovation : Number,
        Management : Number,
        Risktaking : Number,
        Financialcontrol : Number
    }
});

module.exports = mongoose.model("User", UserSchema);
