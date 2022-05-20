//import { createRequire } from "../../module";
//const require = createRequire(import.meta.url);

function $(e){return document.getElementById(e)} 

let socket = io(); // event listener/emitter

let socketId;
let roomId;
let playerName; 

socket.on('connect', () => {
  socketId = socket.id; 
  console.log("I'm online! with id " + socketId);
});
//console.log($('joinServerBtn'))

$('joinServerBtn').onclick = () =>{
  roomId = ($('serverIP').value).toLowerCase();
  playerName = $('loginPlayerName').value;
  socket.emit('joinRoom', roomId, playerName, socketId, (verdict, reason) => {
      if (verdict==='fail') { $('errorText').innerHTML = reason; return }
      else if(reason === 'isHost') {
        console.log("is host");
        $('startGameBtn').style.display = "block";
       
      }
      
      
      $('serverIP').disabled = true;
      $('loginPlayerName').disabled = true;
      $('joinServerBtn').style.display = "none";
  });
}

$('startGameBtn').onclick = () =>{ // TODO: startGameBtn does not exist yet?
  socket.emit('startGame', roomId, socketId, (verdict, reason) => {
    if (verdict==='fail') $('errorTxt').innerHTML = reason;
    else {
      // do stuff
    }
});
}

function takeAction (roomId, socketId, actionType, actionArgs) { // when player does smth
  // do stuff?
  socket.emit('takeAction', roomId, socketId, actionType, actionArgs);
}


// server -> client events

socket.on('playerJoined', (roomPlayerList, displayName) => {
  $('errorText').innerHTML = displayName + ' has just joined the room. Say hi! (' + roomPlayerList.length + '/4 players)';
});

socket.on('gameStarting', (playerIndex) => { // game is starting
  let gh = getGameHandler();
  console.log("started");
  gh.playerIndex = playerIndex;
  $('preGameScreen').classList.remove('displaying')
  $('gameScreen').classList.add('displaying')
});

socket.on('syncUpdate', (sendTime, serverHandler) => { // new round
  let gh = getGameHandler();
  gh.updateGameHandler(sendTime, serverHandler);
});

socket.on('gameEnding', () => { // game is ending
  $('gameScreen').classList.remove('displaying');
  $('endingScreen').classList.add('displaying');
  // etc
});