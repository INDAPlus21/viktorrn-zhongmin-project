import { $ } from "./utility";

let socket = io(); // event listener/emitter

socket.on('connect', () => {
  socketId = socket.id; 
  //console.log("I'm online! with id " + socketId);
});

$('joinServerBtn').onmousedown = () =>{
  roomId = ($('serverIP').value).toLowerCase();
  playerName = $('loginPlayerName').value;

  socket.emit('joinRoom', roomId, playerName, socketId, (verdict, reason) => {
      if (verdict==='fail') $('loginErrorText').innerHTML = reason;
      else {
        // do stuff, and save roomId somewhere clientside prolly (or include it in gamehandler)
      }
  });
}

$('startGameBtn').onmousedown = () =>{ // TODO: startGameBtn does not exist yet?
  socket.emit('startGame', roomId, socketId, (verdict, reason) => {
    if (verdict==='fail') $('startErrorTxt').innerHTML = reason;
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

socket.on('gameStarting', () => { // game is starting
  // im stuff
})

socket.on('gameUpdate', (serverHandler) => { // new round
  // haha jonathan
})

socket.on('gameEnding', () => { // game is ending
  $('gameScreen').classList.remove('displaying');
  $('endingScreen').classList.add('displaying');
  // etc
})