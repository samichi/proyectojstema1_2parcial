const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var app = express();
var exphbs = require('express-handlebars');
var http = require('http');
var bodyParser = require('body-parser');
const pg = require('pg');
pg.defaults.ssl = true;
const pug = require('pug');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var id_infante_jugando;
var puntaje_infante_jugando;

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/proyecto';
var conString = "postgres://xpbzhtflffydyb:52508071ffd004d8f9dca6855d0492dfa70ccebf8bee3e6efe311395861bde18@ec2-107-21-233-72.compute-1.amazonaws.com:5432/d22fba2ecbqfdm";

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'pug');

app.get('/', (req, res) => res.render('home'));

/*

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.get('/', (req, res) => res.render('home'));

//app.get('/listausuarios', (req, res)=> res.render('listausuarios'));

app.get('/excursiones', (req, res) => res.render('excursiones'));

app.get('/capitulo', (req, res)=> res.render('capitulo'));

app.get('/actividad', (req, res)=> res.render('actividad'));

app.get('/listaexcursiones', (req, res) => res.render('listaexcursiones'));

app.get('/loginadmin', (req, res) => res.render('loginadmin'));

app.get('/menuprincipal', (req, res) => res.render('menuprincipal'));

//app.get('/agregarexcursion', (req, res) => res.render('agregarexcursion'));

*/

////////////////////////////EXCURSION///////////////////////////////

app.get('/listaexcursion', (req, res, next)=>{
  var excursionList = [];
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM excursion;', function(err, result){
      if(err){
        return console.error('error al ejecutar query', err);
      }else{
        for (var i = 0; i < result.rows.length; i++) {
          console.log(result);
		  		var excursion = {
		  			'nombre':result.rows[i].nombre,
		  			'urlimg':result.rows[i].urlimg
		  		}
		  		// Add object into array
          excursionList.push(excursion);
        }
      }
      usuarioJuego.end();
      //console.log(result);
      //return res.json(result.rows);
      res.render('listaexcursion', {"excursionList": excursionList});
    });
  });
});

app.post('/agregarexcursion', (req, res, next) => {
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

app.delete('/eliminarexcursionid', (req, res, next) => {
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

app.put('/actualizarexcursion',(req,res)=>{
  var client = new pg.Client(conString);
 
  client.connect(function(err) {
     if(err) {
         return console.error('No es posible conectarse con el servidor', err);
         return res.status(500).json({success: false, data: err});
     }

     client.query("UPDATE excursion SET nombre ='"+req.body.nombre+"', urlimg='"+req.body.urlimg+"' WHERE id='" + req.body.id + "';", function(err, result) {
         
         if(err) {
             return console.error('Error al ejecutar el query', err);
         }
         
         //console.log(result);
          client.end();
         return res.json(result);
     });
 });
});

//////////////////////////////USUARIOS///////////////////////////////////

app.get('/listausuarios', (req, res, next)=>{
  var userList = [];
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM users', function(err, result){
      var usuario;
      if(err){
        return console.error('Error al ejecutar query', err);
      } else{
        for (var i = 0; i < result.rows.length; i++) {
          console.log(result);
		  		var usuario = {
		  			'firstName':result.rows[i].firstName,
		  			'lastName':result.rows[i].lastName,
		  			'email':result.rows[i].email,
            'rol':result.rows[i].rol
		  		}
		  		// Add object into array
          userList.push(usuario);
        }
      }
      usuarioJuego.end();
      //console.log(capList);
      //console.log(result);
      //return res.json(result.rows);
      res.render('listausuarios', {"userList": userList});
    });
  });
});

