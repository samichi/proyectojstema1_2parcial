const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var app = express();
var exphbs = require('express-handlebars');

app.use(express.static(path.join(__dirname, '/public')));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.get('/', (req, res) => res.render('home'));

app.get('/excursiones', (req, res) => res.render('excursiones'));

app.get('/listaexcursiones', (req, res) => res.render('listaexcursiones'));

app.get('/loginadmin', (req, res) => res.render('loginadmin'));

//var fortune=require('./lib/fortune.js');

//app.get('/about', (req, res) => res.render('about', {fortune: fortune.getFortune()}));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));