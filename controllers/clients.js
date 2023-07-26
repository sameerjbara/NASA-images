//load cookies
const Cookies = require('cookies')
// encrypt the keys
const keys = ['keyboard cat']
//load the database
const db = require('../models');
//load the render library
const rn = require('./allRender');

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function checks if there is a valid session, if so render to feed if not render the user to the register.
 * check if there is a cookie beforehand if so give the details given by the user, if not empty the fields
 * @param req session and cookies
 * @param res rendering to other pages
 * @param next
 */
exports.getAddClient = (req, res, next) => {
    if(req.session.user)
    {
        rn.renderFeed(res,req.session.user.name)

    }
    else {
        let cookies = new Cookies(req, res, {keys: keys});
        let theUser = cookies.get('theUser', {signed: true})
        if (theUser) {
            let user = theUser.split(',')
            let message = ' '
            rn.renderRegister(res, user, message)
        } else {
            let message = cookies.get('message', {signed: true})//check if there is a message in the cookies to use
            if(!message) {
                message = " "//if the cookie is deleted then create an empty message
            }
            cookies.set('message', [' '], {maxAge: 0})//delete the cookie after the message is retrieved
            let user = ['', '', '']
            rn.renderRegister(res, user, message)
        }
    }
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function is triggered when the user clicks on the submit button in the register page. this will update the
 * cookie with the info provided by the user. checks if the email was used already and validates the first and last
 * name.
 * @param req email, firstname and last name given by user
 * @param res rendering to other pages with appropriate messages
 * @param next
 * @returns {Promise<void>}
 */
exports.postAddClient = async (req, res, next) => {
    let errorFound = false
    try {
        let cookies = new Cookies(req, res, {keys: keys});
        cookies.set('theUser', [req.body.email, req.body.fname, req.body.lname], {maxAge: 30 * 1000})
        await validateUser(req.body.email.trim().toLowerCase(), req.body.fname.trim(), req.body.lname.trim(), req, res)


    } catch (err) {
        res.locals.error = err//save the error message in order to retrieve it in the next route
        errorFound = true;
        next();//call the next route


    }
    if(!errorFound) {
        res.redirect('/admin/confirm-pass')
    }


};
/**
 * this route is called if there is an error in the registration form, it is called separately in order to distance
 * redirects from renders
 * @param req
 * @param res
 * @param next
 */
exports.postAddClientFail = (req, res, next) => {
    let user = [req.body.email, req.body.fname, req.body.lname]// current user
    rn.renderRegister(res, user, req.res.locals.error)//error message
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function checks if the email is already used or not by trying to find one record in the database, if found
 * inform the user that the email has been used already, if not check the other fields and render to the confirm pass
 * page
 * @param email
 * @param fname
 * @param lname
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function validateUser(email, fname, lname, req, res) {

    const user = await db.User.findOne({ where: { email: email } });
    if (user !== null) {
        throw new Error('this email already exists');
    }

    if (!email || !fname || !lname) {
        throw new Error('You must include all the details');
    }

    if (!/^[A-Za-z]*$/.test(fname) || !/^[A-Za-z]*$/.test(lname)) {
        throw new Error('your first and last name should not include characters other than alphabet')
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function renders the feed pages providing the name of the user
 * @param req session username
 * @param res render feed page
 * @param next
 */
exports.getFeedPage = (req, res, next) => {
    rn.renderFeed(res, req.session.user.name)
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function gets the home page which is the login page
 * @param req
 * @param res render home page
 * @param next
 */
exports.getHomePage = (req, res, next) => {
    let cookies = new Cookies(req, res, {keys: keys});
    let message = cookies.get('message', {signed: true})//check if there is a message in the cookies to use
    if(!message) {
        message = " "//if the cookie is deleted then create an empty message
    }
    cookies.set('message', [' '], {maxAge: 0})//delete the cookie after the message is retrieved
    rn.renderLogin(res, message);

};



