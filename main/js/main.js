import * as Util from './utility.js';
const canvas = Util.$('boardScreen');
const progressbarDOM = Util.$('progressBar');
const updateRateDOM = Util.$('updatesPerSecond');
const radiuses = [170,340,510];
const tileAmounts = [9,18,36];
//const ctx = canvas.getContext('2d');



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
      {<O>}====||==||[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]}--o
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

let debugHandler = {
    currentDateTime: new Date(),
    timeSinceLastUpdate: 0,
    frameBuffer: [],
    delta:1,

}

let gameHandler = {
    layerAngleSpeeds:[],
    seccondsPerCycle:5,
    timerValue:0,

    radiuses:[170,340,510],
    tileAmounts:[9,18,36],

    pause:false,
    dispFPS:true,
    players:[],
    planes: [],

    keyStates:{

    }
    

}

let tileDimensions = {
    radius:12,
    lineWidth: 3,
    regularColor: "#ccc",
    highlightColor: "white"
}

let planeDimensions = {
    width:100,
    height:100,
}

let BoardData = {
    innerTiles : [],
    middleTiles: [],
    outerTiles: []
}


    


let camera = {
    
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

function createBoard(layers,BoardData){ 
    for(let layer of layers){
        let tileAmount = layer.tiles;
        let radius = layer.radius;
        let ring = {
            type:'ringOutline',
            x: 0,
            y: 0,
            radius: radius,
        }
        BoardData[layer.circleLayer+'Tiles'].push(ring);
        
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
            }
            BoardData[layer.circleLayer+'Tiles'].push(tile);
    
        }
    }
    let j = 0;
    for(let i in BoardData['outerTiles']){
        if(i == 0) continue; 
        let tile = BoardData['outerTiles'][i];
        if( (i-1)%(9) == 0 ){
            tile.tileType = j+'Start';
            j+=1;
        }
    }
   
    return BoardData;
}



// update stuff
function draw(renderWorker){
   
    renderWorker.postMessage( 
        {
            data:[
                ['drawBoard',BoardData,tileDimensions],
                ['drawPlane',gameHandler.planes,planeDimensions],
            ]
        }
    )
}

function updatePlane(planes){
    /*for(let i in gameHandler.linInterpolations){
        let linList = gameHandler.linInterpolations[i];
        if(linList.length == 0) continue;
        for(let j in linList){
            let lins = linList[j];
            if(lins == null || undefined) continue;
            if(lins.time <= 0) 
            {
                gameHandler.linInterpolations[i][j] = null;
                continue;
            }
           
            lins.time -= debugHandler.delta;
            planes[lins.plane][lins.key] = Util.linInterp(lins.a,lins.b,lins.time);
            
        }
        
    }*/

    for(let p of planes){

        p.angle += (Math.PI*2)/gameHandler.seccondsPerCycle*debugHandler.delta*(tileAmounts[0]/p.tilesInCycle)
        p.angle = p.angle%(Math.PI*2)
        
    }
    return planes;
}

function update(renderWorker){
    var currentTime = new Date();
    currentTime = currentTime.getTime();
    debugHandler.delta = (currentTime - debugHandler.timeSinceLastUpdate)/1000;
    
    const now = performance.now();
    while (debugHandler.frameBuffer.length > 0 && debugHandler.frameBuffer[0] <= now - 1000) 
    {
        debugHandler.frameBuffer.shift();  
    }
    debugHandler.frameBuffer.push(now);
    updateRateDOM.innerHTML = "FPS: " + debugHandler.frameBuffer.length  ;

    if(!gameHandler.pause)
    {
        gameHandler.planes = updatePlane(gameHandler.planes)
        
        gameHandler.timerValue += debugHandler.delta/gameHandler.seccondsPerCycle;
        if(gameHandler.timerValue >= 1){
            gameHandler.timerValue = 0;
        }
    }
    
    debugHandler.timeSinceLastUpdate = currentTime;
    progressbarDOM.value = gameHandler.timerValue;
    
    draw(renderWorker)

}

window.onload = () =>{
    
    
    //set up
    updateScreenDimensions(1200,1200)
    BoardData = createBoard(  [
        {radius: 510, tiles:36, circleLayer:'outer' },
        {radius: 340, tiles:18, circleLayer:'middle'},
        {radius: 170, tiles:9, circleLayer:'inner'  }],
        BoardData
        );    
    
    //console.log(BoardData['outerTiles'][1].x );
 

    gameHandler.layerAngleSpeeds = calcLayerAngleSpeeds(tileAmounts,radiuses);
    var offscreen = canvas.transferControlToOffscreen();
    let renderWorker = new Worker('js/renderer.js'); 
    
    renderWorker.postMessage( 
        {canvas: offscreen,
            data:[
                ['setUp'],
            ]
        },
        [offscreen]
    )
    renderWorker.onmessage = (e) =>{
        update(renderWorker);
    }
   
    window.onkeydown = (e)=>{
       gameHandler.keyStates[e] = 1;

        switch(e.key){
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
        gameHandler.keyStates[e] = 0;
    }
}


