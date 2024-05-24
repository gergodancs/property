import * as path from "node:path";
import * as fs from "node:fs";
import multer = require("multer");


const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({storage});

export const parsePictures = (files: Express.Multer.File[]) => {
    return files.map(file => ({
        url: `/uploads/${file.filename}`,
        description: file.originalname
    }));
};
