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
      return res.json(result);
    });
  });
});

app.get('/', (req, res) => res.render('home'));

app.get('/excursiones', (req, res) => res.render('excursiones'));

app.get('/listaexcursiones', (req, res) => res.render('listaexcursiones'));

app.get('/loginadmin', (req, res) => res.render('loginadmin'));

app.get('/menuprincipal', (req, res) => res.render('menuprincipal'));

//var fortune=require('./lib/fortune.js');

//app.get('/about', (req, res) => res.render('about', {fortune: fortune.getFortune()}));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));