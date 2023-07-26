//load cookies
const Cookies = require("cookies");
//encrypt cookie keys to prevent hacking
const keys = ['keyboard cat']
//load sql
const Sequelize = require('sequelize');
//load the database
const db = require('../models');
//load the render library
const rn = require('./allRender');

/**
 * this function checks if the cookie is valid or not to prevent the user redirecting from login to confirm pass
 * without registering, if the session is valid, render to feed,
 * @param req session values
 * @param res render pages with appropriate messages
 * @param next
 */
exports.getConfirmPass = (req, res, next) => {
    let cookies = new Cookies(req, res, {keys: keys});
    let theUser = cookies.get('theUser', {signed: true})

    if(req.session.user)
    {
        rn.renderFeed(res,req.session.user.name)
    }
    else {
        if (theUser) {
            let message = ""
            rn.renderConfirm(res, message)
        } else {
            let message = "you need to register first"
            rn.renderLogin(res, message)
        }
    }
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function is triggered when the user clicks on the submit button in the confirm-page, the function checks if
 * both the password inputs are the same or not, if not an appropriate message is shown to the user, if yes,
 * render to the login page and add the user to the database. encrypt the password before adding it to the database
 * to prevent hacking, and check if the cookies expire or not, if not, a user could be made, if yes render the
 * user to the register informing him that the registration process has expired.
 * @param req both the passwords given by user and session values
 * @param res rendering pages with appropriate messages
 * @param next
 * @returns {Promise<void>}
 */
exports.postConfirmPass = async(req, res, next) => {
    try {
        let cookies = new Cookies(req, res, {keys: keys});
        let theUser = cookies.get('theUser', {signed: true})
        let encPassword=validatePass(req.body.pwd1, req.body.pwd2)
        let redLogin = false;

        if (theUser) {
            let details = theUser.split(',')
            let email = details[0].toLowerCase()//to make comparison case-insensitive
            await checkMail(email, res, req)
            let user =db.User.build({email: email, firstName: details[1], lastName: details[2], password: encPassword});
            cookies.set('theUser', [' '], {maxAge: 0})//delete cookie
            user.save()
                .then((u) => {
                    redLogin = true
                    res.locals.redLogin = redLogin
                    cookies.set('message', "registered successfully",{signed: true})//create a cookie that holds a message
                    next()//call the next route
                })//rn.renderLogin(res, message))//send message
                .catch((error) => {
                    if (error instanceof Sequelize.ValidationError){
                        rn.renderConfirm(res, `input invalid: ${error}`)
                    }
                    else{
                        rn.renderConfirm(res, `other error: ${error}`)
                    }
                })

        } else {
            cookies.set('message', 'Registration process expired, please start again',{signed: true})
            next()

        }
    }catch(err){
        rn.renderConfirm(res, err)
    }
};
/**
 * this function is called when the registration process is completed successfully or if the registration process
 * expired, depending on the local variable sent that distinguishes between them.
 * , it is done separately to distance renders from redirects, handling the routes
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.postConfirmPassNext = async(req, res, next) => {
    if(req.res.locals.redLogin) {
        res.redirect('/')
    }else{
        res.redirect('/admin/register')
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function checks if the mail is already used during the 30 second. the search is done by trying to find on
 * record in the database, if found, display an appropriate message informing the message. if not
 * @param email the email given by user during the registration process
 * @param res rendering to other pages
 * @param req
 * @returns {Promise<void>}
 */
async function checkMail(email, res, req){
       await db.User.findOne({
            where: {email: email},
            attributes: ['email']
        }).then(user => {
            if(user !== null){
                throw new Error('this email already exists');
            }

        }).catch(error=>{
            let message = 'the email is already taken'
            let user = ['','','']
            rn.renderRegister(res, user, message)
        });

}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function validates if both passwords are the same
 * @param pw1 first password
 * @param pw2 confirmed password
 * @returns {*}
 */
function validatePass(pw1, pw2)
{
    if(pw1!==pw2)
    {
        throw new Error('passwords do not match!')
    }
    else
    {
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(pw1, salt);

    }
}

