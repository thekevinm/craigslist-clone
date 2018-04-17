var express = require('express')
var router = express.Router()
var multer = require('multer')
const conn = require('../lib/conn')
var multer = require('multer')
const path = require('path')
const auth = require('../middlewares/auth')

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
router.get('/categories/:category/:view?', (req, res, next) =>{
	
	const queryid = `
	SELECT id, title as catname
	FROM categories
	WHERE slug like ?
	`

	conn.query(queryid, [req.params.category], (err, results, fields) =>{
		// console.log('category id:',results[0])
		const catId = results[0].id
		const catName = results[0].catname

		const querylistings = `
		SELECT l.*, i.image_path
		FROM listings l
		LEFT JOIN categories c
			ON l.category_id = c.id
		LEFT JOIN images i
			ON l.id = i.listing_id
		WHERE l.category_id = ? OR c.parent_id = ?
		ORDER BY 
			l.id DESC
		`

		conn.query(querylistings, [catId, catId], (err2, results2, fields2) =>{

			data = {
				title: catName,
				listings: results2.map(result => {return{...result}}),
				slug: req.params.category,
				view: req.params.view
			}

			res.render('category', data)
		})
	})

})

// router.get('/categories/:category/:view?', auth, (req, res, next) =>{
// 	const sql = `
// 		SELECT
// 			l.*
// 		FROM
// 			listings l
// 		LEFT JOIN categories c
// 			ON l.category_id = c.id
// 		WHERE c.slug LIKE '${req.params.category}' 
// 	 `

// 	let data = {
// 		title: req.params.category, 
// 		category: req.params.category,
// 		view: req.params.view || 'list'
// 	}
	
// 	conn.query(sql, (err, results, fields) => {
// 			data.listings = results.map(result => {return {...result}})
// 			// console.log('data listing: ', data.listings)
// 			// console.log(results)
// 			res.render('category', data)
// 	})
	
// })


// router.get('/categories/:category', function(req, res, next) {
// 	let cat = req.params.category
// 	let sql = `
// 	SELECT
// 		categories.title,
// 		categories.slug,
// 		listings.description,
// 		listings.title
// 	FROM
// 		categories
// 	LEFT JOIN
// 		listings ON categories.id = listings.category_id
// 	where categories.title LIKE '%${cat}%'
// 	`
// 	var data = {
// 		description: [],
// 		title:[]
// 	}
// 	conn.query(sql, (err, results, fields) => {
// 		results.map(result => {
// 			data.description.push(result.description)
// 			data.title.push(result.title)
// 		})
// 		res.render('category', data)
// 	})	
// })

// GET SINGLE CATEGORY PAGE
router.get('/single-listing/:listingid', (req, res, next) =>{
	const sql = `
	SELECT
		l.*,
		i.*,
		c.title as catname, c.slug
	FROM 
		listings l
	LEFT JOIN images i
		ON l.id = i.listing_id
	LEFT JOIN categories c
		ON l.category_id = c.id
	WHERE
		l.id LIKE '${req.params.listingid}'
	`

	let data = {}

	conn.query(sql, (err, results, fields) =>{
		data.title = results[0].title
		data.id = results[0].listing_id
		data.category = results[0].catname
		data.catid = results[0].category_id
		data.description = results[0].description
		data.image = results[0].image_path
		data.slug = results[0].slug
		res.render('single-listing', data)
	})
})


// router.get('/single-listing/:listingid', (req, res, next) =>{
// 	const sql = `
// 	SELECT
// 		l.*,
// 		i.*,
// 		c.title, c.slug
// 	FROM 
// 		listings l
// 	LEFT JOIN images i
// 		ON l.id = i.listing_id
// 	LEFT JOIN categories c
// 		ON l.category_id = c.id
// 	WHERE
// 		l.id LIKE '${req.params.listingid}'
// 	`

// 	let data = {}

// 	conn.query(sql, (err, results, fields) =>{
// 		console.log(results[0])
// 		data.title = results[0].title
// 		data.id = results[0].listing_id
// 		data.category = results[0].title
// 		data.catid = results[0].category_id
// 		data.description = results[0].description
// 		data.image = results[0].image_path
// 		data.slug = results[0].slug
// 		res.render('single-listing', data)
// 	})
// })


// INPUT STUFF
router.get('/post', (req, res, next) => {
  let sql = `
    SELECT *
    FROM categories
  `
  let data = {
    title: 'add listing'
  }
  conn.query(sql, (err, results, fields) => {  		
  		data.categories = results.filter(result => result.parent_id === null)
  		data.categories.map( cat => {
  			let subcat = results.filter( result => {
  				if (result.parent_id === cat.id){
  					return result
  				}
  			})
  			cat.subcategories = subcat
  		})
  		res.render('post', data)
  	})
})

router.post('/add-post', upload.single('listingImg'), (req, res, next) =>{
	// console.log('request:', req.body)
	// console.log('file', req.file)
	const title = req.body.title
	const description = req.body.description
	const category = req.body.category
	const listingImg = req.body.listingImg

	const sql  = `
	INSERT INTO
		listings (title, description, category_id)
		VALUES (?, ?, ?)
	`

	conn.query(sql, [title, description, category], (err, results, fields) =>{
		let listing_id = results.insertId
		const image_path = '/images/' + req.file.filename
		const imgSql = `
		INSERT INTO
			images (listing_id, image_path)
			VALUES(?,?)
		`

		conn.query(imgSql, [listing_id, image_path], (error, queryres, queryfields) =>{
			data = {
				title: 'test title'
			}
			res.redirect('/')
		})
	})
})





// router.post('/add-post', upload.single('picture'), (req, res, next) => {
//     const description = req.body.desc
//     const title = req.body.title
//     const image_filename = '/images/' + req.file.filename
//     // const category = req.body.
  
//     const sql = `
//       INSERT INTO listings (description, title, image_path) 
//       VALUES (?, ?, ?)`
//     conn.query(sql, [description, title, image_filename], (err, results, fields) => {
//       res.redirect('/')
//     })
// })


module.exports = router