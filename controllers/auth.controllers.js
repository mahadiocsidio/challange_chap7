const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  register: async (req,res,next)=>{
    try {
        const { name, email, password, confirmPassword} = req.body;

        //check if password and confirmpassword is match
        if (password !== confirmPassword){
            res.redirect('/errorPage')
        }
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
        const { email, password } = req.body;
        const user = await prisma.users.findUnique({
            where: {
                email
                },
            });

        if (!user) return res.redirect('/errorPage')

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.redirect('/errorPage')

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        });

        res.redirect(`/notifications`)
    } catch (error) {
        next(error)
    }
  },
    authenticate: async (req,res,next)=>{
        const token = req.cookies.token;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.redirect('/errorPage');
        }
    },
    resetDb: async (req,res) => {
        try {
          await prisma.notifications.deleteMany()
          console.log('Deleted records in category table')
      
      
          await prisma.users.deleteMany()
          console.log('Deleted records in product table')
      
      
          await prisma.$queryRaw`ALTER TABLE Users AUTO_INCREMENT = 1`
          console.log('reset product auto increment to 1')
      
          await prisma.$queryRaw`ALTER TABLE Notifications AUTO_INCREMENT = 1`
          console.log('reset category auto increment to 1')
        } catch (e) {
          console.error(e)
          process.exit(1)
        } finally {
          await prisma.$disconnect()
        }
    }
};
