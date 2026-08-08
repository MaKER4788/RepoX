const multer = require("multer");

const fileFilter = (req, file, cb) => {

    if (file.fieldname === "thumbnail" ||
        file.fieldname === "screenshots") {

        if (file.mimetype.startsWith("image/")) {
            return cb(null, true);
        }

        return cb(new Error("Only images allowed"));
    }

    if (file.fieldname === "projectZip") {

        if (
            file.originalname.endsWith(".zip") ||
            file.originalname.endsWith(".rar") ||
            file.originalname.endsWith(".7z")
        ) {

            return cb(null, true);

        }

        return cb(new Error("Upload ZIP/RAR/7z only"));

    }

    if (file.fieldname === "documentation") {

        if (file.mimetype === "application/pdf") {

            return cb(null, true);

        }

        return cb(new Error("Only PDF allowed"));

    }

    cb(null, true);

};

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {

        fileSize: 200 * 1024 * 1024

    },

    fileFilter

});

module.exports = upload;