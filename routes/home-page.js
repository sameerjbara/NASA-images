const express = require('express');
// load the controllers
const productsController = require('../controllers/clients');

const router = express.Router();

/**
 * this function gives the authorization for the user depending on the session, if session is found then the user is
 * immediately redirected to the feed page, if not the log in page will be rendered
 * @param req promise request
 * @param res promise response
 * @param next next which helps us to go to the desired route
 * @returns {*}
 */
const auth =(req,res,next) => {
    if (req.session.user) {
        return next()
    } else {
        next('route')
    }
}
//will reach this route only if the user is authorised, meaning the session is sitll alive
router.get('/', auth, productsController.getFeedPage);
//if the user is not authorised it will reach this route
router.get('/', productsController.getHomePage);

module.exports = router;
