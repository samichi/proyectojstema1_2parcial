var util = require('util');
var express = require('express');
var app = express();
var passport = require("passport");

var fs = require('fs');
var request = require('request');
const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt')
const uuidv4 = require('uuid/v4');
//TODO
//Add forgot password functionality
//Add email confirmation functionality
//Add edit account page


/****** VARIABLES GLOBALES******/
var id_infante_jugando;
var puntaje_infante_jugando;
var respuesta_actividad_excursion;

//////// FIN VARIABLES GLOBALES ////////


app.use(express.static('public'));

const LocalStrategy = require('passport-local').Strategy;
//const connectionString = process.env.DATABASE_URL;

var currentAccountsData = [];

const pool = new Pool({
	user: 'xpbzhtflffydyb',
	host: 'ec2-107-21-233-72.compute-1.amazonaws.com',
	database: 'd22fba2ecbqfdm',
	password: '52508071ffd004d8f9dca6855d0492dfa70ccebf8bee3e6efe311395861bde18',
	port: '5432',
	ssl: true
});

module.exports = function (app) {

	app.get('/', (req, res) => res.render('home'));

	app.get('/admin', function (req, res, next) {
		res.render('index', { title: "Home", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });

		console.log(req.user);
	});


	app.get('/join', function (req, res, next) {
		res.render('join', { title: "Join", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
	});


	app.post('/join', async function (req, res) {

		try {
			const client = await pool.connect()
			await client.query('BEGIN')
			var pwd = await bcrypt.hash(req.body.password, 5);
			await JSON.stringify(client.query('SELECT id FROM "users" WHERE "email"=$1', [req.body.username], function (err, result) {
				if (result.rows[0]) {
					req.flash('warning', "This email address is already registered. <a href='/login'>Log in!</a>");
					res.redirect('/join');
				}
				else {
					client.query('INSERT INTO users (id, "firstName", "lastName", email, password) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.body.firstName, req.body.lastName, req.body.username, pwd], function (err, result) {
						if (err) { console.log(err); }
						else {

							client.query('COMMIT')
							console.log(result)
							req.flash('success', 'User created.')
							res.redirect('/login');
							return;
						}
					});


				}

			}));
			client.release();
		}
		catch (e) { throw (e) }
	});

	/*app.get('/account', function (req, res, next) {
		if (req.isAuthenticated()) {
			res.render('account', { title: "Account", userData: req.user, userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
		}
		else {
			res.redirect('/login');
		}
	});*/

	app.get('/login', function (req, res, next) {
		if (req.isAuthenticated()) {
			res.redirect('/account');
		}
		else {
			res.render('login', { title: "Log in", userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
		}

	});

	app.get('/logout', function (req, res) {

		console.log(req.isAuthenticated());
		req.logout();
		console.log(req.isAuthenticated());
		req.flash('success', "Logged out. See you soon!");
		res.redirect('/');
	});

	app.post('/login', passport.authenticate('local', {
		successRedirect: '/account',
		failureRedirect: '/login',
		failureFlash: true
	}), function (req, res) {
		if (req.body.remember) {
			req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
		} else {
			req.session.cookie.expires = false; // Cookie expires at end of session
		}
		res.redirect('/');
	});

	//////////////////////////////////////////////////////TABLES////////////////////////////////////////////////



	///////////////////EXCURSION 

app.get('/account', (req, res, next) => { //leer
	//console.log("que paso");
	var excursionList = [];
	if (req.isAuthenticated()) { //si esta loggeado
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No se pudo conectar al servidor');
				return res.status(500).json({
					success: false, data: err
				});
			}
			pool.query('SELECT * FROM excursion', function (r, result) {
				if (err) {
					return console.error('error al ejecutar query', err);
				}
				//console.log(result.rows)
				for (var i = 0; i < result.rows.length; i++) {
					
					
					// Create an object to save current row's data
					var excursion = {
						'id':result.rows[i].id,
						'nombre':result.rows[i].nombre,
						'urlimg':result.rows[i].urlimg
					}
					// Add object into array
					excursionList.push(excursion);
					
				}
				//console.log(excursionList)
				//pool.end();
				res.render('account', { title: "Account", "excursion": true, "objectList": excursionList, userData: req.user, userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
			});
		});
	}
	else {
		res.redirect('/login');
	}
});

app.post('/excursion', function (req, res, next) { //crear
	if(req.isAuthenticated()){
	//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
	pool.connect(function (err) {
		if (err) {
			return console.error('No es posible conectarse con el servidor', err);
			return res.status(500).json({ success: false, data: err });
		}
		//INSERT INTO excursion (nombre, urlimg) VALUES ('MARCO', '/URLMARCO');
		pool.query("INSERT INTO  excursion  (nombre ,  urlimg) VALUES ('" + req.body.nombre + "', '" + req.body.urlimg + "');", function (err, result) {
			if (err) {
				return console.error('Error al ejecutar el query', err);
			}
			//pool.end();
			//return res.json(result);
			req.flash('success', 'Excursión añadida.')
			res.redirect('back');
			return;
		});
	});
	}
	else{
			res.redirect('/login');
			return;	
	}
});

app.delete('/excursion/:id', function (req, res, next) {
	//if(req.isAuthenticated()){
	//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
	pool.connect(function (err) {
		if (err) {
			return console.error('No es posible conectarse con el servidor', err);
			return res.status(500).json({ success: false, data: err });
		}

		//DELETE FROM capitulo WHERE fk_capitulo_escursion IN (SELECT "+ req.params.id +" FROM excursion);DELETE FROM some_table;
		pool.query("DELETE FROM capitulo WHERE id_excursion = "+ req.params.id +";DELETE FROM excursion WHERE id = " + req.params.id + ";", function (err, result) {
			if (err) {
				return console.error('Error al ejecutar el query', err);
			}
			//pool.end();
			//return res.json(result);
			req.flash('success', 'Excursión eliminada.')
			res.redirect('back');
			return;
		});
	});
	//}
	/*else{
			res.redirect('/login');
	}*/
});

app.post('/excursion/:id',(req,res)=>{
	
	pool.connect(function(err) {
	   if(err) {
		   return console.error('No es posible conectarse con el servidor', err);
		   return res.status(500).json({success: false, data: err});
	   }
  
	   pool.query("UPDATE excursion SET nombre ='"+req.body.nombre+"', urlimg='"+req.body.urlimg+"' WHERE id='" + req.params.id + "';", function(err, result) {
		   
		   if(err) {
			   return console.error('Error al ejecutar el query', err);
		   }
		   
		   //console.log(result);
			//pool.end();
		   //return res.json(result);
		   req.flash('success', 'Excursión actualizada.')
			res.redirect('back');
			return;
	   });
   });
  });

	///////////////////capitulo 

	app.get('/excursiones/:id/capitulo', (req, res, next) => { //leer
		//console.log("que paso");
		var capituloList = [];
		if (req.isAuthenticated()) { //si esta loggeado
			//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
			pool.connect(function (err) {
				if (err) {
					return console.error('No se pudo conectar al servidor');
					return res.status(500).json({
						success: false, data: err
					});
				}
				pool.query('SELECT * FROM capitulo WHERE id_excursion='+ req.params.id +'', function (r, result) {
					if (err) {
						return console.error('error al ejecutar query', err);
					}
					//console.log(result.rows)
					for (var i = 0; i < result.rows.length; i++) {
						
						
						// Create an object to save current row's data
						var capitulo = {
							'id':result.rows[i].id,
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
						capituloList.push(capitulo);
						
					}
					//console.log(excursionList)
					//pool.end();
					res.render('account', { title: "Account", "id_excursion": req.params.id,"capitulo": true,"objectList": capituloList, userData: req.user, userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
				});
			});
		}
		else {
			res.redirect('/login');
		}
	});

	app.post('/capitulo/:id_excursion', function (req, res, next) { //crear
		if(req.isAuthenticated()){
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No es posible conectarse con el servidor', err);
				return res.status(500).json({ success: false, data: err });
			}
			//INSERT INTO excursion (nombre, urlimg) VALUES ('MARCO', '/URLMARCO');
			pool.query("INSERT INTO  capitulo  (titulo, imgcapitulo, descripcion, creditos, urlvideo, urlactividad, urlrespuesta, id_excursion) VALUES ('" + req.body.titulo + "', '" + req.body.imgcapitulo + "', '" + req.body.descripcion +"', '" + req.body.creditos + "', '" + req.body.urlvideo +"', '" + req.body.urlactividad + "', '" + req.body.urlrespuesta + "', " + req.params.id_excursion+ ");", function (err, result) {
				if (err) {
					return console.error('Error al ejecutar el query', err);
				}
				//pool.end();
				//return res.json(result);
				req.flash('success', 'Capitulo añadida.')
				res.redirect('back');
				return;
			});
		});
		}
		else{
				res.redirect('/login');
				return;	
		}
	});

	app.delete('/capitulo/:id', function (req, res, next) {
		//if(req.isAuthenticated()){
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No es posible conectarse con el servidor', err);
				return res.status(500).json({ success: false, data: err });
			}
	
			//DELETE FROM capitulo WHERE fk_capitulo_escursion IN (SELECT "+ req.params.id +" FROM excursion);DELETE FROM some_table;
			pool.query("DELETE FROM capitulo WHERE id = " + req.params.id + ";", function (err, result) {
				if (err) {
					return console.error('Error al ejecutar el query', err);
				}
				//pool.end();
				//return res.json(result);
				req.flash('success', 'Capitulo eliminado.')
				res.redirect('back');
				return;
			});
		});
		//}
		/*else{
				res.redirect('/login');
		}*/
	});

	app.post('/capitulo/:id_excursion/:id',(req,res)=>{
	
		pool.connect(function(err) {
		   if(err) {
			   return console.error('No es posible conectarse con el servidor', err);
			   return res.status(500).json({success: false, data: err});
		   }
	  
		   pool.query("UPDATE capitulo SET titulo = '" + req.body.titulo + "', imgcapitulo = '" + req.body.imgcapitulo + "', descripcion = '" + req.body.descripcion + "', creditos = '" + req.body.creditos + "', urlvideo = '" + req.body.urlvideo + "', urlactividad = '" + req.body.urlactividad + "', urlrespuesta = '" + req.body.urlrespuesta + "', id_excursion = "+ req.params.id_excursion + " WHERE id=" + req.params.id + ";", function(err, result) {
			   
			   if(err) {
				   return console.error('Error al ejecutar el query', err);
			   }
			   
			   //console.log(result);
				//pool.end();
			   //return res.json(result);
			   req.flash('success', 'Capitulo actualizado.')
				res.redirect('back');
				return;
		   });
	   });
	  });

	///////////////////imagen 

	app.get('/capitulos/:id/imagen', (req, res, next) => { //leer
		//console.log("que paso");
		var imagenList = [];
		if (req.isAuthenticated()) { //si esta loggeado
			//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
			pool.connect(function (err) {
				if (err) {
					return console.error('No se pudo conectar al servidor');
					return res.status(500).json({
						success: false, data: err
					});
				}
				pool.query('SELECT * FROM imagen WHERE id_capitulo='+ req.params.id +'', function (r, result) {
					if (err) {
						return console.error('error al ejecutar query', err);
					}
					//console.log(result.rows)
					for (var i = 0; i < result.rows.length; i++) {
						
						
						// Create an object to save current row's data
						var imagen = {
							'id':result.rows[i].id,
							'urlimagen':result.rows[i].urlimagen,
							'id_capitulo':result.rows[i].id_capitulo,
						}
						// Add object into array
						imagenList.push(imagen);
						
					}
					//console.log(excursionList)
					//pool.end();
					res.render('account', { title: "Account", "id_capitulo": req.params.id,"imagen": true,"objectList": imagenList, userData: req.user, userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
				});
			});
		}
		else {
			res.redirect('/login');
		}
	});

	app.post('/imagen/:id_capitulo', function (req, res, next) { //crear
		if(req.isAuthenticated()){
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No es posible conectarse con el servidor', err);
				return res.status(500).json({ success: false, data: err });
			}
			//INSERT INTO excursion (nombre, urlimg) VALUES ('MARCO', '/URLMARCO');
			pool.query("INSERT INTO  imagen  (urlimagen, id_capitulo) VALUES ('" + req.body.urlimagen  + "', " + req.params.id_capitulo+ ");", function (err, result) {
				if (err) {
					return console.error('Error al ejecutar el query', err);
				}
				//pool.end();
				//return res.json(result);
				req.flash('success', 'Capitulo añadida.')
				res.redirect('back');
				return;
			});
		});
		}
		else{
				res.redirect('/login');
				return;	
		}
	});

	app.delete('/imagen/:id', function (req, res, next) {
		//if(req.isAuthenticated()){
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No es posible conectarse con el servidor', err);
				return res.status(500).json({ success: false, data: err });
			}
	
			//DELETE FROM capitulo WHERE fk_capitulo_escursion IN (SELECT "+ req.params.id +" FROM excursion);DELETE FROM some_table;
			pool.query("DELETE FROM imagen WHERE id = " + req.params.id + ";", function (err, result) {
				if (err) {
					return console.error('Error al ejecutar el query', err);
				}
				//pool.end();
				//return res.json(result);
				req.flash('success', 'Imagen eliminado.')
				res.redirect('back');
				return;
			});
		});
		//}
		/*else{
				res.redirect('/login');
		}*/
	});

	app.post('/imagen/:id_capitulo/:id',(req,res)=>{
	
		pool.connect(function(err) {
		   if(err) {
			   return console.error('No es posible conectarse con el servidor', err);
			   return res.status(500).json({success: false, data: err});
		   }
	  
		   pool.query("UPDATE imagen SET urlimagen = '" + req.body.urlimagen + "', id_capitulo = " + req.params.id_capitulo + " WHERE id=" + req.params.id + ";", function(err, result) {
			   
			   if(err) {
				   return console.error('Error al ejecutar el query', err);
			   }
			   
			   //console.log(result);
				//pool.end();
			   //return res.json(result);
			   req.flash('success', 'Imagen actualizado.')
				res.redirect('back');
				return;
		   });
	   });
	  });

	///////////////////respuesta

	app.get('/capitulos/:id/respuesta', (req, res, next) => { //leer
		//console.log("que paso");
		var respuestaList = [];
		if (req.isAuthenticated()) { //si esta loggeado
			//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
			pool.connect(function (err) {
				if (err) {
					return console.error('No se pudo conectar al servidor');
					return res.status(500).json({
						success: false, data: err
					});
				}
				pool.query('SELECT * FROM respuesta WHERE id_capitulo='+ req.params.id +'', function (r, result) {
					if (err) {
						return console.error('error al ejecutar query', err);
					}
					//console.log(result.rows)
					for (var i = 0; i < result.rows.length; i++) {
						
						
						// Create an object to save current row's data
						var respuesta = {
							'id':result.rows[i].id,
							'resp_infante':result.rows[i].resp_infante,
							'id_capitulo':result.rows[i].id_capitulo,
							'id_infante':result.rows[i].id_infante
						}
						// Add object into array
						respuestaList.push(imagen);
						
					}
					//console.log(excursionList)
					//pool.end();
					res.render('account', { title: "Account", "id_capitulo": req.params.id, "respuesta": true,"objectList": respuestaList, userData: req.user, userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
				});
			});
		}
		else {
			res.redirect('/login');
		}
	});

	///////////////////infante

	app.get('/infante', (req, res, next) => { //leer
		//console.log("que paso");
		var infanteList = [];
		if (req.isAuthenticated()) { //si esta loggeado
			//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
			pool.connect(function (err) {
				if (err) {
					return console.error('No se pudo conectar al servidor');
					return res.status(500).json({
						success: false, data: err
					});
				}
				pool.query('SELECT * FROM infante', function (r, result) {
					if (err) {
						return console.error('error al ejecutar query', err);
					}
					//console.log(result.rows)
					for (var i = 0; i < result.rows.length; i++) {
						
						
						// Create an object to save current row's data
						var infante = {
							'id':result.rows[i].id,
							'nombre':result.rows[i].nombre,
							'urlimagen':result.rows[i].urlimagen,
							'puntaje':result.rows[i].puntaje
						}
						// Add object into array
						infanteList.push(infante);
						
					}
					//console.log(excursionList)
					//pool.end();
					res.render('account', { title: "Account", "infante": true,"objectList": infanteList, userData: req.user, userData: req.user, messages: { danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success') } });
				});
			});
		}
		else {
			res.redirect('/login');
		}
	});

	app.post('/infante', function (req, res, next) { //crear
		if(req.isAuthenticated()){
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No es posible conectarse con el servidor', err);
				return res.status(500).json({ success: false, data: err });
			}
			//INSERT INTO excursion (nombre, urlimg) VALUES ('MARCO', '/URLMARCO');
			pool.query("INSERT INTO  infante  (nombre, urlimagen, puntaje) VALUES ('" + req.body.nombre  + "', '" + req.body.urlimagen + "', "+ req.body.puntaje +");", function (err, result) {
				if (err) {
					return console.error('Error al ejecutar el query', err);
				}
				//pool.end();
				//return res.json(result);
				req.flash('success', 'Capitulo añadida.')
				res.redirect('back');
				return;
			});
		});
		}
		else{
				res.redirect('/login');
				return;	
		}
	});

	app.delete('/infante/:id', function (req, res, next) {
		//if(req.isAuthenticated()){
		//res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		pool.connect(function (err) {
			if (err) {
				return console.error('No es posible conectarse con el servidor', err);
				return res.status(500).json({ success: false, data: err });
			}
	
			//DELETE FROM capitulo WHERE fk_capitulo_escursion IN (SELECT "+ req.params.id +" FROM excursion);DELETE FROM some_table;
			pool.query("DELETE FROM infante WHERE id = "+ req.params.id +";", function (err, result) {
				if (err) {
					return console.error('Error al ejecutar el query', err);
				}
				//pool.end();
				//return res.json(result);
				req.flash('success', 'Imagen eliminado.')
				res.redirect('back');
				return;
			});
		});
		//}
		/*else{
				res.redirect('/login');
		}*/
	});

	app.post('/infante/:id',(req,res)=>{
	
		pool.connect(function(err) {
		   if(err) {
			   return console.error('No es posible conectarse con el servidor', err);
			   return res.status(500).json({success: false, data: err});
		   }
	  
		   pool.query("UPDATE infante SET nombre = '" + req.body.nombre + "', urlimagen = '"+ req.body.urlimagen +"' , puntaje = " + req.body.puntaje + " WHERE id=" + req.params.id + ";", function(err, result) {
			   
			   if(err) {
				   return console.error('Error al ejecutar el query', err);
			   }
			   
			   //console.log(result);
				//pool.end();
			   //return res.json(result);
			   req.flash('success', 'Imagen actualizado.')
				res.redirect('back');
				return;
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
		pool.connect(function(err){
		  if(err){
			return console.error('No se pudo conectar al servidor');
			return res.status(500).json({
			  success: false, data: err});
		  }
		  pool.query('SELECT * FROM infante;', function(err, result){
			if(err){
			  return console.error('Error al ejecutar query', err);
			}else{
			  for (var i = 0; i < result.rows.length; i++) {
				//console.log(result);
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
			//pool.end();
			//console.log(result);
			//return res.json(result.rows);
			res.render('listainfante', {"infanteList": infanteList});
		  });
		});
	  });
	
	  app.get('/leerexcursionusuario/:id', (req, res, next)=>{
		id_infante_jugando = req.params.id;
		var excursionList = [];
		pool.connect(function(err){
		  if(err){
			return console.error('No se pudo conectar al servidor');
			return res.status(500).json({
			  success: false, data: err});
			}
			
			pool.query('SELECT puntaje FROM infante WHERE'+req.params.id+';', function(err, result){
				if(err){
					return console.error('Error al ejecutar query', err);
				}else{
					puntaje_infante_jugando = result.rows[0].puntaje;
				}
			});

			console.log('id_infante_jugando = '+id_infante_jugando);
			console.log('puntaje_infante_jugando = '+puntaje_infante_jugando);

		  pool.query('SELECT * FROM Excursion;', function(err, result){
			if(err){
			  return console.error('Error al ejecutar query', err);
			}else{
			  for (var i = 0; i < result.rows.length; i++) {
				//console.log(result);
						var excursion = {
							'id':result.rows[i].id,
							'nombre':result.rows[i].nombre,
							'urlimg':result.rows[i].urlimg
						}
						// Add object into array
				excursionList.push(excursion);
			  }
			}
			//pool.end();
			//console.log(result);
			//return res.json(result.rows);
			res.render('leerexcursionusuario', {"excursionList": excursionList});
		  });
		});
	  });
	
	  app.get('/listacapituloporexcursion/:id', (req, res, next)=>{
		var capExcList = [];
		var id_excursion = req.params.id;
		pool.connect(function(err){
		  if(err){
			return console.error('No se pudo conectar al servidor');
			return res.status(500).json({
			  success: false, data: err});
		  }
		  pool.query('SELECT * FROM capitulo WHERE id_excursion='+ req.params.id +';', function(err, result){
			var capitulo;
			if(err){
			  return console.error('Error al ejecutar query', err);
			} else{
			  for (var i = 0; i < result.rows.length; i++) {
				//console.log(result);
				var capExc = {
				  'id':result.rows[i].id,
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
			//pool.end();
			//console.log(capList);
			//console.log(result);
			//return res.json(result.rows);
			res.render('listacapituloporexcursion', {"capExcList": capExcList});
		  });
		});
	  });

	  app.get('/infocapituloporid/:id', (req, res, next)=>{
		console.log("idCapitulo: "+req.params.id);
		puntaje_infante_jugando++;
		pool.connect(function(err){
		  if(err){
			return console.error('No se pudo conectar al servidor');
			return res.status(500).json({
			  success: false, data: err});
		  }
		  pool.query('SELECT titulo, imgcapitulo, descripcion, descripcion, creditos, urlvideo, urlactividad, urlrespuesta, id_excursion FROM capitulo WHERE id='+req.params.id+';', function(err, result){
			var capitulo;
			if(err){
			  return console.error('Error al ejecutar query', err);
			} else{
				//console.log(result);
				var capituloInfo = {
				  'titulo':result.rows[0].titulo,
				  'imgcapitulo':result.rows[0].imgcapitulo,
				  'descripcion':result.rows[0].descripcion,
				  'creditos':result.rows[0].creditos,
				  'urlvideo':result.rows[0].urlvideo,
				  'urlactividad':result.rows[0].urlactividad,
				  'urlrespuesta':result.rows[0].urlrespuesta,
				  'id_excursion':result.rows[0].id_excursion
				}
				// Add object into array
			}
			//pool.end();
			//console.log(capList);
			//console.log(result);
			//return res.json(result.rows);
			res.render('infocapituloporid', {"capituloInfo": capituloInfo});
		  });
		});
	  });



	
	///////////////////////////////////REST API////////////////////////////////////////////
	
	/* EXCURSION */
	app.get('/restleeraexcursion', (req, res, next)=>{
	  pool.connect(function(err){
		if(err){
		  return console.error('No se pudo conectar al servidor');
		  return res.status(500).json({
			success: false, data: err});
		}
		pool.query('SELECT * FROM excursion;', function(err, result){
		  if(err){
			return console.error('error al ejecutar query', err);
		  }
		  //pool.end();
		  console.log(result);
		  return res.json(result.rows);
		});
	  });
	});
	
	app.post('/restagregarexcursion', (req, res, next) => {
	  pool.connect(function(err) {
		  if(err) {
			  return console.error('No es posible conectarse con el servidor', err);
			  return res.status(500).json({success: false, data: err});
		  }
		  pool.query("INSERT INTO  excursion  (nombre ,  urlimg) VALUES ('"+req.body.nombre+"', '"+req.body.urlimg+"');", function(err, result) {
			  if(err) {
				  return console.error('Error al ejecutar el query', err);
			  }
			  //pool.end();
			  return res.json(result);
		  }); 
	  });
	});
	
	app.delete('/resteliminarexcursionid', (req, res, next) => {
	 pool.connect(function(err) {
		  if(err) {
			  return console.error('No es posible conectarse con el servidor', err);
			  return res.status(500).json({success: false, data: err});
		  }
		 
		 pool.query("DELETE FROM excursion WHERE id="+ req.body.id +";", function(err, result) {
			  if(err) {
				  return console.error('Error al ejecutar el query', err);
			  }
			 //pool.end();
			  return res.json(result.rows);
		  });  
	  });
	});
	
	app.put('/restactualizarexcursion',(req,res)=>{
	  pool.connect(function(err) {
		 if(err) {
			 return console.error('No es posible conectarse con el servidor', err);
			 return res.status(500).json({success: false, data: err});
		 }
	
		 pool.query("UPDATE excursion SET nombre ='"+req.body.nombre+"', urlimg='"+req.body.urlimg+"' WHERE id='" + req.body.id + "';", function(err, result) {
			 
			 if(err) {
				 return console.error('Error al ejecutar el query', err);
			 }
			 
			 //console.log(result);
			 //pool.end();
			 return res.json(result);
		 });
	 });
	});
	
	/* INFANTE */
	
	app.get('/restleerinfante', (req, res, next)=>{
	  pool.connect(function(err){
		if(err){
		  return console.error('No se pudo conectar al servidor');
		  return res.status(500).json({
			success: false, data: err});
		}
		pool.query('SELECT * FROM infante;', function(err, result){
		  if(err){
			return console.error('error al ejecutar query', err);
		  }
		  //pool.end();
		  console.log(result);
		  return res.json(result.rows);
		});
	  });
	});
	
	app.post('/restagregarinfante', (req, res, next) => {
	  pool.connect(function(err) {
		  if(err) {
			  return console.error('No es posible conectarse con el servidor', err);
			  return res.status(500).json({success: false, data: err});
		  }
		  pool.query("INSERT INTO  infante  (nombre ,  urlimagen, puntaje) VALUES ('"+req.body.nombre+"', '"+req.body.urlimagen+"', '"+req.body.puntaje+"');", function(err, result) {
			  if(err) {
				  return console.error('Error al ejecutar el query', err);
			  }
			  //pool.end();
			  return res.json(result);
		  }); 
	  });
	});
	
	app.delete('/resteliminarinfanteid', (req, res, next) => {
	  pool.connect(function(err) {
		  if(err) {
			  return console.error('No es posible conectarse con el servidor', err);
			  return res.status(500).json({success: false, data: err});
		  }
		 
		  pool.query("DELETE FROM infante WHERE id="+ req.body.id +";", function(err, result) {
			  if(err) {
				  return console.error('Error al ejecutar el query', err);
			  }
			  //pool.end();
			  return res.json(result.rows);
		  });  
	  });
	});
	
	app.put('/restactualizarinfante',(req,res)=>{
	  pool.connect(function(err) {
		 if(err) {
			 return console.error('No es posible conectarse con el servidor', err);
			 return res.status(500).json({success: false, data: err});
		 }
	
		 pool.query("UPDATE infante SET nombre ='"+req.body.nombre+"', urlimagen='"+req.body.urlimagen+"', puntaje='"+req.body.puntaje+"' WHERE id='" + req.body.id + "';", function(err, result) {
			 
			 if(err) {
				 return console.error('Error al ejecutar el query', err);
			 }
			 
			 //console.log(result);
			 //pool.end();
			 return res.json(result);
		 });
	 });
	});
	
	/* USERS */
	
	app.get('/restleerusuario', (req, res, next)=>{
	  pool.connect(function(err){
		if(err){
		  return console.error('No se pudo conectar al servidor');
		  return res.status(500).json({
			success: false, data: err});
		}
		pool.query('SELECT * FROM users;', function(err, result){
		  if(err){
			return console.error('error al ejecutar query', err);
		  }
		  //pool.end();
		  console.log(result);
		  return res.json(result.rows);
		});
	  });
	});
	
	app.post('/restagregarusuario', (req, res, next) => {
	  pool.connect(function(err) {
		  if(err) {
			  return console.error('No es posible conectarse con el servidor', err);
			  return res.status(500).json({success: false, data: err});
		  }
		  pool.query("INSERT INTO users  (firstName, lastName, email, password, rol) VALUES ('"+req.body.firstName+"', '"+req.body.lastName+"', '"+req.body.email+"', '"+req.body.password+"', '"+req.body.rol+"');", function(err, result) {
			  if(err) {
				  return console.error('Error al ejecutar el query', err);
			  }
			  //pool.end();
			  return res.json(result);
		  }); 
	  });
	});
	
	app.delete('/resteliminarusuarioid', (req, res, next) => {
	  pool.connect(function(err) {
		  if(err) {
			  return console.error('No es posible conectarse con el servidor', err);
			  return res.status(500).json({success: false, data: err});
		  }
		 
		  pool.query("DELETE FROM infante WHERE id="+ req.body.id +";", function(err, result) {
			  if(err) {
				  return console.error('Error al ejecutar el query', err);
			  }
			  //client.end();
			  return res.json(result.rows);
		  });  
	  });
	});
	
	app.put('/restactualizarusuario',(req,res)=>{
	  pool.connect(function(err) {
		 if(err) {
			 return console.error('No es posible conectarse con el servidor', err);
			 return res.status(500).json({success: false, data: err});
		 }
	
		 pool.query("UPDATE users SET firstName ='"+req.body.firstName+"', lastName='"+req.body.lastName+"', email='"+req.body.email+"', password='"+req.body.password+"', rol='"+req.body.rol+"' WHERE id='" + req.body.id + "';", function(err, result) {
			 
			 if(err) {
				 return console.error('Error al ejecutar el query', err);
			 }
			 
			 //console.log(result);
			 //pool.end();
			 return res.json(result);
		 });
	 });
	});

} ///////////////////////LIMITE DEL REST


passport.use('local', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {

	loginAttempt();
	async function loginAttempt() {


		const client = await pool.connect()
		try {
			await client.query('BEGIN')
			var currentAccountsData = await JSON.stringify(client.query('SELECT id, "firstName", "email", "password" FROM "users" WHERE "email"=$1', [username], function (err, result) {

				if (err) {
					return done(err)
				}
				if (result.rows[0] == null) {
					req.flash('danger', "Oops. Incorrect login details.");
					return done(null, false);
				}
				else {
					bcrypt.compare(password, result.rows[0].password, function (err, check) {
						if (err) {
							console.log('Error while checking password');
							return done();
						}
						else if (check) {
							return done(null, [{ email: result.rows[0].email, firstName: result.rows[0].firstName }]);
						}
						else {
							req.flash('danger', "Oops. Incorrect login details.");
							return done(null, false);
						}
					});
				}
			}))
		}

		catch (e) { throw (e); }
	};
}
))




passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});		