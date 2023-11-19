const jwt = require('jsonwebtoken');

module.exports={
    verivyToken: (req, res, next) => {
        const token = req.cookies.token;
      
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
          next();
        } catch (error) {
          res.redirect('/?message=Invalid Token&status=false');
        } 
    }
} 