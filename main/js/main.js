import * as Util from './utility.js';
const canvas = Util.$('boardScreen');
const progressbar = Util.$('progressBar');
//const ctx = canvas.getContext('2d');

// gamedata that will end up in json

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

let plane = [
    {
        x:0,
        y:0,
        radius:500,
        tilesPerCycle:1,
        angOffset:0,
        color: "rgba(0, 0, 180"
    },
    {
        x:0,
        y:0,
        radius:150,
        tilesPerCycle:1,
        angOffset:2,
        color: "rgba(180, 0, 0"
    },
    {
        x:0,
        y:0,
        radius:500,
        tilesPerCycle:1,
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


function update(){

}

window.onload = () =>{
    //set up
    updateScreenDimensions(1200,1200)
    BoardDrawingData = createBoard(  [{radius: 500, tiles:36, circleLayer:'outer' },
                                      {radius: 330, tiles:18, circleLayer:'middle'},
                                      {radius: 150, tiles:9, circleLayer:'inner'  }   ]  
                                      ,BoardDrawingData
                                  );    
    
    //console.log(BoardDrawingData['outerTiles'][1].x );
    plane.x = BoardDrawingData['outerTiles'][1].x;  
    plane.y = BoardDrawingData['outerTiles'][1].y; 



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
    
    setInterval( ()=>{update()},1000/60)
    setInterval( ()=>{draw(renderWorker)},1000/60)
}

function draw(renderWorker){
    renderWorker.postMessage( 
        {
            data:[
                ['drawBoard',BoardDrawingData,tileDimensions],
                ['drawPlane',plane,planeDimensions],
            ]
        }
    )
}
