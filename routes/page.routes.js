const {Router} = require('express')
const router = Router()
const{register,login,forgot_password,reset_password}= require('../controllers/auth.controllers')
const prisma = require('../libs/prisma')
const {verivyToken} = require('../libs/verifyToken')

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

router.get('/forgot-password', (req,res)=>{
    res.render('forgotPass')
})

router.post('/api/forgot-password', forgot_password);

router.get('/reset-password', (req,res)=>{
    res.render('resetPass')
})

router.post('/api/reset-password', reset_password);


router.get('/notifications',verivyToken, async (req, res) => {
    try {
      const notifications = await prisma.notifications.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.render('notifications', { ...req.user, notifications });
    } catch (error) {
        res.redirect('/?message=Email not found&status=false');
    }
})
module.exports = router