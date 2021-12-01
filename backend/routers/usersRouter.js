const express = require('express');
const jwt = require('jsonwebtoken');
const { encrpytPassword, checkDecrypt } = require('../helpers/bcryptFunctions');
const router = express.Router();

// {email, name, password, isAdmin}
const USERS = [];
// {email, info}
const INFORMATION = [];

const REFRESHTOKENS = [];


const admin = {
    email: "admin@email.com",
    name: "admin",
    password: encrpytPassword('Rc123456!'),
    isAdmin: true
}

// Signing up to the server
router.post('/users/register', (req, res) => {
    const { email, user, password } = req.body;
    // If user name isn't taken yet
    if(USERS.every(_user => _user.user !== user)){
        const encrpytedPassword = encrpytPassword(password);
        USERS.push({ email, name: user, password, isAdmin: false });
        INFORMATION.push({email, info: `${user} info`});
        res.status(201).send('Register Success');
    }
    else {
        res.status(409).send('user already exists');
    }
})

// Logging in to the server
router.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const loginUser = USERS.find(user => user.email === email);
    if(!loginUser) res.status(404).send('cannot find user');
    if(checkDecrypt(password, loginUser.password)){
        const accessToken = jwt.sign(loginUser.user, secret);
        const refreshToken = accessToken;
        REFRESHTOKENS.push(refreshToken);
        res.status(200).json({accessToken, refreshToken, email, name: loginUser.user, isAdmin: false});
    }
    else {
        res.status(403).send('User or Password incorrect');
    }
})

// Validating access token
router.post('/users/tokenValidate', (req, res) => {
    const accessToken = req.headers.Authorization;
    if(!accessToken) res.status(401).send('Access Token Required');
    jwt.verify(accessToken, secret, (err, user) => {
        err ?
            res.status(403).send('Invalid Access Token') :
            res.json({valid: true});
    })
})

// Access user info with token
router.get('/api/v1/information', (req, res) => {
    const accessToken = req.headers.Authorization;
    if(!accessToken) res.status(401).send('Access Token Required');
    jwt.verify(accessToken, secret, (err, user) => {
        err ?
            res.status(403).send('Invalid Access Token') :
            res.json({email: user.email, info: user.info});
    })
})

// Sends a new access token to a valid refresh token.
router.post('/users/token', (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken) res.status(401).send('Refresh Token Required');
    REFRESHTOKENS.find(token => token === refreshToken) ?
        res.status(200).send(refreshToken) :
        res.status(403).send('Invalid Refresh Token');
})

// Logging out
router.post('users/logout', (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken) res.status(400).send('Refresh Token Required');
    REFRESHTOKENS.map(token => {
        if(token === refreshToken){
            res.send('User Logged Out Successfully');
        }
    })
    res.status(400).send('Invalid Refresh Token');
})

// Sends users array for an admin token
router.get('/api/v1/users', (req, res) => {
    const accessToken = req.headers.Authorization;
    if(!accessToken) res.status(401).send('Access Token Required');
    jwt.verify(accessToken, secret, (err, user) => {
        if(err) res.status(403).send('Invalid Access Token');
        user.isAdmin ?
            res.json({USERS}) :
            res.status(403).send('Invalid Access Token');
    })
})

router.options('/', /* stuff */)

module.exports = router;
