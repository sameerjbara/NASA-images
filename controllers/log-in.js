//load our database
const db = require('../models');
//load our render library
const rn = require('./allRender');

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 *this function is reached when the submit button of login is clicked, first of it check if there are any errors,
 * then checks if the email and password given by the user are correct and check if a user is found in the database,
 * if so render to the feed page if not a suitable message is shown for the user, in addition, any other errors are
 * shown to the user.
 * @param req
 * @param res
 * @param next
 */
exports.postLogin = (req, res, next) => {

    db.User.findAll()
        .then(users =>{
            if (users === null || users === undefined)
            {
                rn.renderLogin(res, "Some error occurred, is the database initialized?");
            }

            let fullName = checkLogin(req, res, users, "")
            req.session.regenerate(function(err){
                if(err)
                       throw new Error(err)
                req.session.user = {email: req.body.emailAddress, name: fullName}
                req.session.save(function(err) {
                    if(err)
                        next(err)
                    req.session.reload(function (err) {
                        if (err)
                            next(err)

                        res.redirect('/')

                    })
                });
            })
          }).catch(err=>{
        rn.renderLogin(res, err);
          })
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * this function checks if the data given by user is found in the database if not the function sends an appropriate
 * message if it is found indeed, it renders to the login, the comparison of passwords is done by decrypting the
 * password.
 * @param req
 * @param res
 * @param users database of users
 * @param name update the full name of the user in the session
 * @returns {string}
 */
function checkLogin(req, res, users, name){

    const bcrypt = require('bcryptjs');

    for(let user of users) {
        if (req.body.emailAddress === user.email  && bcrypt.compareSync(req.body.password, user.password)) {
            name= user.firstName + ' ' + user.lastName
            return name
        }
    }

    if(name === "")
    {
        throw new Error("either mail or password are incorrect, have you registered yet?");
    }
}



