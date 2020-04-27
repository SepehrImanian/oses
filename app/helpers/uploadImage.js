const multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs');

const getDirImage = () => {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDay();
    return `./public/uploads/images/${year}/${month}/${day}`;
}

const ImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = getDirImage();
        mkdirp(dir).then(made => cb(null, dir));
    },
    filename: (req, file, cb) => {
        let filePath = getDirImage() + '/' + file.originalname;
        if(!fs.existsSync(filePath)) {
            cb(null, file.originalname);
        } else {
            cb(null, Date.now() + '-' + file.originalname);
        }
        
    }
});

const uploadImage = multer({
    storage: ImageStorage,
    limits: {
        fileSize: 1024 * 1024 * 20
    }
});

module.exports = uploadImage;