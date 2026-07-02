const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

router.post(

    "/create",

    upload.fields([

        {
            name: "thumbnail",
            maxCount: 1
        },

        {
            name: "screenshots",
            maxCount: 10
        },

        {
            name: "projectZip",
            maxCount: 1
        },

        {
            name: "documentation",
            maxCount: 1
        }

    ]),

    (req, res) => {

        console.log(req.body);

        console.log(req.files);

        res.send("Upload Success 🚀");

    }

);

module.exports = router;