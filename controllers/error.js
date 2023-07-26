/**
 * a function that renders the site to an empty page showing an error if found
 * @param req
 * @param res rendering the user to the error page
 * @param next
 */
exports.getErrors = (req, res, next) => {
  res.status(500).render('errorHandler', { pageTitle: 'Page Not Found'});
};
