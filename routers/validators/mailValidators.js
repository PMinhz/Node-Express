const { check } = require('express-validator')
module.exports = [
    check('EoP')
    .isEmail().withMessage('Phải là định dạng email')
]