//load the database
const db = require('../models');
//load the render library
const rn = require('./allRender');
//load cookies
const Cookies = require('cookies')
// encrypt the keys
const keys = ['keyboard cat']

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function is triggered when a submit button is clicked, builds and add the comment of that user to the comment
 * box.  the func checks if the session has expired or not before updating data
 * @param req request has the comment provided by the user
 * @param res response is either an error or rendering the feed
 * @param next
 */
exports.postFeed =  (req, res, next) => {
    let date = req.body.id
    let comment = req.body.comment.trim()
    let user=req.session.user.email.toLowerCase()

    if(user!=null) {
        let newComment =  db.Comments.build({comment: comment, userId: user, imgId: date, userName: req.session.user.name});
         newComment.save().then((u) => next())//rn.renderFeed(res, req.session.user.name))
            .catch((error) => {
                res.json(error);
            })
    }
    else
    {
        let cookies = new Cookies(req, res, {keys: keys});//inform the user that the session has expired
        cookies.set('message','session has expired Please Login again to resume it', {signed: true})
        let resource = {"sessionExpired": "no user"};
        res.json(resource);
    }
};
/**
 * this function is used to render the feed, it was done to distance render from res.json
 * @param req
 * @param res
 * @param next
 */
exports.postFeedSuccess =  (req, res, next) => {
    rn.renderFeed(res, req.session.user.name)
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function is triggered when the delete button is clicked finds the comment in the database and calls the
 * destroy function in order to delete it. the func checks if the session has expired or not before updating data
 * @param req id of the comment that wants to be deleted
 * @param res error messages
 * @param next
 * @returns {Promise<void>}
 */
exports.deleteComment= async (req, res, next) => {
    if(req.session.user) {
        await db.Comments.destroy({
            where: {
                id: parseInt(req.params.id)
            }
        }).catch(error =>{
            let errorMsg = {"msg": "error"};
            res.json(errorMsg)
        })
    }
    else {
        let cookies = new Cookies(req, res, {keys: keys});//inform the user that the session has expired
        cookies.set('message','session has expired Please Login again to resume it', {signed: true})
        let err = {"sessionExpired": "no user"};
        res.json(err);
    }
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function is used to get the feed as well as the comments of each image.
 *  the func checks if the session has expired or not before updating data
 * @param req session value
 * @param res an obj of all the details of the comment needed, or errors
 * @param next
 * @returns {Promise<void>}
 */
exports.getFeed = async (req, res, next) => {

    let jsonObj = [];
    if(req.session.user) {

        await db.Comments.findAll()
            .then(comments => {
                for (let comment of comments) {
                    if (comment.imgId === req.params.id) {

                        let item = {}
                        item["email"] = comment.userId
                        item["comment"] = comment.comment
                        item['currentEmail'] = req.session.user.email
                        item['sqlId'] = comment.id
                        item['userName'] = comment.userName
                        jsonObj.push(item)
                    }
                }
            }).catch(err => {
                let resource = {'error': err}
                res.json(resource);
            })

        res.json(jsonObj);
    }
    else
    {
        let cookies = new Cookies(req, res, {keys: keys});//inform the user that the session has expired
        cookies.set('message','session has expired Please Login again to resume it', {signed: true})
        let resource = {'sessionExpired': 'no user'}
        res.json(resource);
    }

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * this function is triggered when the logout button is clicked, which updated the session to null in order to
 * identify the expiration of the session. then render the user to the login page
 * @param req session value
 * @param res render to login page with logged out successfully message
 * @param next
 */
exports.getLogout = (req, res, next) => {
    req.session.user = null
    req.session.save(function(err) {
        if (err)
            next(err);
        req.session.regenerate(function(err){
            if(err)
                next(err);
            rn.renderLogin(res, "logged out successfully")
        })
    })

}

