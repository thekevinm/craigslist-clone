var express = require('express')
var router = express.Router()
var multer = require('multer')
const conn = require('../lib/conn')


// const upload = multer({})

/* GET home page. */
router.get('/', function(req, res, next) {
  const sql = `
	SELECT
		*
	FROM
		categories
  `
	let data = {
  		title: 'Home'
  	}

  conn.query(sql, (err, results, fields) => {
  	data.categories = results.filter(result => result.parent_id === null)
  	data.categories.map(cat => {
  		let subcat = results.filter(result => {
  			if(result.parent_id === cat.id){
  				return result
  			}
  		})
  		cat.subcat = subcat
  	})
  	res.render('home', data)
  	// res.json(data)
  })
   
  

  // res.render('home')
})

router.get('/:category', function(req, res, next) {
	// console.log(req)
	const sql = `
	SELECT
		*
	FROM
		listings
	`
	let data = {
		title: 'Category',
		category: req.params.category
	}
	conn.query(sql, (err, results, fields) => {
  	data.categories = results.filter(result => result.parent_id === null)
  	data.categories.map(cat => {
  		let subcat = results.filter(result => {
  			if(result.parent_id === cat.id){
  				return result
  			}
  		})
  		cat.subcat = subcat
  	})
})
	res.render('category', data)
})

module.exports = router