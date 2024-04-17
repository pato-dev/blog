const multer = require('multer');
const path = require('path')

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, '../frontend/src/uploads/postImages')
    },
    filename: (req, file, cb) => {
        const originalName = encodeURIComponent(path.parse(file.originalname).name).replace(/[^a-zA-Z0-9]/g, '')
        let ext = path.extname(file.originalname).toLocaleLowerCase()
        cb(null, originalName + '_' + Date.now() + ext);
    },
});

module.exports = uploadArticle = multer({
    storage: Storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1Mb
    fileFilter(req, file, cb) {
        if (!file.mimetype.includes('image')) {
            return cb('Invalid image format!', false)
        }
        cb(null, true);
    },
})