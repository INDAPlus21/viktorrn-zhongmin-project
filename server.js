// obligatory
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express') // create module
let app = express(); // create an express object
const http = require('http').Server(app);
const io = require('socket.io')(http);
import { createGameHandler } from './main/js/gameHandler.js'
const __dirname = "."

app.use(express.static(__dirname + '/main')); // exposes the 'public' dir as the frontend's root dir - thanks stackoverflow

//gameHandlerClass.info("sam")

/*
  Basic logic:
  - The basic time unit is rounds, initially set to 2 seconds but configurable and will be changed as game drags on
  - The server will only send out game state update events to all clients at the start of rounds, but will
    continuously accept and calculate actions from clients which are sent to the server in real time
*/

//setInterval(()=>{ update() },1000/144) // do this every frame - but what :thinking:

function update() { // update all clientside gamehandlers with the new gamehandler
  var currentTime = new Date();
  
  currentTime = currentTime.getTime();                                      // current unix timestamp
  gameHandler.delta = (currentTime - gameHandler.timeSinceLastUpdate)/1000; //
  gameHandler.time += gameHandler.delta;


  gameHandler.planes = [];

  gameHandler.tilesOccupied = {
    'innerTiles':[],
    'middleTiles':[],
    'outerTiles':[],  
  };

  gameHandler.timerReset = false;

  if(!gameHandler.pause)
  {
    gameHandler.timerValue += gameHandler.delta/gameHandler.secondsPerCycle;
    if(gameHandler.timerValue >= 1){
      gameHandler.timerValue = 0;
      gameHandler.timerReset = true;
    }
  }

  gameHandler.timeSinceLastUpdate = currentTime; // 
  progressbarDOM.value = gameHandler.timerValue; // 


}

let rooms = {};
/*an object with room IDs as key, and an array of objects as value.
  example: let id = 'SGLV';
  rooms[id][0]; // an array of all players' socket ids
  rooms[id][1]; // an array of all players' game objects
  rooms[id][2]; // serverside gamehandler
*/

// various shorthand functions
function playerObj(roomId, clientId) { // get the corresponding player object
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

function createRoom(clientId, clientName, roomId) { // called when someone attempts to join a room that doesnt exist

  for (const id in rooms) { // delete all rooms with 0 players to free up ids
    if ( rooms[id][0].length === 0 ) delete roomList[id];
    console.log('room by id: '+id+' was deleted');
  }

  rooms[roomId], rooms[roomId][0], rooms[roomId][1] = new Array();
  rooms[roomId][0].push(clientId);
  rooms[roomId][1].push(/* player obj? */);
  // [2] created on game start

  console.log('new room created by id: '+roomId);
}

io.on('connection', (socket) => { // server is online

  // event from client: client attempts to join room. clientId is player client's socket id.
  // the callback function responds with whether the client has joined or not, and if not, why.
  socket.on('joinRoom', (roomId, clientId, clientName, callback) => {
    
    if (rooms[roomId] === undefined)            // if no such room
      createRoom(clientId, clientName, roomId)

    else if (rooms[roomId][0].length > 3) {       // if there are 4 players in the room already
      callback('fail', 'Room is full.');
      return
    }
        
    else if (rooms[roomId][2].size > 0) {         // if the game is already ongoing (denoted by game object existing)
      callback('fail', 'Room is ingame.');
      return
    }

    else {
      callback('success');
      rooms[id][0].push(clientId);
      rooms[id][1].push(/* push player obj? */);
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

  // event from client: client attempts to start game. clientId must be first in player list.
  socket.on('startGame', (roomId, clientId, callback) => {
    
    if (rooms[roomId] === undefined)            // if no such room
      callback('fail', 'Room does not exist.'); // back to sender
    
    else if (rooms[roomId][1].indexOf(clientId) !== 0) // if clientId is not first in list
    callback('fail', 'You are not in charge of the start button.');
    
    else if (rooms[roomId][0].length < 2)             // if only one player
    callback('fail', 'Not enough players.');
    
    else if (rooms[roomId][2] !== undefined)         // if the game is already ongoing (denoted by game object existing)
      callback('fail', 'Room is ingame.');

    else {                                      // game starting!!
      callback('success');
      for (const clienter of rooms[roomId][0]) {  // broadcast to all players in room that game is starting
        socket.to(clienter).emit("gameStarting");
      }

      // creating the game object (see comments at top)
      rooms[roomId][2] = createGameHandler();
      
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
function updateEveryone (roomId) {

  // here im using [2], feel free to switch back to [1] if its working (otherwise just leave it alone)
  for (const player of rooms[roomId][2].players) {         // for each player:
    //player.update();                                       // update gamehandler(?)
    // get clientId somewhere here
    socket.to(clientId).emit("gameUpdate", rooms[roomId][2]); // broadcast the whole gamehandler back to the player (TODO: don't?)
  }

}

// call this function when the game ends
function endGame (roomId) {
  for (const player of rooms[roomId][2].players) {         // for each player:
    // get clientId somewhere here
    socket.to(clientId).emit("gameEnding", roomId); // tell everyone game's over
  }
}


http.listen(4999, function(){ // set port
  console.log('listening on *:4999');
});