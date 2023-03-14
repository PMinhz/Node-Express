const req = require("express/lib/request");
const multer = require("multer");
var path = require("path");
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        var id = Date.now() + path.extname(file.originalname)
        if (file.fieldname == 'frontID') {
            console.log('are you working')
            req.session.front = id
        }
        if (file.fieldname == 'backID')
            req.session.back = id


        cb(null, id)
    },

});


const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //If the file uploaded is not any of this file type

        // If error in file type, then attacch this error to the request header
        req.fileValidationError = "You can upload only image files";
        return cb(null, false, req.fileValidationError);
    }
    cb(null, true)
};

//Here we configure what our storage and filefilter will be, which is the storage and imageFileFilter we created above
exports.upload = multer({ storage: storage, fileFilter: imageFileFilter })