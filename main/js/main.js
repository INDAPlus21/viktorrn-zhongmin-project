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

let gameHandler = {
    layerAngleSpeeds:[],
    seccondsPerCycle:1,
    
    timerValue:0,
    timerReset:false,
    time:0,

    radiuses:[90,240,400],
    tileAmounts:[9,18,36],
    playerAmount:4,

    pause:false,
    dispFPS:true,
    

    keyStates:{},
    
    currentDateTime: new Date(),
    timeSinceLastUpdate: 0,
    frameBuffer: [],
    delta:1,

    clientPlayer:0,
    players:[],
    playerStartAngles:[],
    planes: [],
    tilesOccupied:{
        'innerTiles': [],
        'middleTiles':[],
        'outerTiles': [],
    },
    boardData:{
        innerTiles: [],
        middleTiles:[],
        outerTiles: []
    },

    getPlayer(id){
        return this.players[id];
    },

    diePools:[
       
    ]
}

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

function calcLayerAngleSpeeds(tileAmounts){
    let list = [];
    for(let l in [0,1,2]){
        let layerModifier = tileAmounts[0]/tileAmounts[l];
        list.push(layerModifier)
    }
    return list;
}

function updateScreenDimensions(width,height){
    canvas.width = width;
    canvas.height = height;
}

function createBoard(layers,boardData){ 
    for(let layer of layers){
        let tileAmount = layer.tiles;
        let radius = layer.radius;
        let ring = {
            type:'ringOutline',
            x: 0,
            y: 0,
            radius: radius,
        }
        boardData[layer.circleLayer+'Tiles'].push(ring);
        
        for(let step = 0; step < tileAmount; step++){  
        
            let ang1 = 2*Math.PI * step/tileAmount;
            let x =  radius*Math.cos(ang1);
            let y =  radius*Math.sin(ang1);
           
            let tile = {
                type:'tile',
                x:x,
                y:y,
                angle:ang1,
                tileType:'tile',
                plane:null,
            }
            boardData[layer.circleLayer+'Tiles'].push(tile);
        }
    }

    let j = 0;
    for(let i in boardData['outerTiles']){
        if(i == 0) continue; 
        let tile = boardData['outerTiles'][i];
        if( (i - 1 - 2 )%(gameHandler.tileAmounts[2]/gameHandler.playerAmount) == 0 ){
            tile.tileType = 'Passage';
            //gameHandler.playerStartAngles[j] = tile.angle;
            j+=1;
        }
    }

    //start positions

    j = 0;
    
   for(let i in boardData['outerTiles'])
   {
        if(i == 0) continue; 
        let tile = boardData['outerTiles'][i];
        if( (i - 1 + 4 )%(gameHandler.tileAmounts[2]/gameHandler.playerAmount) == 0 )
        {
            tile.tileType = j+'Start';
            gameHandler.playerStartAngles[j] = tile.angle;
            console.log(tile.angle)
            j+=1;
        }
    }


   
    return boardData;
}

function generateDiePools(){
    [1,1,2,3,4,5,6,6],
    [],
    []
}

function createPlayer(playerIndex,gameHandler){
    return new PlayerController(playerIndex,{angle:gameHandler.playerStartAngles[playerIndex]},gameHandler.radiuses,gameHandler.tileAmounts);
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
    gameHandler.time += gameHandler.delta;
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
        gameHandler.timerValue += gameHandler.delta/gameHandler.seccondsPerCycle;
        if(gameHandler.timerValue >= 1){
            gameHandler.timerValue = 0;
            gameHandler.timerReset = true;
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
    gameHandler.boardData = createBoard(  [
        {radius: gameHandler.radiuses[0], tiles:gameHandler.tileAmounts[0], circleLayer:'inner' },
        {radius: gameHandler.radiuses[1], tiles:gameHandler.tileAmounts[1], circleLayer:'middle'},
        {radius: gameHandler.radiuses[2], tiles:gameHandler.tileAmounts[2], circleLayer:'outer' }, ],
        gameHandler.boardData
        );    
    gameHandler.diePools = generateDiePools();

    gameHandler.time = 0;
    gameHandler.clientPlayer = 0;
    gameHandler.layerAngleSpeeds = calcLayerAngleSpeeds(gameHandler.tileAmounts,gameHandler.radiuses);
    gameHandler.players[gameHandler.clientPlayer] = (createPlayer(gameHandler.clientPlayer,gameHandler))
    
    console.log(gameHandler)
    // for rendering
    var offscreen = canvas.transferControlToOffscreen();
    let renderWorker = new Worker('js/canvasRenderer.js'); 
    
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
            case 's':
                for(let plane of  gameHandler.players[gameHandler.clientPlayer].planes){
                    plane.transition((plane.layer + 1) % 3);
                    
                }
               
                break;
            case 'r':
                for(let player of gameHandler.players){
                    for(let p of player.planes){
                        p.angle = 0;   
                    }
                }
                gameHandler.timerValue = 0;
                break;
            case 'p':
                gameHandler.pause = !gameHandler.pause;
                break;
            case 'f':
                gameHandler.dispFPS = !gameHandler.dispFPS;
                break;
        }
        
    }

    window.onkeyup = (e)=>{
        gameHandler.keyStates[e.key] = 0;
    }

    Util.$('gameScreen').onclick = (e)=>{
        gameHandler.players[gameHandler.clientPlayer].dieSelected = null;
    }
}

export function getGameHandler(){
    return gameHandler;
}