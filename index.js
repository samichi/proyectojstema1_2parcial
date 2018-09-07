
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var app = express();
var exphbs = require('express-handlebars');
var http = require('http');
var bodyParser = require('body-parser');
const pg = require('pg');
pg.defaults.ssl = true;

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/proyecto';
var conString = "postgres://xpbzhtflffydyb:52508071ffd004d8f9dca6855d0492dfa70ccebf8bee3e6efe311395861bde18@ec2-107-21-233-72.compute-1.amazonaws.com:5432/d22fba2ecbqfdm";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '/public')));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');


app.get('/listausuarios', (req, res, next)=>{
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM infante', function(err, result){
      if(err){
        return console.error('error al ejecutar query', err);
      }
      usuarioJuego.end();
      console.log(result);
      return res.json(result.rows);
    });
  });
});


app.get('/', (req, res) => res.render('home'));

//app.get('/listausuarios', (req, res)=> res.render('listausuarios'));

app.get('/excursiones', (req, res) => res.render('excursiones'));

app.get('/capitulo', (req, res)=> res.render('capitulo'));

app.get('/actividad', (req, res)=> res.render('actividad'));

app.get('/listaexcursiones', (req, res) => res.render('listaexcursiones'));

app.get('/loginadmin', (req, res) => res.render('loginadmin'));

app.get('/menuprincipal', (req, res) => res.render('menuprincipal'));

//app.get('/agregarexcursion', (req, res) => res.render('agregarexcursion'));

app.post('/agregarexcursion', (req, res) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
      client.query("INSERT INTO  excursion  (nombre ,  urlimg) VALUES ('"+req.body.nombre+"', '"+req.body.urlimg+"');", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result);
      }); 
  });
});

app.post('/agregarexcursion', (req, res) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
      client.query("INSERT INTO  excursion  (nombre ,  urlimg) VALUES ('"+req.body.nombre+"', '"+req.body.urlimg+"');", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result);
      }); 
  });
});

app.post('/eliminarexcursionid', (req, res, next) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
     
      client.query("DELETE FROM excursion WHERE id="+ req.body.id +";", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result.rows);
      });  
  });
});

//var fortune=require('./lib/fortune.js');

//app.get('/about', (req, res) => res.render('about', {fortune: fortune.getFortune()}));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


/*
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

var exphbs  = require('express-handlebars');
const knex = require('./db/knex');
var app = express();

//body parser
var bodyParser = require('body-parser');
var fortune = require('./lib/fortune.js');



app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



app.use(bodyParser.urlencoded({extended : true}));

app.post('/process', function (req, res){
	console.log('formulario:' + req.query.form);
	console.log('nombre:' + req.body.name);
	console.log('email:' + req.body.email);
	
	
});
*/