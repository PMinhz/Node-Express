const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.render('admin/admin')
})

router.get('/detail', (req, res) => {
    res.render('admin/detail')
})

router.get('/approval', (req, res) => {
    res.render('admin/approval')
})

module.exports = router
