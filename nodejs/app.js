// Based on source code from Designing Hypermedia APIs by Mike Amundsen (2011)

// Import some utility functions.
var utils = require('./utils');

// Create a new web application.
var app = utils.initializeWebApp();

// Connect to our database.
var db = utils.connectToDatabase('microblog');

// Start defining our resource handlers.

// Handle GET of the root resource or "index".
app.get('/', function(req, res) {
  
  // Set our database query options.
  var queryOptions = { descending: true };

  // Query the database for all messages, and send an HTML representation of them.
  db.view('microblog/posts_all', queryOptions, 
    function(err, data) {
      res.header('content-type', utils.negotiateContentType(req));
      res.render('index', {
        title: 'Home',
        items: data
      });  
    }
  );
});

// Handle GET of single message resource.
app.get('/messages/:id', function(req, res){

  // Get the message ID from the URI.
  var message_id = req.params.id;
  
  // Set our database query options.
  var queryOptions = {
    key: message_id,
    descending: true
  };

  // Query the database for the message, and send an HTML representation of it.
  db.view('microblog/posts_by_id', queryOptions, function(err, data) {
    res.header('content-type', utils.negotiateContentType(req));
    res.render('message', {
      title: message_id,
      items: data
    });  
  });
});

// Handle POST to the message list resource.
app.post('/messages/', function(req, res) {
  
  // This method requires an authenticated user.
  utils.authenticateUser(db, req, res, function(req,res) {

    // Get the POSTed text and create a new message object.
    var text = req.body.message;
    if (text !== '') {
      res.send('Empty message', 400);
    } else {
      var message = {
        type: 'post',
        text: text,
        user: req.credentials[0],
        dateCreated: utils.now()
      };
      
      // Save the message object in the database.
      db.save(message, function(err, data) {
        if (err) {
          res.send(500);
        } else {
          res.redirect('/', 303);
        }
      });  
    }
  });
});

// Handle GET of single user profile resource.
app.get('/users/:id', function(req, res){

  // Get the user ID from the URI.
  var user_id = req.params.id;
    
  // Set our database query options.
  var queryOptions = {
    key: user_id,
    descending: true
  };
  
  // Query the database for the user, and send an HTML representation of it.
  db.view('microblog/users_by_id', queryOptions, function(err, data) {
    res.header('content-type', utils.negotiateContentType(req));
    res.render('user', {
      title: user_id,
      items: data
    });  
  });
});

// Handle GET of user message list resource.
app.get('/user-messages/:id', function(req, res){

  // Get the user ID from the URI.
  var user_id = req.params.id;
  
  // Set our database query options.
  var queryOptions = {
    key: user_id,
    descending: true
  };
  
  // Query the database for the user's messages, and send an HTML representation of them.
  db.view('microblog/posts_by_user', queryOptions, function(err, data) {
    res.header('content-type', utils.negotiateContentType(req));
    res.render('user-messages', {
      title: user_id,
      items: data
    });  
  });
});

// Handle GET of user list resource.
app.get('/users/', function(req, res){

  // Query the database for all users, and send an HTML representation of them.
  db.view('microblog/users_by_id', function(err, data) {
    res.header('content-type', utils.negotiateContentType(req));
    res.render('users', {
      title: 'User List',
      items: data
    });  
  });
});

// Handle POST to user list resource.
app.post('/users/', function(req, res) {

  // Get the POSTed user data and create a new user object.
  var user_id = req.body.user;
  if (user_id === '') {
    res.send('Missing user ID', 400);  
  } else {
    var user = {
      type: 'user',
      password: req.body.password,
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
      imageUrl: req.body.avatar,
      websiteUrl: req.body.website,
      dateCreated: utils.today()
    }; 
   
    // Save the message object in the database.
    db.save(user_id, user, function(err, data) {
      if (err) {
        res.send(500);
      } else {
        res.redirect('/users/', 303);
      }
    });    
  }
});

// Handle GET of registration page resource.
app.get('/register/', function(req, res){
  res.header('content-type', utils.negotiateContentType(req));
  res.render('register', { title: 'Register' });
});

// Start listening for incoming HTTP connections.
app.listen(process.env.PORT);
