const { check } = require('express-validator')
module.exports = [
    check('pswd1')
    .isLength({ min: 6, max: 15 }).withMessage('Mật khẩu phải có 6 kí tự tối đa 15'),
    check('pswd2')
    .isLength({ min: 6, max: 15 }).withMessage('Mật khẩu phải có 6 kí tự tối đa 15')
]