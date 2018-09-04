var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var moment = require('moment');
var port = process.env.PORT || 3000;
var config = require('./config.js');
var { Client } = require('pg');
console.log('config db', config.db);
var client = new Client(config.db);

// connect to database
client.connect()
  .then(function () {
    console.log('Connected to database!');
  })
  .catch(function (err) {
    if (err) throw err;
    console.log('Cannot connect to database!');
  });

var app = express();

// Set Public folder
app.use(express.static(path.join(__dirname, '/public')));

// Assign Handlebars To .handlebars files
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

// Set Default extension .handlebars
app.set('view engine', 'handlebars');

/* app.get('/', function(req, res) {
res.render('products');
});
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/member/Gerald', function (req, res) {
  res.render('member', {
    title: 'Profile Page of Gerald',
    name: 'Gerald T. Mabandos',
    email: 'gmabandos@gmail.com',
    phone: '09201121171',
    imageurl: '/images/image_gerald.jpg',
    hobbies: ['Basketball', 'Computer Games'],
    background: '/images/background.jpg'
  });
});

app.get('/member/Benz', function (req, res) {
  res.render('member', {
    title: 'Profile Page of Benz',
    name: 'Benjamin F. Matias',
    email: 'benz.matias13@gmail.com',
    phone: '09398070460',
    imageurl: '/images/image_benz.jpg',
    hobbies: ['Read Manga/Manhwa/Manhua', 'Computer Games'],
    background: '/images/grid.gif'
  });
});

/* ---------- CLIENT SIDE ---------- */
app.get('/', (req, res) => {
  client.query('SELECT * FROM products ORDER BY product_id ASC', (req, data) => {
    var list = [];
    for (var i = 0; i < data.rows.length; i++) {
      list.push(data.rows[i]);
    }
    res.render('client/products', {
      data: list
    });
  });
});

