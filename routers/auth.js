const express = require('express')
var bodyParser = require('body-parser');
const router = express.Router()
var bcrypt = require('bcrypt')
const path = require('path');
const { validationResult } = require('express-validator')
const req = require('express/lib/request');
var con = require('../lib/db.js')
var validator = require('../routers/validators/registerValidators');
var cPassvalidator = require('../routers/validators/change-passValidator');
var mailF = require('../routers/validators/mailValidators');
var cPassCodevalidator = require('../routers/validators/forgetChangePassValidators')
var nodemailer = require('nodemailer');
var randomstring = require('randomstring');
const session = require('express-session');
var Fpassvalidator = require('../routers/validators/FirstchangeValidator')
var Loginc = require('../routers/validators/loginValidators')
const multer = require('multer')
const { upload } = require("../lib/multer.js");
const { unlink } = require('fs');
var fs = require('fs');
var multiupload = upload.fields([{ name: 'frontID', maxCount: 5 }, { name: 'backID', maxCount: 5 }])
router.get('/logout', (req, res) => {
    if (req.session.name) {
        req.session.destroy()
        res.redirect('/')
    } else
        res.render('auth/login')
})
router.post('/logout', (req, res, next) => {

    if (!req.session.name) {
        res.redirect('auth/login')
    } else {
        res.render('auth/login')
        req.session.destroy();
    }
})

router.get('/login', (req, res) => {
    if (!(req.session.Doimk)) {

        if (req.session.name) {
            res.redirect('/')
        } else res.render('auth/login')
    } else res.render('auth/login')
})

router.post('/login', Loginc, (req, res) => {

    var email = req.body.username;
    var password = req.body.pswd;
    let result = validationResult(req)

    if (!(result.errors.length === 0)) {
        result = result.mapped()

        let message
        for (field in result) {
            message = result[field].msg
            break
        }

        const { username, password } = req.body

        req.flash('error', message)
        req.flash('username', email)
        req.flash('pswd', password)

        res.redirect('login')
    } else
    if (req.session.name) {

        res.redirect('/')
    } else {
        con.query('SELECT Chocapnhat,Password,Thoigiankhoa,Khoavinhvien,id,Doimk FROM User WHERE email = ?', [email], function(err, rows, fields) {
            if (err) throw err
            else {
                var a = rows[0]
                var time = new Date()

                if (rows.length <= 0) {

                    req.flash('error', 'Sai Email!')
                    res.redirect('/auth/login')
                } else if ((new Date() - a.Thoigiankhoa) < 60000) {
                    req.flash('error', 'Tài khoản đang bị khoá vui lòng thử lại sau 1 phút')
                    res.redirect('/auth/login')
                } else if (a.Chocapnhat == 2) {
                    req.flash('error', 'Tài khoản đang bị vô hiệu hoá')
                    res.redirect('/auth/login')
                } else if (a.Khoavinhvien == 1) {
                    req.flash('error', 'Tài khoản đã bị khoá vĩnh viễn vui lòngl liên hệ nhân viên để được hỗ trợ')
                    res.redirect('/auth/login')
                } else if (bcrypt.compareSync(password, a.Password)) {
                    if (a.Doimk == 0) {

                        req.session.Id = a.id;
                        req.session.Doimk = a.Doimk;

                        res.redirect('/auth/FirstchangePass')

                    } else {
                        req.session.loggedin = true;
                        req.session.name = email;
                        req.session.Id = a.id;
                        req.session.doimk = a.Doimk;


                        con.query('Update User Set Solansaipass = 0,Batthuong = 0 WHERE email = ?', [email], function(err, rows, fields) {
                            if (err) throw err
                            else
                                res.redirect('/')
                        })
                    }

                } else {
                    req.flash('error', 'Sai password!')
                    con.query('SELECT Solansaipass,Batthuong,IsAdmin FROM User WHERE email = ?', [email], function(err, rows) {
                        if (err) throw err
                        else {

                            var Checking = rows[0]
                            if ((Checking.Solansaipass + 1 == 3) && (Checking.Batthuong + 1 < 2) && !Checking.IsAdmin) {

                                con.query('Update User Set Solansaipass = 0,Batthuong = 1,Thoigiankhoa = ?,Update_at = ? WHERE email = ?', [time, time, email], function(err, rows, fields) {
                                    if (err) throw err
                                })
                            } else {
                                if ((Checking.Solansaipass + 1 == 3) && (Checking.Batthuong + 1 >= 2) && !Checking.IsAdmin) {

                                    con.query('Update User Set Solansaipass = 0,Batthuong = 0,Khoavinhvien = 1,Update_at = ? WHERE email = ?', [new Date(), email], function(err, rows, fields) {
                                        if (err) throw err
                                    })
                                }
                            }
                        }
                    })

                    con.query('Update User Set Solansaipass = Solansaipass + 1,Update_at = ? WHERE email = ?', [new Date(), email], function(err, rows, fields) {
                        if (err) throw err
                        else

                            res.redirect('/auth/login');
                    })
                }
            }
        })
    }
})



