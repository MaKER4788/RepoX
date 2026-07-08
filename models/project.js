const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    title:{
        type:String,
        required:true
    },

    shortDescription:String,

    description:String,

    category:String,

    techStack:[String],

    tags:[String],

    thumbnail:String,

    screenshots:[String],

    zipFile:String,

    documentation:String,

    demoVideo:String,

    liveDemo:String,

    github:String,

    supportEmail:String,

    price:{
        type:Number,
        default:0
    },

    discount:{
        type:Number,
        default:0
    },

    license:String,

    support:String,

    version:String,

    lastUpdated:Date,

    changelog:String,

    published:{
        type:Boolean,
        default:false
    },

    createdAt:{
        type:Date,
        default:Date.now
    },
    features: String,

    installation: String,

    requirements: String,

    included: String,

    refundPolicy: String,

    refundPolicy: String,
features: String,
installation: String,
requirements: String,
included: String,
reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "review"
}],
});


module.exports = mongoose.model("Project",projectSchema);