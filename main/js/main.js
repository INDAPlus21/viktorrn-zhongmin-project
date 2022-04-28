import * as Util from './utility.js';
const canvas = Util.$('boardScreen');
const progressbarDOM = Util.$('progressBar');
const updateRateDOM = Util.$('updatesPerSecond');
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
         I        // //O==---====ooooOOOO[o][o][o][o]OOOOOOoooo>>>>--....              // // 
        //      //    //    \ - /     O     [o]   [o]                [][][]OOoo.......// //--.. 
      {<O>}====||==||[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]}--o
        \\      \\    \\    / - \     O     [o]   [o]                [][][]OOoo¨¨¨¨¨¨¨\\ \\--¨¨  
         I        \\ \\O==---====ooooOOOO[o][o][o][o]OOOOOOoooo>>>>--¨¨¨¨              \\ \\ 
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

let BoardDrawingData = {
    innerTiles : [],
    middleTiles: [],
    outerTiles: []
}

let planes = [
    {
        x:0,
        y:0,
        radius:510,
        tilesInCycle:36,
        angOffset:0,
        color: "rgba(0, 0, 180"
    },
    {
        x:0,
        y:0,
        radius:170,
        tilesInCycle:1,
        angOffset:2,
        color: "rgba(180, 0, 0"
    },
    {
        x:0,
        y:0,
        radius:510,
        tilesInCycle:36,
        angOffset:3.7,
        color: "rgba(0, 100, 0"
    },
]
    


let camera = {
    
}

// preload stuff

function updateScreenDimensions(width,height){
    canvas.width = width;
    canvas.height = height;
}

function createBoard(layers,BoardDrawingData){ 
    for(let layer of layers){
        let tileAmount = layer.tiles;
        let radius = layer.radius;
        let ring = {
            type:'ringOutline',
            x: 0,//canvas.width/2,
            y: 0,//canvas.height/2,
            radius: radius,
        }
        BoardDrawingData[layer.circleLayer+'Tiles'].push(ring);
        for(let step = 0; step < tileAmount; step++){  
            let ang1 = 2*Math.PI * step/tileAmount;
            let x =  radius*Math.cos(ang1); // canvas.width/2
            let y =  radius*Math.sin(ang1); ///canvas.height/2 +
            let tile = {
                type:'tile',
                x:x,
                y:y,
                angle:ang1,
            }
            BoardDrawingData[layer.circleLayer+'Tiles'].push(tile);
    
        }
    }
   
    return BoardDrawingData;
}



// update stuff
function draw(renderWorker){
   
    renderWorker.postMessage( 
        {
            data:[
                ['drawBoard',BoardDrawingData,tileDimensions],
                ['drawPlane',planes,planeDimensions],
            ]
        }
    )
}

function updatePlane(planes){
    for(let p in planes){
        
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
    updateRateDOM.innerHTML = "Update time: " + debugHandler.frameBuffer.length  ;

    debugHandler.timeSinceLastUpdate = currentTime;
    planes = updatePlane(planes)
    draw(renderWorker)
    
      
     
  
}

window.onload = () =>{
    
    
    //set up
    updateScreenDimensions(1200,1200)
    BoardDrawingData = createBoard(  [
        {radius: 510, tiles:36, circleLayer:'outer' },
         {radius: 340, tiles:18, circleLayer:'middle'},
         {radius: 170, tiles:9, circleLayer:'inner'  }],
          BoardDrawingData
        );    
    
    //console.log(BoardDrawingData['outerTiles'][1].x );
    planes.x = BoardDrawingData['outerTiles'][1].x;  
    planes.y = BoardDrawingData['outerTiles'][1].y; 

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
   

    //setInterval( ()=>{update(renderWorker)},2)
    //setInterval( ()=>{draw(renderWorker)},1000/60)
}


