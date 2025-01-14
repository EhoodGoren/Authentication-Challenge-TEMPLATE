const express = require('express');
const jwt = require('jsonwebtoken');
const { encrpytPassword, checkDecrypt } = require('../helpers/bcryptFunctions');
const router = express.Router();

// {email, name, password, isAdmin}
const USERS = [];
// {email, info}
const INFORMATION = [];

const REFRESHTOKENS = [];

const secret = 'ktuKOD6zt6';

let adminAdded = false;
const addAdmin = async () => {
    const admin = {
        email: "admin@email.com",
        name: "admin",
        password: await encrpytPassword('Rc123456!'),
        isAdmin: true
    }
    USERS.push(admin);
    adminAdded = true;
}
router.use(async (req, res, next) => {
    if(!adminAdded) await addAdmin();
    next();
})

const routes = [
    { method: "post", path: "/users/register", description: "Register, Required: email, name, password", example: { body: { email: "user@email.com", name: "user", password: "password" } } },
    { method: "post", path: "/users/login", description: "Login, Required: valid email and password", example: { body: { email: "user@email.com", password: "password" } } },
    { method: "post", path: "/users/token", description: "Renew access token, Required: valid refresh token", example: { headers: { token: "\*Refresh Token\*" } } },
    { method: "post", path: "/users/tokenValidate", description: "Access Token Validation, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "get", path: "/api/v1/information", description: "Access user's information, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "post", path: "/users/logout", description: "Logout, Required: access token", example: { body: { token: "\*Refresh Token\*" } } },
    { method: "get", path: "api/v1/users", description: "Get users DB, Required: Valid access token of admin user", example: { headers: { authorization: "Bearer \*Access Token\*" } } }
];

// Signing up to the server
router.post('/users/register', async (req, res) => {
    const { email, name, password } = req.body;
    // If user name isn't taken yet
    if(USERS.every(user => user.name !== name)){
        const encrpytedPassword = await encrpytPassword(password);
        USERS.push({ email, name, password: encrpytedPassword, isAdmin: false });
        INFORMATION.push({email, info: `${name} info`});
        res.status(201).send('Register Success');
    }
    else {
        res.status(409).send('user already exists');
    }
})

// Logging in to the server
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const loginUser = USERS.find(user => user.email === email);
    if(!loginUser) return res.status(404).send('cannot find user');
    if(await checkDecrypt(`${password}`, `${loginUser.password}`)){
        const accessToken = jwt.sign(loginUser, secret, {expiresIn: '10000'});
        const refreshToken = jwt.sign(loginUser, secret);
        REFRESHTOKENS.push(refreshToken);
        res.status(200).json({accessToken, refreshToken, email, name: loginUser.name, isAdmin: loginUser.isAdmin});
    }
    else {
        res.status(403).send('User or Password incorrect');
    }
})

// Validating access token
router.post('/users/tokenValidate', (req, res) => {
    let accessToken = req.headers.authorization;
    if(!accessToken) return res.status(401).send('Access Token Required');
    const accessTokenNoBearer = accessToken.split(' ')[1];
    jwt.verify(accessTokenNoBearer || accessToken, secret, (err, user) => {
        err ?
            res.status(403).send('Invalid Access Token') :
            res.json({valid: true});
    })
})

// Access user info with token
router.get('/api/v1/information', (req, res) => {
    const accessToken = req.headers.authorization;
    if(!accessToken) return res.status(401).send('Access Token Required');
    const accessTokenNoBearer = accessToken.split(' ')[1];
    jwt.verify(accessTokenNoBearer || accessToken, secret, (err, user) => {
        err ?
            res.status(403).send('Invalid Access Token') :
            res.json([{email: user.email, info: user.info}]);
    })
})

// Sends a new access token to a valid refresh token.
router.post('/users/token', (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken) return res.status(401).send('Refresh Token Required');
    if(REFRESHTOKENS.find(token => token === refreshToken)){
        const refreshTokenUser = jwt.verify(refreshToken, secret)
        const accessToken = jwt.sign(refreshTokenUser, secret, {expiresIn:'12000'});
        res.json({accessToken})
    }
    else {
        res.status(403).send('Invalid Refresh Token');
    }
})

// Logging out
router.post('/users/logout', (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken) return res.status(400).send('Refresh Token Required');
    let foundToken = false;
    REFRESHTOKENS.map(token => {
        if(token === refreshToken){
            foundToken = true;
            res.send('User Logged Out Successfully');
        }
    })
    if(!foundToken) res.status(400).send('Invalid Refresh Token');
})

// Sends users array for an admin token
router.get('/api/v1/users', (req, res) => {
    const accessToken = req.headers.authorization;
    if(!accessToken) return res.status(401).send('Access Token Required');
    const accessTokenNoBearer = accessToken.split(' ')[1];
    jwt.verify(accessTokenNoBearer || accessToken, secret, (err, user) => {
        if(err) res.status(403).send('Invalid Access Token');
        user.isAdmin ?
            res.json(USERS) :
            res.status(403).send('Invalid Access Token');
    })
})

router.options('/', (req, res) => {
    const accessToken = req.headers.authorization;
    res.set('Allow', 'OPTIONS, GET, POST');
    if(!accessToken) return res.json(routes.slice(0, 2));
    const accessTokenNoBearer = accessToken.split(' ')[1];
    jwt.verify(accessTokenNoBearer || accessToken, secret, (err, user) => {
        if(err) return res.json(routes.slice(0, 3));
        else {
            user.isAdmin ?
                res.json(routes.slice()) :
                res.json(routes.slice(0,6));
        }
    })
})

module.exports = router;
