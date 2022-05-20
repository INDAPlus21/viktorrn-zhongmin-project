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

function update(room,roomId,socket) { // update all clientside gamehandlers with the new gamehandler
  let gameHandler = room[1];
  var currentTime = new Date();
  //console.log("updated")
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
    
    for(let player of gameHandler.players){
      if(player == undefined || player == null) continue
      gameHandler = player.update(gameHandler);
  }
  }
  

  gameHandler.timeSinceLastUpdate = currentTime; // 

  updateEveryone(roomId, socket);

}

let rooms = {};
/*an object with room IDs as key, and an array of objects as value.
  example: let id = 'SGLV';
  rooms[id][0]; // an array of all players' socket ids
  rooms[id][1]; // serverside gamehandler
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

function createRoom(clientId, clientName, roomId, socket) { // called when someone attempts to join a room that doesnt exist

  for (const id in rooms) { // delete all rooms with 0 players to free up ids
    if ( rooms[id][0].length === 0 ) delete roomList[id];
    console.log('room by id: '+id+' was deleted');
  }

  let gh = createGameHandler();

  rooms[roomId] = new Array();
  rooms[roomId].push(new Array()); // [0]
  rooms[roomId].push(gh);          // [1]

  console.log('new room created by id: '+roomId);
}

io.on('connection', (socket) => { // server is online

  // event from client: client attempts to join room. clientId is player client's socket id.
  // the callback function responds with whether the client has joined or not, and if not, why.
  socket.on('joinRoom', (roomId, clientName, clientId, callback) => {
    let isHost = false
    if (rooms[roomId] === undefined) {
           // if no such room
      createRoom(clientId, clientName, roomId, socket)
      console.log("sent to client");
      isHost = true;
      
    }

    else if (rooms[roomId][0].length > 3) {       // if there are 4 players in the room already
      callback('fail', 'Room is full.');
      return
    }
        
    /*else if (rooms[roomId][1].size > 0) {         // if the game is already ongoing (denoted by game object existing)
      callback('fail', 'Room is ingame.');
      return
    }*/
    
    if (isHost === true) callback('success', 'isHost');
    else callback('success');

    let gh = rooms[roomId][1];
    gh.players.push(rooms[roomId][1].createPlayer(gh.players.length,gh,clientName));
    rooms[roomId][0].push(clientId);
    console.log( rooms[roomId] )
    //console.log('player '+playerId+' has joined room '+roomId)
    for (const clienter of rooms[roomId][0]) {  // broadcast to all players in room that someone has joined
      socket.to(clienter).emit("playerJoined", rooms[roomId][0], clientName);
    }
    
  });

  // event from client: fired automatically upon reloading the webpage
  // NOT WORKING YET. TODO: just dont have the player disconnect in the meantime ig?
  socket.on('disconnecting', (roomId, clientId) => {
    /*let i = rooms[roomId][0].indexOf(clientId);
    if (i !== -1) {
      rooms[roomId][0].splice(i, 1); // remove the player from the player list
    }*/
  });

  // event from client: client attempts to start game. clientId must be first in player list.
  socket.on('startGame', (roomId, clientId, callback) => {
    
    if (rooms[roomId] === undefined)            // if no such room
      callback('fail', 'Room does not exist.'); // back to sender
    
    else if (rooms[roomId][0].length < 2)             // if only one player
    callback('fail', 'Not enough players.');
    
    /*else if (rooms[roomId][2] !== undefined)         // if the game is already ongoing (denoted by game object existing)
      callback('fail', 'Room is ingame.');*/

    else {                                      // game starting!!
      callback('success');
      for (const clienter of rooms[roomId][0]) {  // broadcast to all players in room that game is starting
        socket.to(clienter).emit("gameStarting");
        
        rooms[roomId][1].resetGame();
        setInterval(()=>{ update(rooms[roomId],roomId,socket) },1000/144)
       
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
function updateEveryone (roomId, socket) {
  var currentTime = new Date();
  currentTime = currentTime.getTime();     
  for (const playerId of rooms[roomId][0]) {         // for each player:
    socket.to(playerId).emit("syncUpdate", (currentTime , rooms[roomId][1])); // broadcast the whole gamehandler back to the player
  }

}

// call this function when the game ends
function endGame (roomId) {
  for (const player of rooms[roomId][0].players) {         // for each player:
    // get clientId somewhere here
    socket.to(clientId).emit("gameEnding", roomId); // tell everyone game's over
  }
}


http.listen(4999, function(){ // set port
  console.log('listening on *:4999');
});