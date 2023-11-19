const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../libs/prisma');
const { sendEmail } = require('../libs/nodemailer');
const email = require('../libs/email');
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
                email,
            },
        });

        if (!user) return res.redirect('/errorPage')

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.redirect('/errorPage')

        const token = jwt.sign(
            {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            process.env.JWT_SECRET
          );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        });

        res.redirect(`/notifications`)
    } catch (error) {
        next(error)
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
    },
    forgot_password:async(req,res)=>{
        try {
            const { email } = req.body;
        
            const user = await prisma.users.findUnique({
              where: {
                email,
              },
            });
        
            if (!user) {
              res.redirect('/forgot-password?message=Email not found&status=false');
            } else {
              const token = jwt.sign(
                {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
              );
        
              const link = `http://localhost:3000/reset-password/?token=${token}`;
              await sendEmail({
                to: email,
                subject: 'Reset Password',
                html: email(link),
              });
        
              res.redirect(`/forgot-password?message=Reset password link telah dikirim ke emailmu&status=true`);
            }
          } catch (error) {
            next(error);
          }
    },
    reset_password: async (io, req, res, next) => {
        try {
          const { token } = req.query;
      
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
          if (!decoded) {
            res.redirect('/?message=Token invalid&status=false');
          }
      
          const { password, confirm_password } = req.body;
      
          if (password !== confirm_password) {
            res.redirect('/?message=Password dan Confirm Password tidak sama&status=false');
          }
      
          await prisma.users.update({
            where: {
              email: decoded.email,
            },
            data: {
              password: await bcrypt.hash(password, 10),
            },
          });
          io.emit(`userId-${decoded.id}-notification`, {
            message: `Successfully change password!`,
            category: 'info',
          });
      
          await prisma.notifications.create({
            data: {
              userId: decoded.id,
              title: 'Password Changed',
              body: `Successfully change password!`,
            },
          });
      
          res.redirect('/?message=Reset password berhasil&status=true');
        } catch (error) {
          next(error);
        }
    }
};
