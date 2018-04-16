var express = require('express')
var router = express.Router()
var multer = require('multer')
const conn = require('../lib/conn')
var multer = require('multer')

var upload = multer({
	dest: path.join(__dirname, '../public/images'),
	limits: {fileSize: 1000000, files: 1}
})


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

// GET CATEGORY PAGE
router.get('/categories/:category', function(req, res, next) {
	let cat = req.params.category
	let sql = `
	SELECT
		categories.title,
		categories.slug,
		listings.description,
		listings.title
	FROM
		categories
	LEFT JOIN
		listings ON categories.id = listings.category_id
	where categories.title LIKE '%${cat}%'
	`
	var data = {
		description: [],
		title:[]
	}
	conn.query(sql, (err, results, fields) => {
		results.map(result => {
			data.description.push(result.description)
			data.title.push(result.title)
		})
		res.render('category', data)
	})	
})

// INPUT STUFF
router.get('/post', (req, res, next) => {
  let sql = `
    SELECT *
    FROM categories
    WHERE parent_id > 0
  `
  let data = {
    categories: []
  }
  conn.query(sql, (err, results, fields) => {
    // console.log(results)
    data.categories = results
    res.render('post', data)
  })
})

router.post('/post', upload.single('picture'), (req, res, next) => {
    const description = req.body.desc
    const title = req.body.title
    const image_filename = '/images/' + req.file.filename
    // const category = req.body.
  
    const sql = `
      INSERT INTO listings (description, title, image_path) 
      VALUES (?, ?, ?)`
    conn.query(sql, [description, title, image_filename], (err, results, fields) => {
      res.redirect('/')
    })
})


module.exports = router