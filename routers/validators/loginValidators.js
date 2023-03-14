const { check } = require('express-validator')
module.exports = [
    check('username')
    .isEmail().withMessage('Phải là 1 email'),
    check('pswd')
    .notEmpty().withMessage('Không được để trống mật khẩu')

]