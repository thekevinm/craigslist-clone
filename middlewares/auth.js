module.exports = (req, res, next) => {
	if (req.session.authenticated) {
		var tens = 100000
		req.session.cookie.expires = new Date(Date.now() + tens)
		req.session.cookie.maxAge = tens
		next()
	} else {
		res.redirect('/login')
	}
}