app.post('/agregarusuario', (req, res, next) => {
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

app.delete('/eliminarusuarioid', (req, res, next) => {
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

app.put('/actualizarusuario',(req,res)=>{
  var client = new pg.Client(conString);
 
  client.connect(function(err) {
     if(err) {
         return console.error('No es posible conectarse con el servidor', err);
         return res.status(500).json({success: false, data: err});
     }

     client.query("UPDATE excursion SET nombre ='"+req.body.nombre+"', urlimg='"+req.body.urlimg+"' WHERE id='" + req.body.id + "';", function(err, result) {
         
         if(err) {
             return console.error('Error al ejecutar el query', err);
         }
         
         //console.log(result);
          client.end();
         return res.json(result);
     });
 });
});

//////////////////////////////CAPITULO///////////////////////////////////

app.get('/listacapitulo', (req, res, next)=>{
  var capList = [];
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM capitulo', function(err, result){
      var capitulo;
      if(err){
        return console.error('Error al ejecutar query', err);
      } else{
        for (var i = 0; i < result.rows.length; i++) {
          console.log(result);
		  		var capitulo = {
		  			'titulo':result.rows[i].titulo,
		  			'imgcapitulo':result.rows[i].imgcapitulo,
		  			'descripcion':result.rows[i].descripcion,
            'creditos':result.rows[i].creditos,
            'urlvideo':result.rows[i].urlvideo,
            'urlactividad':result.rows[i].urlactividad,
            'urlrespuesta':result.rows[i].urlrespuesta,
            'id_excursion':result.rows[i].id_excursion
		  		}
		  		// Add object into array
          capList.push(capitulo);
        }
      }
      usuarioJuego.end();
      //console.log(capList);
      //console.log(result);
      //return res.json(result.rows);
      res.render('listacapitulo', {"capList": capList});
    });
  });
});

app.post('/agregarcapitulo', (req, res, next)=>{
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
      client.query("INSERT INTO  capitulo  (titulo ,  imgcapitulo, descripcion, creditos, urlvideo, urlactividad, urlrespuesta, id_excursion) VALUES ('"+req.body.titulo+"', '"+req.body.imgcapitulo+"', '"+req.body.descripcion+"', '"+req.body.creditos+"', '"+req.body.urlvideo+"', '"+req.body.urlrespuesta+"', '"+req.body.id_excursion+"');", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result);
      }); 
  });
});


///////////////////////////////////RESPUESTA/////////////////////////////////////

app.get('/leerrespuesta', (req, res, next)=>{
  var respuestaList = [];
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM respuesta;', function(err, result){
      if(err){
        return console.error('Error al ejecutar query', err);
      }else{
        for (var i = 0; i < result.rows.length; i++) {
          console.log(result);
		  		var respuesta = {
		  			'resp_infante':result.rows[i].resp_infante,
		  			'id_capitulo':result.rows[i].id_capitulo,
		  			'id_infante':result.rows[i].id_infante
		  		}
		  		// Add object into array
          respuestaList.push(respuesta);
        }
      }
      usuarioJuego.end();
      //console.log(result);
      //return res.json(result.rows);
      res.render('listarespuesta', {"respuestaList": respuestaList});
    });
  });
});

///////////////////////////////////IMAGEN/////////////////////////////////////

app.get('/leerimagen', (req, res, next)=>{
  var imagenList = [];
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM imagen;', function(err, result){
      if(err){
        return console.error('Error al ejecutar query', err);
      }else{
        for (var i = 0; i < result.rows.length; i++) {
          console.log(result);
		  		var imagen = {
		  			'urlimagen':result.rows[i].urlimagen,
		  			'id_capitulo':result.rows[i].id_capitulo
		  		}
		  		// Add object into array
          imagenList.push(imagen);
        }
      }
      usuarioJuego.end();
      //console.log(result);
      //return res.json(result.rows);
      res.render('listaimagen', {"imagenList": imagenList});
    });
  });
});


/*
****************************************************************************************
****************************************************************************************
*                                       USUARIO
****************************************************************************************
****************************************************************************************
*/

//************************************** INFANTE **************************************//

