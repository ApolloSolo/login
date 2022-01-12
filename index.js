const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session')

mongoose.connect('mongodb://localhost:27017/authDemo') 
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch((e) => {
        console.log("Oh No, Mongo Error Dude")
        console.log(e)
    })

app.set('view engine', 'ejs');
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "words" }))

const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    return next();
}

app.get('/', (req, res) => {
    res.send("This is the home page!")
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    
    const user = new User({ username, password })//using middelware in models to hash password
    await user.save();
    req.session.user_id = user._id; //if you register, store your id in the session
    res.redirect('/');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    const { password, username } = req.body;
    // const user = await User.findOne({ username });
    // const validPass = await bcrypt.compare(password, user.password); //bcript takes plane text password and compares it to hashed password
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id; //if you log in, store your id in the session
        res.redirect('/secret');
    }
    else{ res.redirect('/login'); }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.listen(3000, () => {
    console.log("Serving your app on 3000")
}) 