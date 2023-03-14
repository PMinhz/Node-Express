const express = require('express')
var session = require('express-session')
const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.name) {
        session = req.session
        console.log('Oke muot.')
        console.log(session.Id + "này bên index")

        res.render('home')
    } else
        res.redirect('./auth/login')
})

router.get('/history', (req, res) => {
    res.render('history')
})



module.exports = router