router.get('/register', (req, res) => {
        res.render('auth/register')

    })
    //dung session duoc gan ben multer
router.post('/register', multiupload, validator, (req, res, next) => {
    if (req.session.front)
        var front = req.session.front;
    else var front = 0
    if (req.session.back)
        var back = req.session.back;
    else back = 0

    var birthDate = req.body.birthday;
    birthDate = birthDate.toString().split('T')
    birthDate = birthDate.toString().split('-')
    birthDate = birthDate[0]
    var year = new Date()
    year = year.getFullYear()

    if (year - birthDate < 15) {
        req.flash('error', 'bạn phải hơn 15 tuổi')

        if (front)
            fs.unlinkSync('public/images/' + front)
        if (back)
            fs.unlinkSync('public/images/' + back)
        res.redirect('register')
    } else {
        let result = validationResult(req)

        if (!(result.errors.length === 0) || !back || !front) {
            result = result.mapped()

            let message
            for (field in result) {
                message = result[field].msg
                break
            }


            if (front)
                fs.unlinkSync('public/images/' + front)
            if (back)
                fs.unlinkSync('public/images/' + back)
            const { fullname, email, sdt, birthday, Diachi } = req
            if (!back)
                message = 'Chưa upload ảnh mặt sau cmnd'
            if (!front)
                message = 'Chưa upload ảnh mặt trước cmnd'
            req.flash('error', message)
            req.flash('fullname', fullname)
            req.flash('email', email)
            req.flash('phone', sdt)
            req.flash('birthday', birthday)
            req.flash('address', Diachi)
            res.redirect('register')
        } else {

            fullname = req.body.fullname
            email = req.body.email
            sdt = req.body.phone
            username = randomstring.generate({
                length: 10,
                charset: '0123456789'
            });

            Ns = req.body.birthday
            Diachi = req.body.address
            password = randomstring.generate({
                length: 6
            });
            con.query("select Sdt,Email from User where Sdt = ? or Email = ?", [sdt, email], (error, results, fields) => {
                if (error) {
                    throw (error)
                } else if (results.length > 0) {
                    req.flash('error', 'Trùng Email hoặc số điện thoại')
                    if (front)
                        fs.unlinkSync('public/images/' + front)
                    if (back)
                        fs.unlinkSync('public/images/' + back)
                } else {


                    const encryptP = bcrypt.hashSync(password, 5)
                    var quer = "INSERT INTO User (username,sdt,email,password,Ten,Sinhnhat,Diachi,Created_at,Update_at,Mtruoccmnd,Msaucmnd) VALUE (?)";
                    var value = [username, sdt, email, encryptP, fullname, Ns, Diachi, new Date(), new Date(), front, back];
                    con.query(quer, [value], function(err, results) {
                        if (err) throw err;
                    });

                    let urls = req.protocol + "://" + req.get('host') + '/auth/login'

                    var transporter = nodemailer.createTransport({
                        service: 'yahoo',
                        auth: {
                            user: 'minh09az90@yahoo.com',
                            pass: 'bgylrwxjaxgfewqi'
                        }
                    });

                    var mailOptions = {
                        from: 'minh09az90@yahoo.com',
                        to: `${email}`,
                        subject: 'Thông tin đăng nhập',
                        text: `Username của bạn là ${username} và mật khẩu là ${password}  Ấn vào link này để đăng nhập ${urls} `
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });


                    req.flash('success', 'Đăng ký thành công kiểm tra email vừa tạo để lấy thông tin đăng nhập')
                    res.redirect('/auth/register')
                }


            });
        }
    }


});





router.get('/forget-password', (req, res) => {
    res.render('auth/forgetPassword')
})

//Math.random() * (max - min + 1) + min

