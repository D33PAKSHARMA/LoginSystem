require('dotenv').config()
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const Register = require('./models/registers');
const auth = require('./verifyToken')


// Db connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.url,{
    useNewUrlParser: true,
    useUnifiedTopology: true

}).then(()=>{
    console.log(`connection successful`);
}).catch((e)=>{
    console.log(e);
})



const port = process.env.PORT || 3000;

const static_path = path.join(__dirname ,'./public');

app.use(express.static(static_path));        // for static content


app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('view engine','ejs');          // set view engine


// Routes
app.get('/',(req,res)=>{
    res.render("index");
})
app.get('/register',(req,res)=>{
    res.render("register");
})

app.get('/login',(req,res)=>{
    res.render("login");
})

app.get('/secret',auth,(req,res)=>{

    res.render("secret");
})
app.get('/home', (req,res)=>{

    res.render("home");
})


// post request for register page and create a user in our database
app.post('/register',async(req,res)=>{
    try {   
         //check if email already exist
        const emailExist = await Register.findOne({email : req.body.email});
        if(emailExist) return res.status(400).send("Email already exist"); 

        const password = req.body.password;

        // Hash the password
        const salt  = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        //create new user
        const userregister = new Register({

            username:req.body.username,
            email:req.body.email,
            password:hashPassword,

        })
        // save it to Database
        const registered = await userregister.save();
        res.status(201).render('login');
    }catch(err){
        console.log(err);
    }
});


// post request for login form for user
app.post('/login', async(req,res)=>{

        const email = req.body.email;
        const password = req.body.password;

        const user = await Register.findOne({email:email});
        if(!user) return res.status(400).send("Email not found"); //if user not found in database

        const isvalid = await bcrypt.compare(password , user.password);
        if(!isvalid) return res.status(400).send('Password Incorrect');


        // // Create and assign token
        const token = jwt.sign({_id:user._id}, process.env.SECRET_KEY);
         res.header('auth-token',token);
         console.log(token);
 
        res.status(200).render('index');
        
})


//  routes for change password or forgot password

app.get('/forgot',(req,res)=>{
    res.render('forgot')
})

app.post('/forgot', async(req,res)=>{
    const password = req.body.password;
    const cpass = req.body.cpassword;

    const user = await Register.findOne({email:req.body.email});

    if(password != cpass) return res.send('Pasword not matched!');

    const salt  = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

    await Register.EmailPasswordAuth.callResetPasswordFunction({emai , hashPassword},()=>{
        res.send('password changed!');
    } );

})





// listen at port 3000
app.listen(port , ()=>{
    console.log(`Listening on port ${port}`);
})