
const express = require('express');

// load the controllers
const register = require('../controllers/clients');
const pass = require('../controllers/confirmpassword');
const login = require('../controllers/log-in');
const feed = require('../controllers/feed');

const router = express.Router();

//a route to get the register page
router.get('/register', register.getAddClient);
//a route to post the register page (click on the submit button)
router.post('/register', register.postAddClient, register.postAddClientFail);
//a route to get the confirm-pass page
router.get('/confirm-pass', pass.getConfirmPass);
//a route to post the confirm pass page (click on the submit button)
router.post('/confirm-pass', pass.postConfirmPass, pass.postConfirmPassNext);
//a route to post the login page (click on the submit button)
router.post('/logIn', login.postLogin);
//a route to get the feed page
router.get('/feed/:id', feed.getFeed);
//a route to post the feed page (click on the submit button)
router.post('/feed', feed.postFeed, feed.postFeedSuccess);
//a route to get the logout page
router.get('/logout', feed.getLogout);
//a route to delete a comment from database
router.delete('/feed/:id',feed.deleteComment);

module.exports = router;
