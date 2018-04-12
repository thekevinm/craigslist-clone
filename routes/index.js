var express = require('express');
var router = express.Router();
var multer = require('multer')
const conn = require('../lib/conn')


// const upload = multer({})

/* GET home page. */
router.get('/', function(req, res, next) {
  const sql = `
	SELECT
		title
	FROM
		categories
  `

  // conn.connect()
  conn.query(sql, (err, results, fields) => {
  	console.log(results)
  	let data = {
  		title: 'Home',
  		categories: results
  	}
  	res.render('home', data)
  })
  // conn.end()

  // res.render('home')
});

module.exports = router;
