var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var config = require('./config.js');
var	port = process.env.PORT || 3000
var { Client } = require('pg');


console.log('config db', config.db);
var client = new Client(config.db);

// connect to database
client.connect()
	.then(function() {
		console.log('Connected to database!')
	})
	.catch(function(err) {
		console.log('Cannot connect to database!')
	});

var app = express();

//Set Public folder
app.use(express.static(path.join(__dirname + '/public')));

//Assign Handlebars To .handlebars files
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

//Set Default extension .handlebars
app.set('view engine', 'handlebars');

/* app.get('/', function(req, res) {
	res.render('products');
});
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/member/Gerald', function(req, res) {
		res.render('member',{
			title: 'Profile Page of Gerald',
			name: 'Gerald T. Mabandos',
			email: 'gmabandos@gmail.com',
			phone: '09201121171',
			imageurl: '/images/image_gerald.jpg',
			hobbies: ['Basketball', 'Computer Games'],
			background: '/images/background.jpg'
		});
});

app.get('/member/Benz', function(req, res) {
		res.render('member',{
			title: 'Profile Page of Benz',
			name: 'Benjamin F. Matias',
			email: 'benz.matias13@gmail.com',
			phone: '09398070460',
			imageurl: '/images/image_benz.jpg',
			hobbies: ['Read Manga/Manhwa/Manhua', 'Computer Games'],
			background: '/images/grid.gif'
		});
});

app.get('/', (req, res) => {
	
	client.query('SELECT * FROM products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('products',{
			data: list
		});
	});
});

app.get('/products/:id', (req, res) => {
	var id = req.params.id;
	client.query('SELECT * FROM products LEFT JOIN brands ON products.brand_id=brands.brand_id RIGHT JOIN categories ON products.category_id=categories.category_id', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			if (i==id) {
				list.push(data.rows[i]);
			}
		}
		res.render('productdetail',{
			data: list
		});
	});
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.get('/brands', function(req, res) {
	client.query('SELECT * FROM brands')
	.then((result)=>{
		console.log('results?', result);
		res.render('list_brand', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
});

app.get('/brand/create', function(req, res) {
	res.render('create_brand');
});

app.post('/brand/create/saving', function(req, res) {
	client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('"+req.body.brand_name+"','"+req.body.brand_description+"')");
	res.redirect('/brands');
});

app.get('/categories', function(req, res) {
	client.query('SELECT * FROM categories')
	.then((result)=>{
		console.log('results?', result);
		res.render('list_category', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
});

app.get('/category/create', function(req, res) {
	res.render('create_category');
});

app.post('/category/create/saving', function(req, res) {
	client.query("INSERT INTO categories (category_name) VALUES ('"+req.body.category_name+"')");
	res.redirect('/categories');
});

app.get('/product/create', function(req, res) {
	var category = [];
	var brand = [];
	var both = [];
	client.query('SELECT * FROM categories')
	.then((result)=>{
		category = result.rows;
		console.log('category:', category);
		both.push(category);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
	client.query('SELECT * FROM brands')
	.then((result)=>{
		brand = result.rows;
		both.push(brand);
		console.log(brand);
		console.log(both );
		res.render('create_product', {
			rows: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
});

app.post('/product/create/saving', function(req,res) {
	client.query("INSERT INTO products (product_picture,product_name,product_description,brand_tagline,product_price,warranty,category_id,brand_id) VALUES ('"+req.body.product_picture+"','"+req.body.product_name+"','"+req.body.product_description+"','"+req.body.brand_tagline+"','"+req.body.product_price+"','"+req.body.warranty+"','"+req.body.category_id+"','"+req.body.brand_id+"')")
	.then(result=>{
		console.log('results?', result);
		res.redirect('/');
	})
	.catch(err => {
		console.log('error',err);
		res.send('Error!');
	});
	
});



app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product Name: ${req.body.product_name}</li>
			<li>Quantity: ${req.body.quantity}</li>
		</ul>
`;



//nodemailer
	let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'geraldbenjamin.theexpertcoding@gmail.com', 
            pass: 'gerald_benjamin' 
        }
    });

    let mailOptions = {
        from: '"T6 Mailer" <geraldbenjamin.theexpertcoding@gmail.com>',
        to: 'benz.matias13@gmail.com, gmabandos@gmail.com, ${req.body.email}',
        subject: 'T6 Contact Request',
        //text: req.body.name,
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		
        client.query('SELECT * FROM products', (req, data)=>{
			var list = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					list.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: list,
				msg: '---Email has been sent---'
			});
		});
     });
});

//Server
app.listen(port, function(){
	console.log('App Started on ' + port);
});


