module.exports={
    email:(link)=>{
        return `
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh;">

        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">

        <h2 style="margin-bottom: 20px;">Forgot Password</h2>

        <p style="margin-bottom: 20px;">You have requested to reset your password. Click the link below to reset it:</p>

        <a href=${link}" target="_blank" style="color: #4caf50; text-decoration: none; font-weight: bold;">Reset Password</a>

        <p style="margin-bottom: 20px;">If you did not request a password reset, please ignore this email.</p>

        </div>

    </body>
        `
    }
}