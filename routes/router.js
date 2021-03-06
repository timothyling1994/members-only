var express = require('express');
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const querystring = require("querystring");
const bcrypt = require('bcryptjs');
var User = require('../models/user');
var Password = require('../models/password');

// Require controller modules.
var message_controller = require('../controllers/messageController');

const {check,validationResult} = require('express-validator');


passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      bcrypt.compare(password, user.password, (err, res) => {
        
        if (res) {
          console.log("password MATCHED");
          return done(null, user);
        } else {

          console.log("password NO MATCH");
          return done(null, false, { message: "Incorrect password" });
        }

      });

    });
  })
);

passport.serializeUser(function(user, done) {
	console.log("serializing");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	console.log("deserializing");
  User.findById(id, function(err, user) {
  	//res.locals.currentUser = user;
    done(err, user);
  });
});



router.get('/sign-up', (req, res) => res.render("sign-up-form"));


router.post('/sign-up', [
	check('username','Username must be an email address').isEmail().trim().escape().normalizeEmail(),
	check('password').isLength({min:8}).withMessage('Password must be at least 8 characters long.')
	.matches('[0-9]').withMessage('Password Must Contain a Number')
	.matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter')
	.trim().escape(),],

	(req,res,next)=> {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
    		return res.status(422).json({ errors: errors.array() });
		}
		else
		{
			  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
				  if(err){return next(err)};
				  
				  const user = new User({
				    username: req.body.username,
				    password: hashedPassword,
				    status: "member",
				  }).save(err => {
				    if (err) { 
				      return next(err);
				    }
				    res.redirect("/")
				});
			  });
		}
	}	

);


router.post('/log-in', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      //res.locals.currentUser = req.user;
      return res.redirect('/home');
    });
  })(req, res, next);
});


router.get('/log-out',(req, res) => {
  //req.logout();
  //res.redirect("/");
   if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.redirect("/");
      }
    });
  } else {
    req.end();
    
  }
});

/*
router.get('/home',(req,res)=>{
	res.render('home',{user:req.user});
});*/

router.get('/home',function (req,res,next) {
	if(req.isAuthenticated())
	{
		message_controller.message_list(req,res,next);
	}
	else
	{
		res.redirect('/');
	}

});


//router.get('/create-message', message_controller.create_message_get);

router.get('/create-message',function (req,res,next) {

	if(req.isAuthenticated())
	{
		message_controller.create_message_get(req,res,next);
	}
	else
	{
		res.redirect('/');
	}

});

router.post('/create-message',message_controller.create_message_post);

router.get('/admin',(req, res) => {
  	if(req.isAuthenticated())
	{
		res.render("admin-form");
	}
	else
	{
		res.redirect('/');
	}
});

router.post('/admin',(req, res) => {

	let temp_res = res;

	Password.find({}).exec(function(err,password){

		bcrypt.compare(req.body.password, password[0].password, (err, res) => {
        
	        if (res) {
	          console.log("password MATCHED");

	          User.findByIdAndUpdate(req.user._id, {status:"admin"},function (err, theuser) {
	                if (err) { return next(err); }
	       			temp_res.redirect('/home');
	           });	
	        } else {

	          console.log("password NO MATCH");
	          temp_res.redirect('/admin');

	        }

      });
	});
});


router.get('/delete-message',(req, res) => {
  	if(req.isAuthenticated() && req.user.status=="admin")
	{
		
	}
	else
	{
		res.redirect('/');
	}
});

router.get('/',(req, res) => {
  res.render("index");
});


module.exports = router; 