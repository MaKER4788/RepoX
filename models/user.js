const mongoose = require("mongoose");
const { default: passportLocalMongoose } = require("passport-local-mongoose");



mongoose.connect("mongodb://127.0.0.1:27017/resting");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    age: Number,
    username: {
        type: String,
        required: true,
    }
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);