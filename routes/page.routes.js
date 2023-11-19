const {Router} = require('express')
const router = Router()
const{register,login,authenticate,resetDb}= require('../controllers/auth.controllers')

router.get('/', (req,res)=>{
    res.render('register')
})

router.get('/errorPage', (req,res)=>{
    res.render('errorPage')
})

router.post('/api/register', register);

router.get('/login', (req,res)=>{
    res.render('login')
})
router.post('/api/login', login);

router.get('/notifications',(req, res)=>{
    res.render('notifications')
})
module.exports = router