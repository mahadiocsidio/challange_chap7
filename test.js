const { name, email, password, confirmPassword} = req.body;
if (!name||!email||!password||!confirmPassword){
    return res.json({message: "Please fill all required field"});
}
//check if password and confirmpassword is match
if (password !== confirmPassword) return alert('Password not match')
const hash = await bcrypt.hash(password, 10);
const user = await prisma.users.create({
    data: {
        name,
        email,
        password: hash,
        },
    });
//make welcome notification in prisma
await prisma.notification.create({
    data: {
        userId: user.id,
        title:`Welcome`,
        body: `Welcome ${user.name}!`,
    },
});
res.redirect(`/login`)