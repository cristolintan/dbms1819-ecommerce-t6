var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var	port = process.env.PORT || 3000
var { Client } = require('pg');

var client = new Client({
	database: 'd4clggv62j2det',
	user: 'olnlnpdigamris',
	password: 'a62e045839dfb4785622cd9f61312f5727ab1148f3b752672fa306504750b8e5',
	host: 'ec2-23-23-242-163.compute-1.amazonaws.com',
	ssl: true,
	port: 5432
 });

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

app.use('/favicon.ico', express.static('/favicon.ico'));

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/member/Gerald', function(req, res) {
		res.render('member',{
			name: 'Gerald T. Mabandos',
			email: 'gmabandos@gmail.com',
			phone: '09201121171',
			imageurl: '/images/gerald.jpg',
			hobbies: ['Basketball', 'Computer Games']
		});
});

app.get('/member/Benz', function(req, res) {
		res.render('member',{
			name: 'Benjamin F. Matias',
			email: 'benz.matias13@gmail.com',
			phone: '09398070460',
			imageurl: '/images/benz.JPG',
			hobbies: ['Reading Manga', 'Computer Games']
		});
});

app.get('/products', (req, res) => {

	return client.query('SELECT * FROM productsdb;')

	.then((results) =>{
		console.log('results?', results);
		res.render('products', results);
		
	})
	.catch((err) => {
		console.log('error', err);
		res.send('Error!');
	});
});

app.get('/login', function(req, res) {
	res.render('login');
});
app.get('/products/{product_id}', function(req, res) {
	return client.query('SELECT * FROM productsdb;')
	.then((results) =>{
		console.log('results?', results);
		res.render('productdetail', results);
		
	})
	.catch((err) => {
		console.log('error', err);
		res.send('Error!');
	});
});


//Server
app.listen(port, function(){
	console.log('App Started on ' + port);
});


