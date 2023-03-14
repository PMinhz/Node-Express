const { check } = require('express-validator')

module.exports = [
    check('soThe')
    .exists()
    .withMessage('Vui lòng cung cấp số thẻ')
    .notEmpty()
    .withMessage('Số thẻ không được để trống')
    .isInt()
    .withMessage('Số thẻ phải là số')
    .isLength({ min: 6, max: 6 })
    .withMessage('Số thẻ phải có 6 chữ số'),

    check('ngayHetHan')
    .exists()
    .withMessage('Vui lòng cung cấp ngày hết hạn')
    .notEmpty()
    .withMessage('Ngày hết hạn không được để trống')
    .isDate()
    .withMessage('Vui lòng nhập ngày hợp lệ'),

    check('maCVV')
    .exists()
    .withMessage('Vui lòng cung cấp mã CVV')
    .notEmpty()
    .withMessage('Mã CVV không được để trống')
    .isInt()
    .withMessage('Mã CVV phải là số')
    .isLength({ min: 3, max: 3 })
    .withMessage('Mã CVV phải có 3 chữ số'),

]