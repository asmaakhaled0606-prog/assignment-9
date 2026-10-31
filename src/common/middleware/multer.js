import multer from "multer";
import { randomUUID } from "crypto";
import fs from "fs";

export const multerLocal = ( customPath = "General", customTypes = [] = {}) => {
    const pathFolder = `uploads/${customPath}`
    if (!fs.existsSync(pathFolder)) {
        fs.mkdirSync(pathFolder, { recursive: true })
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("file before", file)
            cb(null, pathFolder)
        },
        filename: (req, file, cb) => {
            cb(null, `${randomUUID()}_${file.originalname}`)
        }
    })

    function fileFilter(req, file, cb) {
        console.log({ file })
        if (!customTypes.includes(file.mimetype)) {
            cb(new Error("Invalid file!"))
        } else {
            cb(null, true)
        }
    }

    const upload = multer({ storage, fileFilter })
    return upload;
}