const { check } = require('express-validator')
module.exports = [
    check('email')
    .isEmail().withMessage('Đúng định dạng email'),
    check('code')
    .matches(/^[0-9.,]+$/).withMessage('Code chỉ là số'),
    check('pswd1')
    .isLength({ min: 6, max: 15 }).withMessage('Mật khẩu phải có 6 kí tự tối đa 15'),
    check('pswd2')
    .isLength({ min: 6, max: 15 }).withMessage('Mật khẩu phải có 6 kí tự tối đa 15')
]