//jshint esversion:6
// require('dotenv').config()
const express = require('express');
const app =  express();
const bodyParser = require('body-parser');
const ejs =  require('ejs');
// const encrypt = require('mongoose-encryption')
// var md5 = require('md5');
// console.log(process.env.SECRET)
// const bcrypt = require('bcrypt');
const session =  require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')
const saltRounds = 10;
const mongoose =  require('mongoose')
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(session({
    secret:'this is a secret message',
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session())
mongoose.connect('mongodb://localhost:27017/secretsDB',{
    useNewUrlParser: true, useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

const usersSchema = new mongoose.Schema({
    username:String,
    password: String
});
usersSchema.plugin(passportLocalMongoose)
// const secret = "longsecretstringmessage"
// usersSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ['password'] })


const User = mongoose.model('User', usersSchema)
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/register",(req,res)=>{
    res.render("register")
});
app.get('/secrets',(req,res)=>{
 if(req.isAuthenticated()){
     res.render('secrets')
 }else{
     res.redirect('/login')
 }
})


app.post('/register',(req,res)=>{



User.register({username:req.body.username},req.body.password,(err,user)=>{
    if(err){
        console.log(err);
        res.redirect('/register')
    }else{
        passport.authenticate('local')(req,res,()=>{
            res.redirect('/secrets')
        })
    }
})

})

app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/')
})

app.post('/login',(req,res)=>{
  const user = new User ({
      username: req.body.username,
      password:req.body.password
  })
  req.login(user,(err)=>{
   if(err){
       console.log(err)
       res.render('login')
   }else{
    passport.authenticate('local')(req,res,()=>{
    res.redirect('/secrets')
    })
}
  
  })
        

})


app.listen(3000,(req,res)=>{
    console.log("server running!!")
})