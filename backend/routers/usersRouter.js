const express = require('express');

const router = express.Router();
// {email, name, password, isAdmin}
const USERS = [];
// {email, info}
const INFORMATION = [];

// Signing up to the server
router.post('/users/register', (req, res) => {
    const { email, user, password } = req.body;
    if(USERS.every(_user => _user.user !== user)){
        INFORMATION.push({email, info: `${user} info`});
        res.status(201).send('Register Success');
    }
    else {
        res.status(409).send('user already exists');
    }
})

// Logining in to the server
router.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const loginUser = USERS.find(user => user.email === email || user.password === password);
    if(!loginUser) res.status(404).send('cannot find user');
    if(loginUser.email === email && loginUser.password === password){
        // res.status(200).json({accessToken, refreshToken, email, name, isAdmin})
    }
    else {
        res.status(403).send('User or Password incorrect');
    }
})
