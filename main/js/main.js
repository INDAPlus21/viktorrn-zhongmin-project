
import { createGameHandler } from './gameHandler.js';
import { PlayerController } from './playerController.js';
import { drawUI } from './uiRenderer.js';
import * as Util from './utility.js';
const canvas = Util.$('boardScreen');
const progressbarDOM = Util.$('progressBar');
const updateRateDOM = Util.$('updatesPerSecond');

/*     
                                                <O======O
                                                //    //
                                               //    //
                                              //    //
                                          o==//    //.
                                         <| //    //<|   
                                          o//    //=-¨
                                          //     \\
                                         //       \\
         I        .o/ //O==---====ooooOOOO[o][o][o][o]OOOOOOoooo>>>>--....              // // 
        //      //    //    \ - /     O     [o]   [o]                [][][]OOoo.......// //--.. 
      {<O>}====||==||[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]}--o
        \\      \\    \\    / - \     O     [o]   [o]                [][][]OOoo¨¨¨¨¨¨¨\\ \\--¨¨  
         I        ¨*\ \\O==---====ooooOOOO[o][o][o][o]OOOOOOoooo>>>>--¨¨¨¨              \\ \\ 
                                        \\       //
                                         \\     //
                                         o\\    \\=-.
                                        <| \\    \\<| 
                                         o==\\    \\¨
                                             \\    \\
                                              \\    \\
                                               \\    \\
                                               <O======O
*/ 


// gamedata that will end up in json



let onlineSocketObject = {
    id:0,
}

let gameHandler = createGameHandler(); 

let tileDimensions = {
    radius:12,
    lineWidth: 2,
    regularColor: "#7a7a71",
    highlightColor: "white",
    dotColor: "#cccc"
}

let planeDimensions = {
    width:70,
    height:70,
}



// preload stuff



function updateScreenDimensions(width,height){
    canvas.width = width;
    canvas.height = height;
}


// update stuff
function draw(renderWorker){
   
    renderWorker.postMessage( 
        {
            data:[
                ['drawBoard',gameHandler.boardData,tileDimensions,gameHandler.tilesOccupied],
                ['drawPlane',gameHandler.planes,planeDimensions],
            ]
        }
    )
}


function update(renderWorker){
    var currentTime = new Date();
    
    currentTime = currentTime.getTime();
    gameHandler.delta = (currentTime - gameHandler.timeSinceLastUpdate)/1000;
    gameHandler.time = currentTime;

    let timeLeft = (gameHandler.maxTime + (gameHandler.startTime - gameHandler.time))
    Util.$('timeLeft').innerHTML = "Time: " + timeLeft;
    gameHandler.testIfDone(timeLeft);

    const now = performance.now();
    while (gameHandler.frameBuffer.length > 0 && gameHandler.frameBuffer[0] <= now - 1000) 
    {
        gameHandler.frameBuffer.shift();  
    }
    gameHandler.frameBuffer.push(now);

    updateRateDOM.innerHTML = "FPS: " + gameHandler.frameBuffer.length  ;
    gameHandler.planes = [];

    gameHandler.tilesOccupied = {
        'innerTiles':[],
        'middleTiles':[],
        'outerTiles':[],  
    };

    gameHandler.timerReset = false;

    if(!gameHandler.pause)
    {
        gameHandler.timerValue += gameHandler.delta/gameHandler.cycleSpeed;
        if(gameHandler.timerValue >= 1){
            gameHandler.timerValue = 0;
            gameHandler.timerReset = true;
            // TODO: is round time up?
        }

        for(let player of gameHandler.players){
            if(player == undefined || player == null) continue
            gameHandler = player.update(gameHandler);
        }
        
        
    }
    
    gameHandler.timeSinceLastUpdate = currentTime;
    progressbarDOM.value = gameHandler.timerValue;
    
    drawUI(
        {
            data:[
                ['drawPlayer',gameHandler.players[gameHandler.clientPlayer]],
            ]
        }
        
    )

    draw(renderWorker)

}

window.onload = () =>{
    
    //set up
    updateScreenDimensions(1000,1000)
    gameHandler.boardData = gameHandler.createBoard(  [
        {radius: gameHandler.radiuses[0], tiles:gameHandler.tileAmounts[0], circleLayer:'inner' },
        {radius: gameHandler.radiuses[1], tiles:gameHandler.tileAmounts[1], circleLayer:'middle'},
        {radius: gameHandler.radiuses[2], tiles:gameHandler.tileAmounts[2], circleLayer:'outer' }, ],
        gameHandler.boardData
        );    

    gameHandler.time = 0;
    gameHandler.clientPlayer = 0;
    gameHandler.layerAngleSpeeds = gameHandler.calcLayerAngleSpeeds(gameHandler.tileAmounts,gameHandler.radiuses);
    gameHandler.players[gameHandler.clientPlayer] = (gameHandler.createPlayer(gameHandler.clientPlayer,gameHandler))
    gameHandler.resetGame();

    console.log(gameHandler)
    // for rendering
    var offscreen = canvas.transferControlToOffscreen();
    let renderWorker = new Worker('./js/canvasRenderer.js'); 
    
    renderWorker.postMessage( 
        {canvas: offscreen,
            data:[
                ['setUp'],
            ]
        },
        [offscreen]
    )
    renderWorker.onmessage = (e) =>{
        //update(renderWorker);
    }
    setInterval(()=>{update(renderWorker)},1000/144)

    //for inputs

    window.onkeydown = (e)=>{
       gameHandler.keyStates[e.key] = 1;

        switch(e.key){
           /* case 's':
                for(let plane of  gameHandler.players[gameHandler.clientPlayer].planes){
                    plane.transition((plane.layer - 1) % 3);
                    
                }
               
                break;
            case 'd':
                    for(let plane of  gameHandler.players[gameHandler.clientPlayer].planes){
                        plane.transition((plane.layer + 1) % 3);
                        
                    }
                   
                    break;
            case 'r':
                gameHandler.resetGame();
                for(let player of gameHandler.players){
                    player.resetPlayer();
                }
                gameHandler.timerValue = 0;
                break;
            case 'p':
                gameHandler.pause = !gameHandler.pause;
                break;
            case 'f':
                gameHandler.dispFPS = !gameHandler.dispFPS;
                break;*/
        }
        
    }

    window.onkeyup = (e)=>{
        gameHandler.keyStates[e.key] = 0;
    }

    Util.$('gameScreen').onclick = (e)=>{
        gameHandler.players[gameHandler.clientPlayer].dieSelected = null;
    }
}