router.post('/forget-password', mailF, (req, res, next) => {
    Email = req.body.EoP
    let result = validationResult(req)
    let urls = req.protocol + "://" + req.get('host') + '/auth/forgetChangePass'
    if (!(result.errors.length === 0)) {
        result = result.mapped()

        let message
        for (field in result) {
            message = result[field].msg
            break
        }
        const { Email } = req.body
        req.flash('error', message)
        req.flash('EoP', Email)
        res.redirect('forget-password')

    } else {
        Code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)

        con.query("select Email from User where  Email = ?", [Email], (error, results, fields) => {
            if (error) {
                throw (error)
            } else if (results.length > 0) {
                con.query("Update User set Code = ?,ExTimeCode = ? where  Email = ?", [Code, new Date(), Email])
                var transporter = nodemailer.createTransport({
                    service: 'yahoo',
                    auth: {
                        user: 'minh09az90@yahoo.com',
                        pass: 'bgylrwxjaxgfewqi'
                    }
                });

                var mailOptions = {
                    from: 'minh09az90@yahoo.com',
                    to: `${Email}`,
                    subject: 'Khôi phục mật khẩu',
                    text: `Sử dụng mã này có hiệu lực trong vòng 5p ${Code} Ấn vào link này để khôi phục ${urls} `
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                req.flash('success', 'Kiểm tra mail của bạn và nhập theo hướng dẫn của mail')
                res.redirect('forget-password')
            } else {
                console.log(results)
                req.flash('error', 'Email không tồn tại')
                res.redirect('forget-password')
            }
        });
    }
})


router.get('/forgetChangePass', (req, res) => {

    res.render('auth/forgetChangePass')
})
router.post('/forgetChangePass', cPassCodevalidator, (req, res, next) => {
    let result = validationResult(req)

    if (!(result.errors.length === 0)) {
        result = result.mapped()

        let message
        for (field in result) {
            message = result[field].msg
            break
        }
        const { email, code, pswd1, pswd2 } = req.body
        req.flash('error', message)
        res.redirect('forgetChangePass')


    } else {
        var email = req.body.email
        var code = req.body.code
        var P2 = req.body.pswd1
        var P3 = req.body.pswd2
        if (P2 != P3) {
            req.flash('error', 'Mật khẩu mới không trùng khớp')
            res.redirect('forgetChangePassword')
        } else {
            con.query('SELECT Password,Code,ExTimeCode FROM User WHERE Email = ?', [email], function(err, rows, fields) {
                if (err) throw err
                else {
                    const a = rows[0]


                    if (rows.length <= 0) {

                        req.flash('error', 'Email không đúng')
                        res.redirect('forgetChangePassword')
                    } else if (((a.Code == code) && (new Date() - a.ExTimeCode) < 300000)) {

                        const encryptP = bcrypt.hashSync(P2, 5)
                        var quer = "Update User set password = ?,Update_at = ? where email = ?";
                        var value = [encryptP, new Date(), email];


                        req.flash('success', 'Đổi mật khẩu thành công')
                        req.session.destroy()
                        con.query(quer, value, function(err, results) {
                            if (err) throw err;
                        });
                        res.redirect('/auth/login')


                    } else {

                        req.flash('error', 'Code không hợp lệ hoặc hết thời gian')
                        res.redirect('forgetChangePass')
                    }
                }

            })
        }
    }



})





router.get('/change-password', (req, res) => {

    res.render('auth/changePassword')
})

router.post('/change-password', cPassvalidator, (req, res, next) => {
    let result = validationResult(req)
    if (!(req.session.name)) {
        res.redirect('/')
    } else {
        if (!(result.errors.length === 0)) {
            result = result.mapped()

            let message
            for (field in result) {
                message = result[field].msg
                break
            }
            req.flash('error', message)
            res.redirect('change-password')

        } else {
            var P1 = req.body.pswd
            var P2 = req.body.pswd1
            var P3 = req.body.pswd2
            if (!req.session.name) {
                req.flash('error', 'Vui long dang nhap')
                res.redirect('/auth/login')
            } else if (P2 != P3) {
                req.flash('error', 'Mật khẩu mới không trùng khớp')
                res.redirect('/auth/change-password')
            } else if (req.session.name) {
                con.query('SELECT Password FROM User WHERE Email = ?', [req.session.name], function(err, rows, fields) {
                    if (err) throw err
                    else {
                        const a = rows[0]


                        if (rows.length <= 0) {
                            req.flash('error', 'Có lỗi xảy vui lòng thử lại hoặc đăng nhập')
                            res.redirect('/auth/change-password')
                        } else if (bcrypt.compareSync(P1, a.Password)) {

                            const encryptP = bcrypt.hashSync(P2, 5)
                            var quer = "Update User set password = ?,Update_at = ?,Doimk = 1 where email = ?";
                            var value = [encryptP, new Date(), req.session.name];


                            req.flash('success', 'Đổi mật khẩu thành công')
                            req.session.destroy()
                            con.query(quer, value, function(err, results) {
                                if (err) throw err;
                            });
                            res.redirect('/auth/login')


                        } else {
                            req.flash('error', 'Mật khẩu cũ không chính xác')
                            res.redirect('/auth/change-password')
                        }
                    }

                })
            }
        }
    }
})


