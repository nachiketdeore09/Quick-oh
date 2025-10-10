import multer from "multer";

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, "./public/temp")
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    }
)

// add a fileFilter function that will check if the files type is image or not

export const upload = multer(
    { storage }
)