import * as Util from './utility.js';
const canvas = Util.$('boardScreen');
const ctx = canvas.getContext('2d');

let tileDimensions = {
    radius:9,
    lineWidth: 3,
    regularColor: "grey",
    highlightColor: "white"
}

let BoardData = {
    innerTiles : [],
    middleTiles: [],
    outerTiles: []
}

let plane = {
    x:0,
    y:0,
    tilesPerCycle:0
}

function updateScreenDimensions(width,height){
    canvas.width = width;
    canvas.height = height;
}

window.onload = () =>{
    updateScreenDimensions(1200,1200)
    BoardData = createBoard(  [{radius: 500, tiles:36, circleLayer:'outer'},
                               {radius: 330, tiles:18, circleLayer:'middle'},
                               {radius: 150, tiles:9, circleLayer:'inner'  }   ]  ,BoardData);    
    drawBoard(BoardData)
    console.log(BoardData)
    setInterval(update(),1000/60)
}

function createBoard(layers,BoardData){ 
    for(let layer of layers){
        let tileAmount = layer.tiles;
        let radius = layer.radius;
        let ring = new Path2D();
        ring.arc(canvas.width/2 ,canvas.height/2 ,radius,0,2*Math.PI)
        BoardData[layer.circleLayer+'Tiles'].push(ring);
        for(let step = 0; step < tileAmount; step++){
    
            let ang1 = 2*Math.PI * step/tileAmount;
            let ix1 = canvas.width/2 + radius*Math.cos(ang1);
            let iy1 = canvas.height/2 + radius*Math.sin(ang1);
            
    
            let tile = new Path2D();
            tile.arc(ix1,iy1,tileDimensions.radius,0,2*Math.PI);
    
            BoardData[layer.circleLayer+'Tiles'].push(tile);
    
        }
    }
   
    return BoardData;
}

function drawBoard(){
    for(let key of Object.keys(BoardData) ){
        console.log(key)
        for(let tile in BoardData[key]){
            if(tile == 0){
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = 5;
                ctx.stroke(BoardData[key][tile]);
                continue;
            }
            ctx.strokeStyle = '#ddd';
            ctx.fillStyle = '#555'
            ctx.lineWidth = tileDimensions.lineWidth;
            ctx.fill(BoardData[key][tile]);
            ctx.stroke(BoardData[key][tile])
        }
    }    
}    

function drawPlane(plane){

}

function calcPlanePosition(plane){

}

function update(){

}