var express = require('express');
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const querystring = require("querystring");
const bcrypt = require('bcryptjs');
var User = require('../models/user');

// Require controller modules.
//var user_controller = require('../controllers/userController');


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

        //return done(null, user);
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
    done(err, user);
  });
});






router.get('/sign-up', (req, res) => res.render("sign-up-form"));


router.post('/sign-up', (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
	  if(err){return next(err)};

	  console.log(req.body.password);
	  
	  const user = new User({
	  	name: "joe smoe",
	    username: req.body.username,
	    password: hashedPassword,
	    status: "admin",
	  }).save(err => {
	    if (err) { 
	      return next(err);
	    }
	    res.redirect("/")
	});
  });

});



router.post('/log-in',passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

router.get('/log-out',(req, res) => {
  req.logout();
  res.redirect("/");
});

router.get('/',(req, res) => {
  res.render("index", {user:req.user});
});


module.exports = router; 