app.get('/products/:id', (req, res) => {
  client.query('SELECT products.product_id AS product_id, products.product_name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.product_price AS product_price, products.product_description AS product_description, products.brand_tagline AS brand_tagline, products.product_picture AS product_picture, products.warranty AS warranty, brands.brand_name AS brand_name, brands.brand_description AS brand_description, categories.category_name AS category_name FROM products LEFT JOIN brands ON products.brand_id=brands.brand_id RIGHT JOIN categories ON products.category_id=categories.category_id WHERE products.product_id = ' + req.params.id + ';')
    .then((results) => {
      console.log('results?', results);
      res.render('client/productdetail', {
        product_name: results.rows[0].product_name,
        product_description: results.rows[0].product_description,
        brand_tagline: results.rows[0].brand_tagline,
        product_price: results.rows[0].product_price,
        warranty: results.rows[0].warranty,
        product_picture: results.rows[0].product_picture,
        brand_name: results.rows[0].brand_name,
        brand_description: results.rows[0].brand_description,
        category_name: results.rows[0].category_name,
        product_id: results.rows[0].product_id
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/brands', function (req, res) {
  client.query('SELECT * FROM brands ')
    .then((result) => {
      console.log('results?', result);
      res.render('client/list_brand', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/categories', function (req, res) {
  client.query('SELECT * FROM categories')
    .then((result) => {
      console.log('results?', result);
      res.render('client/list_category', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.post('/products/:id/send', function (req, res) {
  client.query("INSERT INTO customers (customer_email,first_name,last_name,street,municipality,province,zipcode) VALUES ('" + req.body.customer_email + "','" + req.body.first_name + "','" + req.body.last_name + "','" + req.body.street + "','" + req.body.municipality + "','" + req.body.province + "','" + req.body.zipcode + "') ON CONFLICT (customer_email) DO UPDATE SET first_name = '" + req.body.first_name + "', last_name = '" + req.body.last_name + "', street = '" + req.body.street + "',municipality = '" + req.body.municipality + "',province = '" + req.body.province + "',zipcode = '" + req.body.zipcode + "' WHERE customers.customer_email ='" + req.body.customer_email + "';");
  client.query("SELECT customer_id FROM customers WHERE customer_email = '" + req.body.customer_email + "';")
    .then((results) => {
      var id = results.rows[0].customer_id;
      console.log(id);
      var date = moment().format('llll');
      client.query('INSERT INTO orders (customer_id,product_id,quantity,purchase_date) VALUES (' + id + ',' + req.params.id + ",'" + req.body.quantity + "','" + date + "')")
        .then((results) => {
          var maillist = ['geraldbenjamin.theexpertcoding@gmail.com', req.body.customer_email];
          var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: 'geraldbenjamin.theexpertcoding@gmail.com',
              pass: 'gerald_benjamin'
            }
          });
          const mailOptions = {
            from: '"T6 Mailer" <geraldbenjamin.theexpertcoding@gmail.com>', // sender address
            to: maillist, // list of receivers
            subject: 'Order Details', // Subject line
            html:
       '<p>You have a new contact request</p>' +
       '<h3>Customer Details</h3>' +
       '<ul>' +
        '<li>Customer Name: ' + req.body.first_name + ' ' + req.body.last_name + '</li>' +
        '<li>Email: ' + req.body.customer_email + '</li>' +
        '<li>Order ID: ' + req.body.order_id + '</li>' +
        '<li>Product Name: ' + req.body.product_name + '</li>' +
        '<li>Quantity: ' + req.body.quantity + '</li>' +
       '</ul>'
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response); ;
            res.redirect('/');
          });
        })
        .catch((err) => {
          console.log('error', err);
          res.send('Error!');
        });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

/* -------- ADMIN SIDE -------- */
app.get('/admin', (req, res) => {
  client.query('SELECT * FROM products ORDER BY product_id ASC', (req, data) => {
    var list = [];
    for (var i = 0; i < data.rows.length; i++) {
      list.push(data.rows[i]);
    }
    res.render('admin/products', {
      layout: 'admin',
      data: list
    });
  });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/admin/brands', function (req, res) {
  var list = [];
  client.query('SELECT * FROM brands;')
    .then((result) => {
      list = result.rows;
      console.log('results?', result);
      res.render('admin/list_brand', {
        rows: list,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/brand/create', function (req, res) {
  res.render('admin/create_brand', {
    layout: 'admin'
  });
});

app.post('/brand/create/saving', function (req, res) {
  client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('" + req.body.brand_name + "','" + req.body.brand_description + "')ON CONFLICT (brand_name) DO NOTHING;");
  res.redirect('/admin/brands');
});

app.get('/admin/categories', function (req, res) {
  var list = [];
  client.query('SELECT * FROM categories')
    .then((result) => {
      list = result.rows;
      console.log('results?', result);
      res.render('admin/list_category', {
        rows: list,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/category/create', function (req, res) {
  res.render('create_category', {
    layout: 'admin'
  });
});

app.post('/category/create/saving', function (req, res) {
  client.query("INSERT INTO categories (category_name) VALUES ('" + req.body.category_name + "') ON CONFLICT (category_name) DO NOTHING;");
  res.redirect('/admin/categories');
});

app.get('/admin/customers', function (req, res) {
  var list = [];
  client.query('SELECT * FROM customers ORDER BY customer_id DESC')
    .then((result) => {
      list = result.rows;
      console.log('results?', result);
      res.render('admin/list_customer', {
        rows: list,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/customer/:id', (req, res) => {
  var list = [];
  client.query('SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.customer_email AS customer_email,customers.street AS street,customers.municipality AS municipality,customers.province AS province,customers.zipcode AS zipcode,products.product_name AS product_name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.customer_id=orders.customer_id INNER JOIN products ON products.product_id=orders.product_id WHERE customers.customer_id = ' + req.params.id + 'ORDER BY purchase_date DESC;')
    .then((result) => {
      list = result.rows;
      console.log('results?', result);
      res.render('admin/customerdetail', {
        rows: list,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/admin/orders', function (req, res) {
  var list = [];
  var date = [];
  client.query('SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.customer_email AS customer_email,products.product_name AS product_name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.customer_id=orders.customer_id INNER JOIN products ON products.product_id=orders.product_id ORDER BY purchase_date DESC;')
    .then((result) => {
      date = moment('purchase_date').format('llll');
      list = result.rows;
      console.log('results?', result);
      res.render('admin/list_order', {
        purchase_date: date,
        rows: list,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/product/create', function (req, res) {
  var category = [];
  var brand = [];
  var both = [];
  client.query('SELECT * FROM categories')
    .then((result) => {
      category = result.rows;
      console.log('category:', category);
      both.push(category);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT * FROM brands;')
    .then((result) => {
      brand = result.rows;
      both.push(brand);
      console.log(brand);
      console.log(both);
      console.log('results?', result);
      res.render('admin/create_product', {
        rows: both,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.post('/product/create/saving', function (req, res) {
  client.query("INSERT INTO products (product_picture,product_name,product_description,brand_tagline,product_price,warranty,category_id,brand_id) VALUES ('" + req.body.product_picture + "','" + req.body.product_name + "','" + req.body.product_description + "','" + req.body.brand_tagline + "','" + req.body.product_price + "','" + req.body.warranty + "','" + req.body.category_id + "','" + req.body.brand_id + "') ON CONFLICT (product_name) DO NOTHING;")
    .then(result => {
      console.log('results?', result);
      res.redirect('/admin');
    })
    .catch(err => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/product/update/:id', function (req, res) {
  var category = [];
  var brand = [];
  var product = [];
  var both = [];
  client.query('SELECT * FROM categories')
    .then((result) => {
      category = result.rows;
      console.log('category:', category);
      both.push(category);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT * FROM brands')
    .then((result) => {
      brand = result.rows;
      console.log('brand:', brand);
      both.push(brand);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT products.product_id AS product_id, products.product_name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.product_price AS product_price, products.product_description AS product_description, products.brand_tagline AS brand_tagline, products.product_picture AS product_picture, products.warranty AS warranty FROM products LEFT JOIN brands ON products.brand_id=brands.brand_id RIGHT JOIN categories ON products.category_id=categories.category_id WHERE products.product_id = ' + req.params.id + ';')
    .then((result) => {
      product = result.rows[0];
      both.push(product);
      console.log(product);
      console.log(both);
      res.render('update_product', {
        rows: result.rows[0],
        brand: both,
        layout: 'admin'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.post('/product/update/:id/saving', function (req, res) {
  client.query("UPDATE products SET product_picture = '" + req.body.product_picture + "', product_name = '" + req.body.product_name + "', product_description = '" + req.body.product_description + "', brand_tagline = '" + req.body.brand_tagline + "', product_price = '" + req.body.product_price + "', warranty = '" + req.body.warranty + "', category_id = '" + req.body.category_id + "', brand_id = '" + req.body.brand_id + "' WHERE product_id = '" + req.params.id + "';")
    .then(result => {
      console.log('results?', result);
      res.redirect('/admin');
    })
    .catch(err => {
      console.log('error', err);
      res.send('Error!');
    });
});

// Server
app.listen(port, function () {
  console.log('App Started on ' + port);
});
