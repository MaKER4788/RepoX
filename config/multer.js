const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create folder if not exists
const createFolder = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
};

createFolder("uploads/thumbnails");
createFolder("uploads/screenshots");
createFolder("uploads/zips");
createFolder("uploads/docs");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "thumbnail") {
            cb(null, "uploads/thumbnails");
        }

        else if (file.fieldname === "screenshots") {
            cb(null, "uploads/screenshots");
        }

        else if (file.fieldname === "projectZip") {
            cb(null, "uploads/zips");
        }

        else if (file.fieldname === "documentation") {
            cb(null, "uploads/docs");
        }

    },

    filename: function (req, file, cb) {

        const unique =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            unique + path.extname(file.originalname)
        );

    }

});

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

    storage,

    limits: {

        fileSize: 200 * 1024 * 1024

    },

    fileFilter

});

module.exports = upload;