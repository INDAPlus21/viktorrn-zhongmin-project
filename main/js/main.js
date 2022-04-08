import * as Util from './utility.js';
const canvas = Util.$('boardScreen');
const ctx = canvas.getContext('2d');

let BoardData = {
    innerTiles : [],
    middleTiles: [],
    outerTiles: []
}

function updateScreenDimensions(width,height){
    canvas.width = width;
    canvas.height = height;
}

window.onload = () =>{
    updateScreenDimensions(1200,1200)
    BoardData = createBoard(  [{radius: 500, tiles:21, tileHeight: 90, circleLayer:'outer'},
                               {radius: 300, tiles:11, tileHeight: 70, circleLayer:'middle'},
                               {radius: 150, tiles:6, tileHeight: 50, circleLayer:'inner'  }   ]  ,BoardData);    
    drawBoard(BoardData)
    console.log(BoardData)
}

function createBoard(layers,BoardData){ 
    for(let layer of layers){
        let tileAmount = 2*layer.tiles;
        let radius = layer.radius;
        let tileHeight = layer.tileHeight;
        for(let step = 0; step < tileAmount; step+=2){
    
            let ang1 = 2*Math.PI * step/tileAmount;
            let ang2 = 2*Math.PI * (step+1)/tileAmount;
    
            let ix1 = canvas.width/2 + radius*Math.cos(ang1);
            let iy1 = canvas.height/2 + radius*Math.sin(ang1);
            
            let ix2 = canvas.width/2 + radius*Math.cos(ang2);
            let iy2 = canvas.height/2 + radius*Math.sin(ang2);
    
            let ox1 = canvas.width/2 + (radius+tileHeight)*Math.cos(ang1);
            let oy1 = canvas.height/2 + (radius+tileHeight)*Math.sin(ang1);
    
            let ox2 = canvas.width/2 + (radius+tileHeight)*Math.cos(ang2);
            let oy2 = canvas.height/2 + (radius+tileHeight)*Math.sin(ang2);
    
            let tileRegion = new Path2D();
            tileRegion.moveTo(ix1, iy1);
            tileRegion.lineTo(ix2, iy2);
            tileRegion.lineTo(ox2, oy2);
            tileRegion.lineTo(ox1, oy1);
            tileRegion.lineTo(ix1, iy1);
            tileRegion.closePath();
    
            BoardData[layer.circleLayer+'Tiles'].push(tileRegion);
    
        }
    }
   
    return BoardData;
}

function drawBoard(BoardData){
    for(let tile of BoardData['innerTiles']){
        ctx.fillStyle = 'white';
        ctx.fill(tile);
    }
    for(let tile of BoardData['middleTiles']){
        ctx.fillStyle = 'white';
        ctx.fill(tile);
    }
    for(let tile of BoardData['outerTiles']){
        ctx.fillStyle = 'white';
        ctx.fill(tile);
    }
    
}    