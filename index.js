// obligatory
const express = require('express') // create module
let app = express(); // create an express object
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/Public')); // exposes the 'public' dir as the frontend's root dir - thanks stackoverflow


// code



http.listen(5001, function(){ // set port
  console.log('listening on *:5001');
});