router.get('/Firstchangepass', (req, res) => {
    if (req.session.Doimk == 0) {

        if (req.session.Id) {
            res.render('auth/Firstchangepass')
        } else res.render('auth/login')
    } else res.render('auth/login')

})

router.post('/Firstchangepass', Fpassvalidator, (req, res, next) => {

    if (req.session.Doimk == 0)
        if (req.session.Id) {


            let result = validationResult(req)
            if (!(result.errors.length === 0)) {
                result = result.mapped()

                let message
                for (field in result) {
                    message = result[field].msg
                    break
                }
                req.flash('error', message)
                res.redirect('Firstchangepass')

            } else {

                var P2 = req.body.pswd1
                var P3 = req.body.pswd2

                if (P2 != P3) {
                    req.flash('error', 'Mật khẩu mới không trùng khớp')
                    res.redirect('/auth/Firstchangepass')
                } else {

                    const encryptP = bcrypt.hashSync(P2, 5)
                    var quer = "Update User set password = ?,Update_at = ?,Doimk = 1 where Id = ?";
                    var value = [encryptP, new Date(), req.session.Id];
                    con.query(quer, value, function(err, results) {
                        if (err) throw err;
                    });

                    con.query('SELECT email,Doimk FROM User WHERE Id = ?', [req.session.Id], function(err, rows, fields) {
                        if (err) throw err
                        else {
                            a = rows[0]
                            req.session.loggedin = true;
                            req.session.name = a.email;
                            req.session.Doimk = a.Doimk;
                            res.redirect('/auth/login')





                        }
                    });



                }
            }


        } else res.render('auth/login')
    else res.render('auth/login')
})

router.get('/UpdateInfo', (req, res) => {
    if (!(req.session.name)) {
        res.redirect('/')
    } else {
        res.render('auth/UpdateInfo')
    }
})
router.post('/UpdateInfo', multiupload, (req, res, next) => {
    if (!(req.session.name)) {
        res.redirect('/')
    } else {

        if (req.session.front !== undefined)
            var front = req.session.front;
        else var front = 0
        if (req.session.back !== undefined)
            var back = req.session.back;
        else back = 0
        if (req.body.fullname !== undefined)
            var back = req.session.back;




        if (front)
            fs.unlinkSync('public/images/' + front)
        if (back)
            fs.unlinkSync('public/images/' + back)
        if (!back)
            message = 'Chưa upload ảnh mặt sau cmnd'
        if (!front)
            message = 'Chưa upload ảnh mặt trước cmnd'
        if (!back || !front) {
            req.flash('error', message)
            res.redirect('UpdateInfo')
        } else {

            fullname = req.body.fullname
            Diachi = req.body.Diachi
            con.query("select Ten,Diachi,Email from User where  Email = ?", [req.session.name], (error, results, fields) => {
                if (error) {
                    throw (error)
                } else if (results.length < 0) {
                    req.flash('error', 'Có lỗi xảy ra vui lòng lòng thư lại hoặc đăng nhập lại')
                    if (front)
                        fs.unlinkSync('public/images/' + front)
                    if (back)
                        fs.unlinkSync('public/images/' + back)
                    res.redirect('UpdateInfo')
                } else {
                    a = results

                    if (fullname == '')
                        fullname = a[0].Ten
                    if (Diachi == undefined)
                        Diachi = a[0].Diachi


                    con.query("update User set Ten = ?,Diachi = ?,Update_at = ?, Mtruoccmnd = ?,Msaucmnd = ? where email = ?", [fullname, Diachi, new Date(), front, back, req.session.name], function(err, results) {
                        if (err) throw err;
                        console.log(results)
                        req.flash('success', 'Cập nhật thành công')
                        res.redirect('UpdateInfo')
                    });
                }



            })
        }
    }
})





module.exports = router