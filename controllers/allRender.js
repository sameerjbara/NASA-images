




module.exports= {
    renderLogin(res, message) {
        res.render('login', {
            pageTitle: 'log-in',
            message: message,
        });
    },


    renderRegister(res, user, message) {
        res.render('register', {
            pageTitle: 'register',
            theUser: user,
            errorMsg: message
        });
    },
     renderConfirm(res, message){
    res.render('confirm-pass', {
        pageTitle: 'confirm-pass',
        message: message
    });
    },

    renderFeed(res, name){
    res.render('feed', {
        pageTitle: 'feed',
        name: name,
    });

},
}