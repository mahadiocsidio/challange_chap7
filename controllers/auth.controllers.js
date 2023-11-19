const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  register: async (req,res,next)=>{
    try {
        const { name, email, password, confirmPassword} = req.body;

        //check if password and confirmpassword is match
        if (password !== confirmPassword) return alert('Password not match')
        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hash,
            }
        });
        //make welcome notification in prisma
        await prisma.notifications.create({
            data: {
                userId: user.id,
                title:`Welcome`,
                body: `Welcome ${user.name}!`,
            },
        });
        res.redirect(`/login`)
    } catch (error) {
        next(error)
    }
  },
  login: async (req,res,next)=>{
    try {
        // const { email, password } = req.body;
        // const user = await prisma.users.findUnique({
        //     where: {
        //     email,
        //     },
        // });
        // if (!user) return alert('User not found')
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) return alert('Wrong password')
        // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        // });
        res.redirect(`/notifications`)
    } catch (error) {
    next(error)
    }
},
    authenticate: async (req,res,next)=>{
        try {
            const { token } = req.cookies;
            if (!token) return res.status(401).json({ message: 'Please login' });
            const { id } = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.users.findUnique({
                where: {
                    id,
                },
                include: {
                    notifications: true,
                },
            });
            if (!user) return res.status(401).json({ message: 'Please login' });
            req.user = user;
            next();
        } catch (error) {
            next(error)
        }
    }
};