app.get('/listainfante', (req, res, next)=>{
    var infanteList = [];
    var usuarioJuego = new pg.Client(conString);
    usuarioJuego.connect(function(err){
      if(err){
        return console.error('No se pudo conectar al servidor');
        return res.status(500).json({
          success: false, data: err});
      }
      usuarioJuego.query('SELECT * FROM infante;', function(err, result){
        if(err){
          return console.error('Error al ejecutar query', err);
        }else{
          for (var i = 0; i < result.rows.length; i++) {
            console.log(result);
                    var infante = {
                      'id':result.rows[i].id,
                        'nombre':result.rows[i].nombre,
                        'urlimagen':result.rows[i].urlimagen,
                        'puntaje':result.rows[i].puntaje
                    }
                    // Add object into array
            infanteList.push(infante);
          }
        }
        usuarioJuego.end();
        //console.log(result);
        //return res.json(result.rows);
        res.render('listainfante', {"infanteList": infanteList});
      });
    });
  });

  app.get('/leerexcursionusuario', (req, res, next)=>{
    var id_infante_jugando = parseInt(req.body.id);
    var puntaje_infante_jugando = parseInt(req.body.puntaje);
    console.log('id_infante_jugando = '+id_infante_jugando);
    console.log('puntaje_infante_jugando = '+puntaje_infante_jugando);
    var excursionList = [];
    var usuarioJuego = new pg.Client(conString);
    usuarioJuego.connect(function(err){
      if(err){
        return console.error('No se pudo conectar al servidor');
        return res.status(500).json({
          success: false, data: err});
      }
      usuarioJuego.query('SELECT * FROM Excursion;', function(err, result){
        if(err){
          return console.error('Error al ejecutar query', err);
        }else{
          for (var i = 0; i < result.rows.length; i++) {
            console.log(result);
                    var excursion = {
                        'id':result.rows[i].id,
                        'nombre':result.rows[i].nombre,
                        'urlimg':result.rows[i].urlimg
                    }
                    // Add object into array
            excursionList.push(excursion);
          }
        }
        usuarioJuego.end();
        //console.log(result);
        //return res.json(result.rows);
        res.render('leerexcursionusuario', {"excursionList": excursionList});
      });
    });
  });

  app.get('/listacapituloporexcursion', (req, res, next)=>{
    var capExcList = [];
    var usuarioJuego = new pg.Client(conString);
    console.log("id_excursion"+req.body.id);
    usuarioJuego.connect(function(err){
      if(err){
        return console.error('No se pudo conectar al servidor');
        return res.status(500).json({
          success: false, data: err});
      }
      usuarioJuego.query('SELECT * FROM capitulo;', function(err, result){
        var capitulo;
        if(err){
          return console.error('Error al ejecutar query', err);
        } else{
          for (var i = 0; i < result.rows.length; i++) {
            console.log(result);
            var capExc = {
              'titulo':result.rows[i].titulo,
              'imgcapitulo':result.rows[i].imgcapitulo,
              'descripcion':result.rows[i].descripcion,
              'creditos':result.rows[i].creditos,
              'urlvideo':result.rows[i].urlvideo,
              'urlactividad':result.rows[i].urlactividad,
              'urlrespuesta':result.rows[i].urlrespuesta,
              'id_excursion':result.rows[i].id_excursion
            }
            // Add object into array
            capExcList.push(capExc);
          }
        }
        usuarioJuego.end();
        //console.log(capList);
        //console.log(result);
        //return res.json(result.rows);
        res.render('listacapituloporexcursion', {"capList": capExcList});
      });
    });
  });

///////////////////////////////////REST API////////////////////////////////////////////

/* EXCURSION */
app.get('/restleeraexcursion', (req, res, next)=>{
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM excursion;', function(err, result){
      if(err){
        return console.error('error al ejecutar query', err);
      }
      usuarioJuego.end();
      console.log(result);
      return res.json(result.rows);
    });
  });
});

