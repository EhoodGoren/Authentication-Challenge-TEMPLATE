const express = require('express');
const morgan = require('morgan');
const usersRouter = require('./backend/routers/usersRouter');

const app = express();
app.use(express.json());
app.use(morgan());

app.use('/', usersRouter);

// const USERS = [...{email, name, password, isAdmin}...], 
// const INFORMATION = [...{email, info}...]
// const REFRESHTOKENS = []

// Passwords cannot be stored as plain-text - only as hash+salt(10!)

// USERS array on server must have an admin user with the props mentioned bellow:
// { email: "admin@email.com", name: "admin", password: "**hashed password**", isAdmin: true }
// Admin password: Rc123456!

// Tokens expire after 10 seconds

// Error handler 404 endpoint not found


module.exports = app;
