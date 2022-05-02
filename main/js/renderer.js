
let canvas; 
let ctx;
let universalScale = 1;
const planeSvg = "M368.79,152.65c-11.42,7.39-89.13,34.58-89.13,34.58l-34.33.29-31.5,1.79h-.94L207.38,284l.78.17c3.3.82,32.66,19.25,32.66,19.25s3.3,5.6,2.41,14.48-4.7,12.18-9.91,15.64-18.43,5.92-37.11,6.58-36-10.37-36-10.37-2.92-2.47-4.82-13.82a16.21,16.21,0,0,1,7.49-16.62l29.11-15-.38-1.38L185.55,189l-16.35-.18-49.71-2.05S29.8,159.44,21.94,141.11,29.54,124,29.54,124l96.11,1.44,35.56,3.66h.23c19.71.41,22.22-5.79,22.22-5.79s.86-13.93.63-32.94c-.2-15.93,11-15.15,14.69-14.48v-.06l.43-5.37-27.66.21a71.37,71.37,0,0,1-7.34-1.34s0,0,0,0l-.79,0,.5-.05c-3.52-1-4.58-2.29,7.7-3.28l23.9.11s3.61-21.62,9.06-.28l24.22.42s22.15.71,0,4.24l-27.17-.14.39,5.49c15.8-2,13.93,12,13.93,12s-.73,25.51-.55,35.29,23.75,5.72,23.75,5.72l34.07-3.58s79.55-.71,96.67-1S380.2,145.26,368.79,152.65Z";
let a = 0;

let smoke = [

]


onmessage = (e)=> {
    if(e.data.data[0] == 'setUp'){
        canvas = e.data.canvas;
        ctx = canvas.getContext('2d');
        resetTransform();
    }else{
        draw(e.data.data);
    }
    postMessage("done");
}

function draw(drawData){
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    for(let data of drawData ){
        switch(data[0]){
            case'drawBoard':
                drawBoard(data[1],data[2])
                drawLines(data[1]);
                break;
            case 'drawPlane':
                drawPlane(data[1],data[2])
                break;
           
        }
    }
}

function drawBoard(BoardDrawingData,tileDimensions){
    resetTransform();
    for(let key of Object.keys(BoardDrawingData) ){
        for(let i in BoardDrawingData[key]){
            let tile = BoardDrawingData[key][i];
            ctx.beginPath();
            if(i == 0){
                
                ctx.arc(0 ,0 ,tile.radius,0,2*Math.PI)
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = 5;
                ctx.stroke();
                continue;
            }
            
            let tilePath = new Path2D();
            tilePath.arc(tile.x ,tile.y ,tileDimensions.radius,0,2*Math.PI)
            
            ctx.strokeStyle = tileDimensions.regularColor;
            
            switch(tile.tileType){
                case '0Start':
                case '1Start':
                case '2Start':
                case '3Start':
                    ctx.fillStyle = playerColors(tile.tileType[0])
                break;
                    
                default:
                    ctx.fillStyle = '#555'
                    break;
            }
            

            ctx.lineWidth = tileDimensions.lineWidth;
            ctx.fill(tilePath);

            ctx.stroke(tilePath)
            ctx.closePath();

        }
        
    }    
}   

function drawLines(BoardDrawingData){
    for(let key of Object.keys(BoardDrawingData) ){
        
    }
}

function drawPlane(planeDataList,planeDimensions){
    for(let planeData of planeDataList){
        let plane = new Path2D(planeSvg);
        let svgSize = 400;
        let scaleX = planeDimensions.width/svgSize
        let scaleY = planeDimensions.height/svgSize
        let ang = planeData.angle;

        speed = 2*Math.PI* (1/planeData.tilesInCycle)/10;
        
        planeData.x = planeData.radius * Math.cos(ang);
        planeData.y = planeData.radius * Math.sin(ang);
    
        let shadowX = (planeData.radius+30) * Math.cos(ang);
        let shadowY = (planeData.radius+30) * Math.sin(ang);
        let shadowScaleX = 1.1;
        let shadowScaleY = 1.1;
    
    
        ctx.setTransform(scaleX*universalScale*shadowScaleX,0,0,scaleY*universalScale*shadowScaleY,canvas.width/2+shadowX,canvas.height/2+shadowY)
        ctx.rotate(planeData.angle + Math.PI);
        ctx.translate(-svgSize/2,-svgSize/2)
        
        ctx.fillStyle = planeData.color+",0.2)"
        ctx.fill(plane);

        ctx.setTransform(scaleX*universalScale,0,0,scaleY*universalScale,canvas.width/2+planeData.x,canvas.height/2+planeData.y)
        ctx.rotate(planeData.angle + Math.PI);
        ctx.translate(-svgSize/2,-svgSize/2)
        
        ctx.fillStyle = planeData.color;
        ctx.fill(plane);
    
        
        resetTransform();
    }
 
    
}

function resetTransform(){
    ctx.setTransform(universalScale, 0, 0, universalScale, canvas.width/2, canvas.height/2);
}

function getSVGpath(modell){
    switch(modell){
        case '1':
            return "M368.79,152.65c-11.42,7.39-89.13,34.58-89.13,34.58l-34.33.29-31.5,1.79h-.94L207.38,284l.78.17c3.3.82,32.66,19.25,32.66,19.25s3.3,5.6,2.41,14.48-4.7,12.18-9.91,15.64-18.43,5.92-37.11,6.58-36-10.37-36-10.37-2.92-2.47-4.82-13.82a16.21,16.21,0,0,1,7.49-16.62l29.11-15-.38-1.38L185.55,189l-16.35-.18-49.71-2.05S29.8,159.44,21.94,141.11,29.54,124,29.54,124l96.11,1.44,35.56,3.66h.23c19.71.41,22.22-5.79,22.22-5.79s.86-13.93.63-32.94c-.2-15.93,11-15.15,14.69-14.48v-.06l.43-5.37-27.66.21a71.37,71.37,0,0,1-7.34-1.34s0,0,0,0l-.79,0,.5-.05c-3.52-1-4.58-2.29,7.7-3.28l23.9.11s3.61-21.62,9.06-.28l24.22.42s22.15.71,0,4.24l-27.17-.14.39,5.49c15.8-2,13.93,12,13.93,12s-.73,25.51-.55,35.29,23.75,5.72,23.75,5.72l34.07-3.58s79.55-.71,96.67-1S380.2,145.26,368.79,152.65Z";
    }
}

function playerColors(index){
    switch(index){
        case '0':
            return "#A416DB";
        case '1':
            return "#DB5F00"
        case '2':
            return "#16C4DB"
        case '3':
            return "#A2DB18";
            
    }
}