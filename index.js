// obligatory
const express = require('express') // create module
let app = express(); // create an express object
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/main')); // exposes the 'public' dir as the frontend's root dir - thanks stackoverflow

/*
  Basic logic:
  - The basic time unit is rounds, initially set to 3 seconds but configurable and will be changed as game drags on
  - The server will only send out game state update events to all clients at the start of rounds, but will
    continuously accept and calculate actions from clients which are sent to the server in real time
*/


let rooms = {};
/*an object with room IDs as key, and an array of objects as value.
  example: let id = 'SGLV';
  rooms[id][0]; // an array of all players' socket ids, sorted by join time
  rooms[id][1]; // an array of all players' usernames, ordered by [0]
  rooms[id][2]; // current board/game state
  state object structure:
  {
    "round": 0,
    "dice": [
      [1,6],   (a list of die values, ordered by player order in rooms[id][0])
      [...]
    ],
    "planes": [
      [        (ordered by player order, then inside that array: order by when each plane was deployed)
        [1,0], (first index: tile id, second index: how much data it's carrying)
        [5,1],
        [4,2]
      ], 
      ...
    ],
    "debris": [
      54, 10 (tile ids)
    ]
  }
*/

function randomRoomId() { // generates a random 6-letter code for joining
  let letters = 'abcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i=0; i<6; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

// various shorthand functions
function playerList(roomId) { // get a list of player socket ids
  return rooms[roomId][0];
}
function getNameById(roomId, playerId) {
  let dex = rooms[roomId][0].indexOf(playerId);
  if (dex === -1) return false; else return rooms[roomId][1][dex];
}
function findPlayerId(roomId, playerId) { // find what index the player is in, false if player is not in room
  let dex = rooms[roomId][0].indexOf(playerId);
  if (dex === -1) return false; else return dex;
}
function gameObject(roomId) { // get the game state object
  return rooms[roomId][2];
}
function gameObjectOf(roomId, playerId, whatVar) { // get a specific player's game data, false if player is not in room
  let dex = rooms[roomId][0].indexOf(playerId);
  if (dex !== -1 && ['dice','planes'].contains(whatVar)) return rooms[roomId][2][whatVar][dex];
  else return false;
}

io.on('connection', (socket) => { // server is online
  
  // event from client: client creates a new room. clientId is the socket id of the one who created the room.
  // the callback function responds with the valid room id.
  socket.on('createRoom', (clientId, clientName, callback) => {

    for (const id in rooms) { // delete all rooms with 0 players to free up ids
      if ( rooms[id][0].length === 0 ) delete roomList[id];
    }

    let id; // initialize var
    do
      id = randomRoomId(); // generate new id
    while (Object.keys(rooms).includes(id)); // repeat until id is unique

    rooms[id], rooms[id][0], rooms[id][1] = new Array();
    rooms[id][0].push(clientId);
    rooms[id][1].push(clientName);
    rooms[id][2] = new Object();

    //console.log("New room created with ID: "+id);
    //console.log(roomList);

    callback(id);
  });

  // event from client: client attempts to join room. clientId is player client's socket id.
  // the callback function responds with whether the client has joined or not, and if not, why.
  socket.on('joinRoom', (roomId, clientId, clientName, callback) => {
    
    if (rooms[roomId] === undefined)            // if no such room
      callback('fail', 'Room does not exist.'); // back to sender

    else if (rooms[roomId][0].length > 3)       // if there are 4 players in the room already
      callback('fail', 'Room is full.');
        
    else if (rooms[roomId][2].size > 0)         // if the game is already ongoing (denoted by game object existing)
      callback('fail', 'Room is ingame.');

    else {
      callback('success');
      rooms[id][0].push(clientId);
      rooms[id][1].push(clientName);
      //console.log('player '+playerId+' has joined room '+roomId)
      for (const clienter of rooms[roomId][0]) {  // broadcast to all players in room that someone has joined
        socket.to(clienter).emit("playerJoined", rooms[roomId], clientName);
      }
    }
  });

  // event from client: fired automatically upon reloading the webpage
  // NOT WORKING YET. TODO: just dont have the player disconnect in the meantime ig?
  socket.on('disconnecting', (roomId, clientId) => {
    let i = rooms[roomId][0].indexOf(clientId);
    if (i !== -1) {
      rooms[roomId][0].splice(i, 1); // remove the player from the player list
    }
  });

  socket.on('newChat', (roomId, clientId, chat) => {
    // TODO: obviously
  });

  // event from client: client attempts to start game. clientId must be first in player list.
  socket.on('startGame', (roomId, clientId, callback) => {
    
    if (rooms[roomId] === undefined)            // if no such room
      callback('fail', 'Room does not exist.'); // back to sender
    
    else if (rooms[roomId][1].indexOf(clientId) !== 0) // if clientId is not first in list
    callback('fail', 'You are not in charge of the start button.');
    
    else if (rooms[roomId][2].size > 0)         // if the game is already ongoing (denoted by game object existing)
      callback('fail', 'Room is ingame.');

    else {                                      // game starting!!
      callback('success');
      for (const clienter of rooms[roomId][0]) {  // broadcast to all players in room that game is starting
        socket.to(clienter).emit("gameStarting");
      }

      // creating the game object (see comments at top for how it works)
      rooms[roomId][2] = {
        "round": 0,
        "dice": [],
        "planes": [],
        "debris": []
      }
      
      // TODO: short countdown before the round timer starts w setInterval()
    }
  });

  // ingame event from client: client is performing an action, calculate and react accordingly
  socket.on('action', (roomId, clientId, actionType, actionArgs) => {
    // TODO: calculations and update the object
  });
});

// call this function when the round increments!
// TODO: actually calling this. Use setInterval() somewhere?
// Can't just randomly add this, there should be a game countdown before the round timer starts ticking...
function updateGameObj (roomId) {

  let board = structuredClone(gameObject(roomId));       // clone copy of the game obj
  delete board.dice;                                     // include everything but the dice hand part

  for (const clientId of rooms[roomId][0]) {               // for each player:
    let yourDice = gameObjectOf(roomId, clientId, 'dice'); // only broadcast the player's dice hand to the player themselves
    socket.to(clientId).emit("gameObj",yourDice,board);    // broadcast it to the player
  }
}


http.listen(4999, function(){ // set port
  console.log('listening on *:4999');
});