app.post('/restagregarexcursion', (req, res, next) => {
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

app.delete('/resteliminarexcursionid', (req, res, next) => {
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

app.put('/restactualizarexcursion',(req,res)=>{
  var client = new pg.Client(conString);
 
  client.connect(function(err) {
     if(err) {
         return console.error('No es posible conectarse con el servidor', err);
         return res.status(500).json({success: false, data: err});
     }

     client.query("UPDATE excursion SET nombre ='"+req.body.nombre+"', urlimg='"+req.body.urlimg+"' WHERE id='" + req.body.id + "';", function(err, result) {
         
         if(err) {
             return console.error('Error al ejecutar el query', err);
         }
         
         //console.log(result);
          client.end();
         return res.json(result);
     });
 });
});

/* INFANTE */

app.get('/restleerinfante', (req, res, next)=>{
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM infante;', function(err, result){
      if(err){
        return console.error('error al ejecutar query', err);
      }
      usuarioJuego.end();
      console.log(result);
      return res.json(result.rows);
    });
  });
});

app.post('/restagregarinfante', (req, res, next) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
      client.query("INSERT INTO  infante  (nombre ,  urlimagen, puntaje) VALUES ('"+req.body.nombre+"', '"+req.body.urlimagen+"', '"+req.body.puntaje+"');", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result);
      }); 
  });
});

app.delete('/resteliminarinfanteid', (req, res, next) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
     
      client.query("DELETE FROM infante WHERE id="+ req.body.id +";", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result.rows);
      });  
  });
});

app.put('/restactualizarinfante',(req,res)=>{
  var client = new pg.Client(conString);
 
  client.connect(function(err) {
     if(err) {
         return console.error('No es posible conectarse con el servidor', err);
         return res.status(500).json({success: false, data: err});
     }

     client.query("UPDATE infante SET nombre ='"+req.body.nombre+"', urlimagen='"+req.body.urlimagen+"', puntaje='"+req.body.puntaje+"' WHERE id='" + req.body.id + "';", function(err, result) {
         
         if(err) {
             return console.error('Error al ejecutar el query', err);
         }
         
         //console.log(result);
          client.end();
         return res.json(result);
     });
 });
});

/* USERS */

app.get('/restleerusuario', (req, res, next)=>{
  var usuarioJuego = new pg.Client(conString);
  usuarioJuego.connect(function(err){
    if(err){
      return console.error('No se pudo conectar al servidor');
      return res.status(500).json({
        success: false, data: err});
    }
    usuarioJuego.query('SELECT * FROM users;', function(err, result){
      if(err){
        return console.error('error al ejecutar query', err);
      }
      usuarioJuego.end();
      console.log(result);
      return res.json(result.rows);
    });
  });
});

app.post('/restagregarusuario', (req, res, next) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
      client.query("INSERT INTO users  (firstName, lastName, email, password, rol) VALUES ('"+req.body.firstName+"', '"+req.body.lastName+"', '"+req.body.email+"', '"+req.body.password+"', '"+req.body.rol+"');", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result);
      }); 
  });
});

app.delete('/resteliminarusuarioid', (req, res, next) => {
  var client = new pg.Client(conString);
  client.connect(function(err) {
      if(err) {
          return console.error('No es posible conectarse con el servidor', err);
          return res.status(500).json({success: false, data: err});
      }
     
      client.query("DELETE FROM infante WHERE id="+ req.body.id +";", function(err, result) {
          if(err) {
              return console.error('Error al ejecutar el query', err);
          }
          client.end();
          return res.json(result.rows);
      });  
  });
});

app.put('/restactualizarusuario',(req,res)=>{
  var client = new pg.Client(conString);
 
  client.connect(function(err) {
     if(err) {
         return console.error('No es posible conectarse con el servidor', err);
         return res.status(500).json({success: false, data: err});
     }

     client.query("UPDATE users SET firstName ='"+req.body.firstName+"', lastName='"+req.body.lastName+"', email='"+req.body.email+"', password='"+req.body.password+"', rol='"+req.body.rol+"' WHERE id='" + req.body.id + "';", function(err, result) {
         
         if(err) {
             return console.error('Error al ejecutar el query', err);
         }
         
         //console.log(result);
          client.end();
         return res.json(result);
     });
 });
});