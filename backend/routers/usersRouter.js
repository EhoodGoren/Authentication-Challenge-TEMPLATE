const express = require('express');
const jwt = require('jsonwebtoken')

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

// Validating access token
router.post('/users/tokenValidate', (req, res) => {
    const token = req.headers.Authorization;
    if(!token) res.status(401).send('Access Token Required');
    jwt.verify(token, secret, (err, user) => {
        err ?
            res.status(403).send('Invalid Access Token') :
            res.json({valid: true});
    })
})

// Access user info with token
router.get('/api/v1/information', (req, res) => {
    const token = req.headers.Authorization;
    if(!token) res.status(401).send('Access Token Required');
    jwt.verify(token, secret, (err, user) => {
        err ?
            res.status(403).send('Invalid Access Token') :
            res.json({email: user.email, info: user.info});
    })
})

router.post('/users/token', (req, res) => {
    const token = req.body.token;
    if(!token) res.status(401).send('Refresh Token Required');
    // jwt.verify(token, secret, (err, user) => {
    // renew
        err ?
            res.status(403).send('Invalid Refresh Token') :
            res.json({email: user.email, info: user.info});
    // })
})

// Logging out
router.post('users/logout', (req, res) => {
    const token = req.body.token;
    if(!token) res.status(400).send('Refresh Token Required');
    //log out?
    jwt.verify(token, secret, (err, user) => {
        err ?
            res.status(400).send('Invalid Refresh Token') :
            res.send('User Logged Out Succesfully');
    })
})

// Sends users array for an admin token
router.get('/api/v1/users', (req, res) => {
    const token = req.headers.Authorization;
    if(!token) res.status(401).send('Access Token Required');
    jwt.verify(token, secret, (err, user) => {
        !user.isAdmin ?
            res.status(403).send('Invalid Access Token') :
            res.json({USERS})
    })
})

router.options('/', /* stuff */)
